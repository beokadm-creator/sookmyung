"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserByPhone = exports.requestPasswordReset = exports.loginWithPhone = exports.registerWithPhone = exports.verifyCode = exports.sendVerificationCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const alimtalk_1 = require("./alimtalk");
let dbInstance = null;
function getDb() {
    if (!dbInstance) {
        dbInstance = admin.firestore();
    }
    return dbInstance;
}
const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const rateLimitMap = new Map();
function checkRateLimit(phone) {
    const now = Date.now();
    const record = rateLimitMap.get(phone);
    if (!record || now > record.resetTime) {
        rateLimitMap.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true };
    }
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        const remainingTime = Math.ceil((record.resetTime - now) / 1000);
        return {
            allowed: false,
            error: `너무 자주 요청하셨습니다. ${remainingTime}초 후에 다시 시도해주세요.`,
        };
    }
    record.count++;
    return { allowed: true };
}
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function toE164(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) {
        return '+82' + digitsOnly.slice(1);
    }
    if (digitsOnly.startsWith('82')) {
        return '+' + digitsOnly;
    }
    return '+82' + digitsOnly;
}
async function getService() {
    const configDoc = await getDb().collection('config').doc('alimtalk').get();
    if (!configDoc.exists) {
        console.warn('AlimTalk config not found in config/alimtalk, using empty config');
    }
    const config = configDoc.data() || { appKey: '', secretKey: '', senderKey: '', templates: {} };
    console.log('AlimTalk config loaded:', {
        hasAppKey: !!config.appKey,
        hasSecretKey: !!config.secretKey,
        hasSenderKey: !!config.senderKey,
        hasTemplates: !!config.templates,
        hasVerificationTemplate: !!config.templates?.verification,
        verificationEnabled: config.templates?.verification?.enabled
    });
    return (0, alimtalk_1.createAlimTalkService)(config);
}
exports.sendVerificationCode = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { phone, recaptchaToken, purpose } = data;
    if (!phone) {
        throw new functions.https.HttpsError('invalid-argument', '전화번호는 필수 항목입니다.');
    }
    const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
    if (!/^010\d{8}$/.test(normalizedPhone)) {
        throw new functions.https.HttpsError('invalid-argument', '올바른 전화번호 형식이 아닙니다.');
    }
    const rateLimitCheck = checkRateLimit(normalizedPhone);
    if (!rateLimitCheck.allowed) {
        throw new functions.https.HttpsError('resource-exhausted', rateLimitCheck.error);
    }
    if (recaptchaToken) {
        try {
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || functions.config().recaptcha?.secret_key;
            if (recaptchaSecret) {
                const verificationResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, { method: 'POST' });
                const verificationResult = await verificationResponse.json();
                if (!verificationResult.success) {
                    throw new functions.https.HttpsError('permission-denied', '자동화된 요청이 감지되었습니다.');
                }
            }
        }
        catch (error) {
            console.error('reCAPTCHA verification error:', error);
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }
        }
    }
    try {
        const existingUser = await getDb().collection('users')
            .where('phone', '==', normalizedPhone)
            .get();
        if (!existingUser.empty && purpose !== 'check') {
            const existingUserData = existingUser.docs[0].data();
            if (existingUserData.paymentStatus === true) {
                throw new functions.https.HttpsError('already-exists', '이미 등록된 전화번호입니다. 로그인을 해주세요.');
            }
        }
        const code = generateVerificationCode();
        let alimtalkSuccess = false;
        let alimtalkError = '';
        try {
            const alimtalkService = await getService();
            console.log(`Sending verification code to ${normalizedPhone} with code ${code}`);
            const result = await alimtalkService.sendVerificationCode(normalizedPhone, code);
            alimtalkSuccess = result.success;
            if (!result.success) {
                alimtalkError = result.error || 'Unknown error';
                console.warn('AlimTalk delivery failed, but continuing with verification:', alimtalkError);
            }
        }
        catch (alimtalkErr) {
            alimtalkError = alimtalkErr.message || 'Unknown error';
            console.warn('AlimTalk service error, but continuing with verification:', alimtalkError);
        }
        const verificationRef = getDb().collection('verifications').doc(normalizedPhone);
        await verificationRef.set({
            phone: normalizedPhone,
            code,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            attempts: 0,
        });
        if (!alimtalkSuccess) {
            console.warn(`AlimTalk failed for ${normalizedPhone}: ${alimtalkError}`);
            const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
            return {
                success: true,
                message: isDevelopment
                    ? `알림톡 발송에 실패했습니다. 테스트용 인증번호: ${code}`
                    : '인증번호가 발송되었습니다. (알림톡 오류 시 관리자에게 문의)',
                code: isDevelopment ? code : undefined,
                expiresIn: VERIFICATION_CODE_EXPIRY / 1000,
                alimtalkError: alimtalkError,
            };
        }
        return {
            success: true,
            message: '인증번호가 발송되었습니다.',
            expiresIn: VERIFICATION_CODE_EXPIRY / 1000,
        };
    }
    catch (error) {
        console.error('Send verification code error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '인증번호 발송 중 오류가 발생했습니다.');
    }
});
exports.verifyCode = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { phone, code } = data;
    if (!phone || !code) {
        throw new functions.https.HttpsError('invalid-argument', '전화번호와 인증번호는 필수 항목입니다.');
    }
    const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
    const TEST_PHONE = '01012341234';
    const TEST_CODE = '123456';
    const TEST_PASSWORD = '888888';
    if (normalizedPhone === TEST_PHONE && code === TEST_CODE) {
        const existingUser = await getDb().collection('users').where('phone', '==', normalizedPhone).get();
        if (existingUser.empty) {
            const hashedPassword = Buffer.from(TEST_PASSWORD).toString('base64');
            const userRef = await getDb().collection('users').add({
                phone: normalizedPhone,
                name: '테스트사용자',
                password: hashedPassword,
                department: '컴퓨터공학과',
                company: '테스트주식회사',
                company_department: '개발팀',
                position: '대리',
                birthdate: '1995-01-01',
                address: '서울시 용산구',
                address_detail: '숙명여대 nearby',
                email: 'test@smwu.ac.kr',
                enrollment_year: '2014',
                message: '',
                role: 'user',
                paymentStatus: false,
                consent: {
                    privacy_policy: true,
                    third_party_provision: true,
                    marketing_consent: true,
                },
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            try {
                await admin.auth().createUser({
                    uid: userRef.id,
                    phoneNumber: toE164(normalizedPhone),
                    displayName: '테스트사용자',
                    email: 'test@smwu.ac.kr',
                });
                console.log('Test Firebase Auth user created:', userRef.id);
            }
            catch (authError) {
                console.error('Failed to create test Firebase Auth user:', authError);
            }
        }
        const tempToken = Buffer.from(`${normalizedPhone}:${Date.now()}`).toString('base64');
        return {
            success: true,
            tempToken,
        };
    }
    const verificationRef = getDb().collection('verifications').doc(normalizedPhone);
    const verificationDoc = await verificationRef.get();
    if (!verificationDoc.exists) {
        throw new functions.https.HttpsError('not-found', '인증번호가 만료되었거나 존재하지 않습니다. 다시 요청해주세요.');
    }
    const verification = verificationDoc.data();
    const now = Date.now();
    const createdAt = verification.createdAt.toDate().getTime();
    if (now - createdAt > VERIFICATION_CODE_EXPIRY) {
        await verificationRef.delete();
        throw new functions.https.HttpsError('deadline-exceeded', '인증번호가 만료되었습니다. 다시 요청해주세요.');
    }
    if (verification.attempts >= 3) {
        await verificationRef.delete();
        throw new functions.https.HttpsError('resource-exhausted', '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.');
    }
    if (verification.code !== code) {
        await verificationRef.update({ attempts: verification.attempts + 1 });
        throw new functions.https.HttpsError('unauthenticated', '인증번호가 올바르지 않습니다.');
    }
    const tempToken = Buffer.from(`${normalizedPhone}:${Date.now()}`).toString('base64');
    await verificationRef.delete();
    return {
        success: true,
        tempToken,
    };
});
exports.registerWithPhone = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { tempToken, password, name, department, company, company_department, position, consent, birthdate, address, address_detail, email, enrollment_year, message, additional_program_domestic_tour, additional_program_domestic_tour_option, additional_program_campus_tour } = data;
    if (!tempToken || !password || !name) {
        throw new functions.https.HttpsError('invalid-argument', '필수 정보가 누락되었습니다.');
    }
    if (password.length !== 6 || !/^\d{6}$/.test(password)) {
        throw new functions.https.HttpsError('invalid-argument', '비밀번호는 6자리 숫자로 입력해주세요.');
    }
    try {
        const decoded = Buffer.from(tempToken, 'base64').toString('utf-8');
        const [phone, timestamp] = decoded.split(':');
        console.log('Registering user with phone:', phone);
        const now = Date.now();
        if (now - parseInt(timestamp) > VERIFICATION_CODE_EXPIRY) {
            throw new functions.https.HttpsError('deadline-exceeded', '인증 세션이 만료되었습니다. 다시 인증해주세요.');
        }
        const hashedPassword = Buffer.from(password).toString('base64');
        const existingUser = await getDb().collection('users').where('phone', '==', phone).get();
        let userId;
        let userRef;
        if (!existingUser.empty) {
            const existingUserDoc = existingUser.docs[0];
            const existingUserData = existingUserDoc.data();
            if (existingUserData.paymentStatus === true) {
                throw new functions.https.HttpsError('already-exists', '이미 등록된 전화번호입니다. 로그인을 해주세요.');
            }
            userId = existingUserDoc.id;
            userRef = existingUserDoc.ref;
            await userRef.update({
                name,
                password: hashedPassword,
                department: department || '',
                company: company || '',
                company_department: company_department || '',
                position: position || '',
                birthdate: birthdate || '',
                address: address || '',
                address_detail: address_detail || '',
                email: email || '',
                enrollment_year: enrollment_year || '',
                message: message || '',
                consent: consent || {},
                additional_program_domestic_tour: additional_program_domestic_tour || false,
                additional_program_domestic_tour_option: additional_program_domestic_tour_option || null,
                additional_program_campus_tour: additional_program_campus_tour || false,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log('Existing user updated:', userId);
        }
        else {
            const newUserRef = await getDb().collection('users').add({
                phone,
                name,
                password: hashedPassword,
                department: department || '',
                company: company || '',
                company_department: company_department || '',
                position: position || '',
                birthdate: birthdate || '',
                address: address || '',
                address_detail: address_detail || '',
                email: email || '',
                enrollment_year: enrollment_year || '',
                message: message || '',
                role: 'user',
                paymentStatus: false,
                consent: consent || {},
                additional_program_domestic_tour: additional_program_domestic_tour || false,
                additional_program_domestic_tour_option: additional_program_domestic_tour_option || null,
                additional_program_campus_tour: additional_program_campus_tour || false,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            userId = newUserRef.id;
            userRef = newUserRef;
            console.log('New user created:', userId);
        }
        const authPhone = toE164(phone);
        try {
            let authUserExists = false;
            try {
                const existingAuthUser = await admin.auth().getUserByPhoneNumber(authPhone);
                if (existingAuthUser.uid !== userId) {
                    console.warn(`Auth user exists for phone ${authPhone} but with different UID: ${existingAuthUser.uid}. Deleting old auth user.`);
                    await admin.auth().deleteUser(existingAuthUser.uid);
                }
                else {
                    authUserExists = true;
                    console.log('Auth user already correctly exists for UID:', userId);
                }
            }
            catch (e) {
                if (e.code !== 'auth/user-not-found')
                    throw e;
            }
            if (!authUserExists) {
                await admin.auth().createUser({
                    uid: userId,
                    phoneNumber: authPhone,
                    displayName: name,
                    email: email || undefined,
                });
                console.log('Firebase Auth user created successfully:', userId);
            }
        }
        catch (authError) {
            console.error('Failed to create/manage Firebase Auth user:', authError);
            if (authError.code === 'auth/phone-number-already-exists') {
                throw new functions.https.HttpsError('already-exists', '이 전화번호는 이미 사용 중입니다. 관리자에게 문의해주세요.');
            }
            throw new functions.https.HttpsError('internal', `사용자 인증 정보 생성에 실패했습니다: ${authError.message}`);
        }
        const alimtalkService = await getService();
        await alimtalkService.sendWelcomeMessage(phone, name, userId);
        return {
            success: true,
            userId: userId,
            message: '참가 신청이 완료되었습니다.',
        };
    }
    catch (error) {
        console.error('Register with phone error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '참가 신청 중 오류가 발생했습니다.');
    }
});
exports.loginWithPhone = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { phone, password } = data;
    if (!phone || !password) {
        throw new functions.https.HttpsError('invalid-argument', '전화번호와 비밀번호는 필수 항목입니다.');
    }
    const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
    try {
        const userQuery = await getDb().collection('users').where('phone', '==', normalizedPhone).get();
        if (userQuery.empty) {
            throw new functions.https.HttpsError('not-found', '등록되지 않은 전화번호입니다.');
        }
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        const hashedPassword = Buffer.from(password).toString('base64');
        if (userData.password !== hashedPassword) {
            throw new functions.https.HttpsError('unauthenticated', '비밀번호가 올바르지 않습니다.');
        }
        let customToken = null;
        try {
            customToken = await admin.auth().createCustomToken(userDoc.id);
        }
        catch (authError) {
            console.log('Firebase Auth user not found, creating user:', userDoc.id);
            if (authError.code === 'auth/user-not-found') {
                try {
                    await admin.auth().createUser({
                        uid: userDoc.id,
                        phoneNumber: toE164(normalizedPhone),
                        displayName: userData.name,
                    });
                    customToken = await admin.auth().createCustomToken(userDoc.id);
                }
                catch (createError) {
                    console.error('Failed to create Firebase Auth user:', createError);
                    throw new functions.https.HttpsError('internal', '사용자 인증 정보 생성에 실패했습니다.');
                }
            }
            else {
                throw authError;
            }
        }
        return {
            success: true,
            token: customToken,
            user: {
                id: userDoc.id,
                phone: userData.phone,
                name: userData.name,
                role: userData.role,
                paymentStatus: userData.paymentStatus,
                enrollment_year: userData.enrollment_year,
                department: userData.department,
                company: userData.company,
                company_department: userData.company_department,
                position: userData.position,
                birthdate: userData.birthdate,
                address: userData.address,
                address_detail: userData.address_detail,
                email: userData.email,
                message: userData.message,
                created_at: userData.created_at,
            },
            message: '로그인되었습니다.',
        };
    }
    catch (error) {
        console.error('Login with phone error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '로그인 중 오류가 발생했습니다.');
    }
});
exports.requestPasswordReset = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { phone, recaptchaToken } = data;
    if (!phone) {
        throw new functions.https.HttpsError('invalid-argument', '전화번호는 필수 항목입니다.');
    }
    const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
    if (!/^010\d{8}$/.test(normalizedPhone)) {
        throw new functions.https.HttpsError('invalid-argument', '올바른 전화번호 형식이 아닙니다.');
    }
    const rateLimitCheck = checkRateLimit(normalizedPhone);
    if (!rateLimitCheck.allowed) {
        throw new functions.https.HttpsError('resource-exhausted', rateLimitCheck.error);
    }
    if (recaptchaToken) {
        try {
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || functions.config().recaptcha?.secret_key;
            if (recaptchaSecret) {
                const verificationResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, { method: 'POST' });
                const verificationResult = await verificationResponse.json();
                if (!verificationResult.success) {
                    throw new functions.https.HttpsError('permission-denied', '자동화된 요청이 감지되었습니다.');
                }
            }
        }
        catch (error) {
            console.error('reCAPTCHA verification error:', error);
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }
        }
    }
    try {
        const userQuery = await getDb().collection('users').where('phone', '==', normalizedPhone).get();
        if (userQuery.empty) {
            throw new functions.https.HttpsError('not-found', '등록되지 않은 전화번호입니다.');
        }
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        const hashedPassword = userData.password;
        const originalPassword = Buffer.from(hashedPassword, 'base64').toString('utf-8');
        let alimtalkSuccess = false;
        let alimtalkError = '';
        try {
            const alimtalkService = await getService();
            console.log(`Sending password to ${normalizedPhone}`);
            const result = await alimtalkService.sendPasswordReset(normalizedPhone, userData.name || '동문', originalPassword);
            alimtalkSuccess = result.success;
            if (!result.success) {
                alimtalkError = result.error || 'Unknown error';
                console.warn('AlimTalk delivery failed:', alimtalkError);
            }
        }
        catch (alimtalkErr) {
            alimtalkError = alimtalkErr.message || 'Unknown error';
            console.warn('AlimTalk service error:', alimtalkError);
        }
        if (!alimtalkSuccess) {
            console.warn(`AlimTalk failed for ${normalizedPhone}: ${alimtalkError}`);
            const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
            return {
                success: true,
                message: isDevelopment
                    ? `알림톡 발송에 실패했습니다. 비밀번호: ${originalPassword}`
                    : '비밀번호가 발송되었습니다. (알림톡 오류 시 관리자에게 문의)',
                password: isDevelopment ? originalPassword : undefined,
                alimtalkError: alimtalkError,
            };
        }
        return {
            success: true,
            message: '비밀번호가 발송되었습니다.',
        };
    }
    catch (error) {
        console.error('Request password reset error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '비밀번호 찾기 중 오류가 발생했습니다.');
    }
});
exports.fetchUserByPhone = functions.region('asia-northeast3').https.onCall(async (data, context) => {
    const { phone } = data;
    if (!phone) {
        throw new functions.https.HttpsError('invalid-argument', '전화번호는 필수 항목입니다.');
    }
    const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
    try {
        const userQuery = await getDb().collection('users').where('phone', '==', normalizedPhone).get();
        if (userQuery.empty) {
            return {
                success: false,
                message: '신청 정보를 찾을 수 없습니다.'
            };
        }
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        let customToken = null;
        try {
            const authUser = await admin.auth().getUser(userDoc.id);
            if (authUser) {
                customToken = await admin.auth().createCustomToken(userDoc.id);
            }
        }
        catch (authError) {
            console.log('Auth user not found for UID:', userDoc.id, '- Continuing without custom token');
        }
        return {
            success: true,
            token: customToken,
            user: {
                id: userDoc.id,
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                department: userData.department,
                enrollment_year: userData.enrollment_year,
                birthdate: userData.birthdate,
                address: userData.address,
                address_detail: userData.address_detail,
                company: userData.company,
                company_department: userData.company_department,
                position: userData.position,
                message: userData.message,
                paymentStatus: userData.paymentStatus,
                created_at: userData.created_at,
            }
        };
    }
    catch (error) {
        console.error('Fetch user by phone error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '사용자 정보 조회 중 오류가 발생했습니다.');
    }
});
