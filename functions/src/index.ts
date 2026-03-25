import * as functions from 'firebase-functions';
// Updated for deployment trigger
import * as admin from 'firebase-admin';
import axios from 'axios';
import cors from 'cors';

// Import phone authentication functions
import {
  sendVerificationCode,
  verifyCode,
  registerWithPhone,
  loginWithPhone,
  requestPasswordReset,
  fetchUserByPhone,
} from './phoneAuth';
import { createAlimTalkService, AlimTalkConfig } from './alimtalk';

// Re-export phone auth functions
export { sendVerificationCode, verifyCode, registerWithPhone, loginWithPhone, requestPasswordReset, fetchUserByPhone };

const corsHandler = cors({
  origin: [
    'https://smwu120th.or.kr',
    'https://www.smwu120th.or.kr',
    'https://sookmyung-97032.web.app',
    'https://sookmyung-97032.firebaseapp.com',
  ],
});

admin.initializeApp();

const db = admin.firestore();

// Alimtalk Service helper
async function getAlimtalkService() {
  try {
    const configDoc = await db.collection('config').doc('alimtalk').get();
    const config = configDoc.data() as AlimTalkConfig || { appKey: '', secretKey: '', senderKey: '', templates: {} };
    
    // Ensure templates object exists even if it's missing in DB
    if (!config.templates) {
      config.templates = {} as any;
    }
    
    return createAlimTalkService(config);
  } catch (error) {
    console.warn('Failed to load AlimTalk config:', error);
    // Return a dummy service that won't throw during send calls
    return createAlimTalkService({ 
      appKey: '', 
      secretKey: '', 
      senderKey: '', 
      templates: {} as any 
    });
  }
}

export const onUserCreated = functions.region('asia-northeast3').auth.user().onCreate(async (user) => {
  if (user.email === 'aaron@beoksolution.com') {
    try {
      await db.collection('users').doc(user.uid).set({
        role: 'admin',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`Auto-promoted ${user.email} to admin`);
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  }
});

export const confirmPayment = functions.region('asia-northeast3').https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Load Toss secret key from Firestore
      const siteConfigDoc = await db.collection('settings').doc('site_config').get();
      let tossSecretKey = process.env.TOSS_SECRET_KEY;

      if (!tossSecretKey && siteConfigDoc.exists) {
        tossSecretKey = siteConfigDoc.data().pg_config?.secretKey;
      }

      if (!tossSecretKey) {
        res.status(500).json({ success: false, error: '결제 시크릿 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' });
        return;
      }

      console.log('Secret key loaded successfully (prefix):', tossSecretKey.substring(0, 8) + '...');

      const { paymentKey, orderId, amount, userId: requestUserId } = req.body;

      if (!paymentKey || !orderId || !amount) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const requestedAmount = Number(amount);

      // Debug logging
      console.log('=== Payment Verification Debug ===');
      console.log('Requested amount:', requestedAmount);
      console.log('Today:', new Date().toISOString().split('T')[0]);

      const eventConfigDoc = await db.collection('config').doc('event_settings').get();
      let expectedAmount = null;

      if (eventConfigDoc.exists) {
        const eventData = eventConfigDoc.data();
        console.log('Event config data:', JSON.stringify(eventData, null, 2));

        // Only use price tiers, ignore registrationFee
        if (eventData?.priceTiers && Array.isArray(eventData.priceTiers)) {
          const today = new Date().toISOString().split('T')[0];
          console.log('Price tiers:', JSON.stringify(eventData.priceTiers, null, 2));

          const activeTier = eventData.priceTiers.find((tier: any) =>
            tier.active && today >= tier.startDate && today <= tier.endDate
          );

          console.log('Active tier:', activeTier ? JSON.stringify(activeTier, null, 2) : 'None found');

          if (activeTier) {
            expectedAmount = activeTier.amount;
          }
        }
      }

      console.log('Expected amount:', expectedAmount);

      if (expectedAmount === null) {
        console.log('ERROR: No active price tier found');
        res.status(400).json({
          success: false,
          error: '현재 설정된 기간별 등록비가 없습니다. 관리자에게 문의해주세요.'
        });
        return;
      }

      if (requestedAmount !== expectedAmount) {
        console.log(`ERROR: Amount mismatch. Expected: ${expectedAmount}, Received: ${requestedAmount}`);
        res.status(400).json({
          success: false,
          error: `결제 금액이 올바르지 않습니다. 예상 금액: ${expectedAmount.toLocaleString()}원, 요청 금액: ${requestedAmount.toLocaleString()}원`
        });
        return;
      }

      console.log('Amount verification passed!');

      const existingPayment = await db.collection('payments')
        .where('payment_key', '==', paymentKey)
        .where('status', '==', 'completed')
        .get();

      if (!existingPayment.empty) {
        res.json({ success: true, alreadyProcessed: true, paymentData: existingPayment.docs[0].data().payment_data });
        return;
      }

      const existingOrder = await db.collection('payments')
        .where('order_id', '==', orderId)
        .get();

      if (!existingOrder.empty) {
        res.status(400).json({ success: false, error: 'Duplicate order ID' });
        return;
      }

      const response = await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          paymentKey,
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'DONE' || response.data.status === 'IN_PROGRESS') {
        const paymentData = response.data;
        let userId = requestUserId;
        if (!userId && paymentData.customerKey && paymentData.customerKey.startsWith('user_')) {
          userId = paymentData.customerKey.replace('user_', '');
        }

        await db.runTransaction(async (transaction) => {
          if (userId) {
            const userRef = db.collection('users').doc(userId);
            transaction.update(userRef, {
              paymentStatus: true,
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          const paymentRef = db.collection('payments').doc();
          transaction.set(paymentRef, {
            user_id: userId || 'anonymous',
            payment_key: paymentKey,
            order_id: orderId,
            amount: requestedAmount,
            status: 'completed',
            payment_type: 'membership',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            payment_data: paymentData
          });
        });
        
        // Send 신청완료 Alimtalk
        if (userId) {
          try {
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            if (userData && userData.phone && userData.name) {
              const alimtalkService = await getAlimtalkService();
              await alimtalkService.sendWelcomeMessage(
                userData.phone,
                userData.name,
                requestedAmount,
                orderId
              );
            }
          } catch (alimtalkError) {
            console.error('Failed to send registration complete Alimtalk:', alimtalkError);
          }
        }

        res.json({ success: true, paymentData });
      } else {
        res.status(400).json({ success: false, error: 'Payment not completed' });
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      // Handle Toss API errors specifically
      if (error.response && error.response.data) {
        res.status(error.response.status).json({ success: false, error: error.response.data });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });
});

export const createAdmin = functions.region('asia-northeast3').https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, adminCode } = req.body;

    if (!email || !adminCode) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    if (adminCode !== 'SOOKMYUNG2024') {
      res.status(403).json({ error: 'Invalid admin code' });
      return;
    }

    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: 'Admin role granted successfully' });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



export const checkEmailDuplicate = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  const email = data.email;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    try {
      await admin.auth().getUserByEmail(email);
      return { exists: true, source: 'auth' };
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
    }

    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      return { exists: true, source: 'firestore' };
    }

    return { exists: false };
  } catch (error: any) {
    console.error('Check email duplicate error:', error);
    throw new functions.https.HttpsError('internal', 'Error checking email existence');
  }
});

export const requestWithdrawal = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const userId = context.auth.uid;
  const { reason } = data;

  if (!reason) {
    throw new functions.https.HttpsError('invalid-argument', '탈퇴 사유를 입력해주세요.');
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', '사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();

    const existingRequest = await db.collection('withdrawal_requests')
      .where('user_id', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (!existingRequest.empty) {
      throw new functions.https.HttpsError('already-exists', '이미 진행 중인 탈퇴 신청이 있습니다.');
    }

    const withdrawalRef = await db.collection('withdrawal_requests').add({
      user_id: userId,
      user_name: userData?.name || '',
      user_email: userData?.email || '',
      reason: reason,
      status: 'pending',
      requested_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send Refund Request Alimtalk
    try {
      if (userData && userData.phone && userData.name) {
        const paymentsSnapshot = await db.collection('payments')
          .where('user_id', '==', userId)
          .where('status', '==', 'completed')
          .get();
        let totalAmount = 0;
        let orderId = withdrawalRef.id;
        paymentsSnapshot.docs.forEach((doc: any) => {
          totalAmount += doc.data().amount || 0;
          if (doc.data().payment_key) orderId = doc.data().payment_key; // or anything else that signifies the order
        });
        
        if (totalAmount > 0) {
          const now = new Date();
          const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
          const formattedDate = `${kstDate.getMonth() + 1}월 ${kstDate.getDate()}일`;
          
          const alimtalkService = await getAlimtalkService();
          await alimtalkService.sendRefundRequest(
            userData.phone,
            userData.name,
            totalAmount,
            formattedDate
          );
        }
      }
    } catch (alimtalkError) {
      console.error('Failed to send refund request Alimtalk:', alimtalkError);
    }

    return {
      success: true,
      requestId: withdrawalRef.id,
      message: '탈퇴 신청이 접수되었습니다. 관리자 승인 후 처리됩니다.'
    };
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '탈퇴 신청 중 오류가 발생했습니다.');
  }
});

export const processWithdrawal = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { requestId, action, rejectReason } = data;

  if (!requestId || !action) {
    throw new functions.https.HttpsError('invalid-argument', '필수 파라미터가 누락되었습니다.');
  }

  try {
    const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = adminUserDoc.data();
    const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

    if (!adminUserDoc.exists || !isAdmin) {
      throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
    }

    const withdrawalRef = db.collection('withdrawal_requests').doc(requestId);
    const withdrawalDoc = await withdrawalRef.get();

    if (!withdrawalDoc.exists) {
      throw new functions.https.HttpsError('not-found', '탈퇴 신청을 찾을 수 없습니다.');
    }

    const withdrawalData = withdrawalDoc.data();

    if (withdrawalData?.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', '이미 처리된 요청입니다.');
    }

    if (action === 'approve') {
      // 0. Load Toss secret key from Firestore
      let tossSecretKey = process.env.TOSS_SECRET_KEY;
      try {
        const siteConfigDoc = await db.collection('settings').doc('site_config').get();
        if (!tossSecretKey && siteConfigDoc.exists) {
          tossSecretKey = siteConfigDoc.data().pg_config?.secretKey;
        }
      } catch (configError) {
        console.warn('Failed to load site config for Toss key:', configError);
      }

      if (!tossSecretKey) {
        throw new functions.https.HttpsError('failed-precondition', '결제 시크릿 키가 설정되지 않았습니다.');
      }

      // 1. Toss Payments 결제 취소 (먼저 결제 취소)
      try {
        // 사용자의 결제 정보 조회
        const paymentsSnapshot = await db.collection('payments')
          .where('user_id', '==', withdrawalData?.user_id)
          .where('status', '==', 'completed')
          .get();

        if (!paymentsSnapshot.empty) {
          // Toss Payments 취소 API 호출
          for (const paymentDoc of paymentsSnapshot.docs) {
            const paymentData = paymentDoc.data();
            const paymentKey = paymentData.payment_key;
            const cancelReason = `참가 취소 신청 (${withdrawalData?.reason})`;

            try {
              // Toss Payments 취소
              const tossResponse = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  cancelReason: cancelReason,
                }),
              });

              if (!tossResponse.ok) {
                const tossError = await tossResponse.json() as { code?: string; message?: string };
                console.error('Toss cancellation failed:', tossError);

                // 이미 취소된 경우는 계속 진행
                if (tossError.code !== 'ALREADY_CANCELED_PAYMENT') {
                  // 결제 취소 실패 시 로그만 남기고 계속 진행 (사용자 삭제는 계속 진행)
                  console.warn(`Payment cancellation warning: ${tossError.message}. Proceeding with user deletion.`);
                }
              }

              // 결제 상태 업데이트 (성공 또는 이미 취소된 경우)
              await paymentDoc.ref.update({
                status: 'cancelled',
                cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
                cancel_reason: cancelReason,
              });
            } catch (singlePaymentError: any) {
              console.error(`Failed to cancel payment:`, singlePaymentError);
            }

            // 1-1. Send Cancellation Alimtalk (Inside try block where paymentsSnapshot is defined)
            if (withdrawalData?.user_id) {
              try {
                const userDoc = await db.collection('users').doc(withdrawalData.user_id).get();
                const userData = userDoc.data();
                if (userData && userData.phone && userData.name) {
                  // Calculate total cancelled amount
                  let totalAmount = 0;
                  paymentsSnapshot.docs.forEach((doc: any) => {
                    totalAmount += doc.data().amount || 0;
                  });

                  if (totalAmount > 0) {
                    const alimtalkService = await getAlimtalkService();
                    await alimtalkService.sendRefundComplete(
                      userData.phone,
                      userData.name,
                      totalAmount
                    );
                  }
                }
              } catch (alimtalkErr) {
                console.error('Failed to send withdrawal cancellation Alimtalk:', alimtalkErr);
              }
            }
          }
        }
      } catch (paymentError: any) {
        // 결제 취소 실패 시에도 사용자 삭제는 진행 (로그만 남김)
        console.error('Payment cancellation error (continuing with user deletion):', paymentError);
        // 에러를 throw하지 않고 계속 진행
      }

      // 2. Firebase Auth 사용자 삭제
      await admin.auth().deleteUser(withdrawalData?.user_id);

      // 3. Firestore 사용자 문서 삭제
      await db.collection('users').doc(withdrawalData?.user_id).delete();

      // 4. 탈퇴 신청 상태 업데이트
      await withdrawalRef.update({
        status: 'approved',
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
        processed_by: context.auth.uid,
      });

      return { success: true, message: '참가 취소가 승인되었습니다. 결제 환불은 5-10일 내에 처리됩니다.' };
    } else if (action === 'reject') {
      await withdrawalRef.update({
        status: 'rejected',
        reject_reason: rejectReason || '',
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
        processed_by: context.auth.uid,
      });

      return { success: true, message: '탈퇴가 거절되었습니다.' };
    } else {
      throw new functions.https.HttpsError('invalid-argument', '잘못된 액션입니다.');
    }
  } catch (error: any) {
    console.error('Process withdrawal error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '탈퇴 처리 중 오류가 발생했습니다.');
  }
});

// ==================== TIMELINE CRUD ====================

export const getTimelines = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  try {
    const snapshot = await db.collection('timeline')
      .where('active', '==', true)
      .orderBy('displayOrder', 'asc')
      .get();

    const timelines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { timelines };
  } catch (error: any) {
    console.error('Get timelines error:', error);
    throw new functions.https.HttpsError('internal', '타임라인 조회 중 오류가 발생했습니다.');
  }
});

export const saveTimeline = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id, year, title, shortDesc, details, period, category, imageUrl, displayOrder, active } = data;

  if (!year || !title || !shortDesc || !details) {
    throw new functions.https.HttpsError('invalid-argument', '필수 필드가 누락되었습니다.');
  }

  try {
    const timelineData: any = {
      year,
      title,
      shortDesc,
      details,
      period,
      category,
      imageUrl,
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (id) {
      await db.collection('timeline').doc(id).update(timelineData);
    } else {
      timelineData.created_at = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('timeline').add(timelineData);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Save timeline error:', error);
    throw new functions.https.HttpsError('internal', '타임라인 저장 중 오류가 발생했습니다.');
  }
});

export const deleteTimeline = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id } = data;

  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'ID가 누락되었습니다.');
  }

  try {
    await db.collection('timeline').doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Delete timeline error:', error);
    throw new functions.https.HttpsError('internal', '타임라인 삭제 중 오류가 발생했습니다.');
  }
});

// ==================== GALLERY CRUD ====================

export const getGalleryItems = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  try {
    const { type } = data;

    let query = db.collection('gallery').where('active', '==', true);

    if (type && type !== 'all') {
      query = query.where('type', '==', type) as any;
    }

    const snapshot = await query.orderBy('displayOrder', 'asc').get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { items };
  } catch (error: any) {
    console.error('Get gallery items error:', error);
    throw new functions.https.HttpsError('internal', '갤러리 아이템 조회 중 오류가 발생했습니다.');
  }
});

export const saveGalleryItem = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id, type, title, description, thumbnailUrl, mediaUrl, videoId, displayOrder, active } = data;

  if (!type || !title || !mediaUrl) {
    throw new functions.https.HttpsError('invalid-argument', '필수 필드가 누락되었습니다.');
  }

  try {
    const galleryData: any = {
      type,
      title,
      description: description || '',
      thumbnailUrl: thumbnailUrl || mediaUrl,
      mediaUrl,
      videoId,
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (id) {
      await db.collection('gallery').doc(id).update(galleryData);
    } else {
      galleryData.created_at = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('gallery').add(galleryData);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Save gallery item error:', error);
    throw new functions.https.HttpsError('internal', '갤러리 아이템 저장 중 오류가 발생했습니다.');
  }
});

export const deleteGalleryItem = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id } = data;

  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'ID가 누락되었습니다.');
  }

  try {
    await db.collection('gallery').doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Delete gallery item error:', error);
    throw new functions.https.HttpsError('internal', '갤러리 아이템 삭제 중 오류가 발생했습니다.');
  }
});

// ==================== EVENTS CRUD ====================

export const getEvents = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  try {
    const { month } = data;

    let query = db.collection('events').where('active', '==', true);

    if (month && month !== '전체') {
      query = query.where('month', '==', month) as any;
    }

    const snapshot = await query.orderBy('date', 'asc').get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { events };
  } catch (error: any) {
    console.error('Get events error:', error);
    throw new functions.https.HttpsError('internal', '행사 조회 중 오류가 발생했습니다.');
  }
});

export const saveEvent = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id, title, date, month, time, location, description, capacity, registered, displayOrder, active } = data;

  if (!title || !date || !month || !time || !location || !description) {
    throw new functions.https.HttpsError('invalid-argument', '필수 필드가 누락되었습니다.');
  }

  try {
    const eventData: any = {
      title,
      date,
      month,
      time,
      location,
      description,
      capacity,
      registered,
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (id) {
      await db.collection('events').doc(id).update(eventData);
    } else {
      eventData.created_at = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('events').add(eventData);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Save event error:', error);
    throw new functions.https.HttpsError('internal', '행사 저장 중 오류가 발생했습니다.');
  }
});

export const deleteEvent = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { id } = data;

  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'ID가 누락되었습니다.');
  }

  try {
    await db.collection('events').doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Delete event error:', error);
    throw new functions.https.HttpsError('internal', '행사 삭제 중 오류가 발생했습니다.');
  }
});

// ==================== SITE CONFIG ====================

export const getSiteConfig = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  try {
    const docRef = db.collection('config').doc('site_settings');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { config: docSnap.data() };
    }

    // 기본 설정 반환
    return {
      config: {
        siteTitle: '숙명여자대학교 120주년 기념 동문회',
        siteDescription: '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.',
        targetDate: '2026-05-22T00:00:00',
        showGallery: true,
        showEvents: true,
        showTimeline: true
      }
    };
  } catch (error: any) {
    console.error('Get site config error:', error);
    throw new functions.https.HttpsError('internal', '사이트 설정 조회 중 오류가 발생했습니다.');
  }
});

export const saveSiteConfig = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const config = data;

  try {
    await db.collection('config').doc('site_settings').set({
      ...config,
      id: 'site_settings',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Save site config error:', error);
    throw new functions.https.HttpsError('internal', '사이트 설정 저장 중 오류가 발생했습니다.');
  }
});

// ==================== INITIAL DATA SEEDING ====================

export const initializeData = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  try {
    // Timeline 초기 데이터
    const timelineSnapshot = await db.collection('timeline').limit(1).get();

    if (timelineSnapshot.empty) {
      const initialTimelines = [
        { year: 1906, title: "대한제국 황실이 세운 최초의 민족 여성 사학", shortDesc: "순헌황귀비의 선각으로 한국 여성 교육의 새로운 장이 열렸습니다.", details: "숙명여자대학교의 설립은 대한제국 시기 여성 교육의 획기적인 시작이었습니다.", period: "1906년", category: "founding", displayOrder: 1, active: true },
        { year: 1938, title: "전문학교 설립", shortDesc: "숙명여자전문학교로 승격되며 전문 교육 기관으로 발돋움했습니다.", details: "일제강점기 속에서도 민족 교육의 맥을 이어갔습니다.", period: "1938년", category: "education", displayOrder: 2, active: true },
        { year: 1948, title: "대학승격, 피난지에 임시 교사 설치", shortDesc: "대학 승격과 함께 한국전쟁의 어려움 속에서도 교육을 이어갔습니다.", details: "부산 피난 시절에도 임시 교사를 마련하여 학생들을 가르쳤습니다.", period: "1948년", category: "expansion", displayOrder: 3, active: true },
        { year: 1955, title: "종합대학교 시대의 개막", shortDesc: "숙명여자대학교가 종합대학으로 승격하며 새로운 도약을 시작했습니다.", details: "인문, 사회, 자연, 예체능 등 다양한 학과가 설치되었습니다.", period: "1955년", category: "expansion", displayOrder: 4, active: true },
        { year: 1981, title: "새로운 전진을 위한 준비", shortDesc: "대학 시설 확충과 교육 과정 개선을 통해 질적 성장을 이루었습니다.", details: "도서관, 실험실 등 교육 환경이 대폭 개선되었습니다.", period: "1981년", category: "development", displayOrder: 5, active: true },
        { year: 1995, title: "숙명 제2창학", shortDesc: "대학 개혁을 통해 새로운 도약을 위한 기반을 마련했습니다.", details: "교육 시스템 혁신과 캠퍼스 현대화가 이루어졌습니다.", period: "1995년", category: "reform", displayOrder: 6, active: true },
        { year: 2006, title: "숙명 창학 100주년", shortDesc: "100년의 역사를 자랑하며 새로운 100년을 향한 비전을 제시했습니다.", details: "100주년 기념식과 다양한 학술 문화 행사가 열렸습니다.", period: "2006년", category: "milestone", displayOrder: 7, active: true },
        { year: 2015, title: "사회수요에 맞춘 교육개혁", shortDesc: "사회 변화에 부응하는 혁신적인 교육 과정을 도입했습니다.", details: "융합 교육, 창의적 인재 양성에 집중했습니다.", period: "2015년", category: "reform", displayOrder: 8, active: true },
        { year: 2023, title: "혁신적인 학제 개편", shortDesc: "미래 사회에 필요한 인재 양성을 위한 학제 개편을 단행했습니다.", details: "AI, 데이터 등 첨단 분야 교육이 강화되었습니다.", period: "2023년", category: "reform", displayOrder: 9, active: true },
        { year: 2026, title: "숙명 창학 120주년", shortDesc: "120년의 역사를 자랑하며 새로운 120년을 향해 나아갑니다.", details: "2026년 5월 22일 숙명창학기념일을 맞아 대규모 기념행사가 열립니다.", period: "2026년", category: "milestone", displayOrder: 10, active: true }
      ];

      for (const item of initialTimelines) {
        await db.collection('timeline').add({
          ...item,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Gallery 초기 데이터
    const gallerySnapshot = await db.collection('gallery').limit(1).get();

    if (gallerySnapshot.empty) {
      const initialGallery = [
        { type: 'photo', title: '초기 캠퍼스 모습', description: '1906년 숙명여자대학교의 초기 캠퍼스 모습', thumbnailUrl: '', mediaUrl: '/placeholder1.jpg', displayOrder: 1, active: true },
        { type: 'photo', title: '100주년 기념식', description: '2006년 숙명 창학 100주년 기념식', thumbnailUrl: '', mediaUrl: '/placeholder2.jpg', displayOrder: 2, active: true },
        { type: 'photo', title: '졸업식 사진', description: '1960년대 졸업식 모습', thumbnailUrl: '', mediaUrl: '/placeholder3.jpg', displayOrder: 3, active: true },
        { type: 'photo', title: '도서관', description: '중앙도서관 건립 기념사진', thumbnailUrl: '', mediaUrl: '/placeholder4.jpg', displayOrder: 4, active: true },
        { type: 'photo', title: '동문회 모임', description: '동문들의 축하 모임', thumbnailUrl: '', mediaUrl: '/placeholder5.jpg', displayOrder: 5, active: true },
        { type: 'photo', title: '캠퍼스 봄 풍경', description: '봄의 숙명 캠퍼스', thumbnailUrl: '', mediaUrl: '/placeholder6.jpg', displayOrder: 6, active: true },
        { type: 'video', title: '120주년 비전 선포 영상', description: '120주년 기념 비전 선포식 영상', thumbnailUrl: '', mediaUrl: '', videoId: 'SALwRCKxZEc', displayOrder: 7, active: true },
        { type: 'video', title: '숙명 120년 역사 다큐멘터리', description: '120년의 역사를 담은 다큐멘터리', thumbnailUrl: '', mediaUrl: '', videoId: '', displayOrder: 8, active: true },
        { type: 'video', title: '동문 축하 메시지', description: '동문들의 축하 메시지 영상', thumbnailUrl: '', mediaUrl: '', videoId: '', displayOrder: 9, active: true }
      ];

      for (const item of initialGallery) {
        await db.collection('gallery').add({
          ...item,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Events 초기 데이터
    const eventsSnapshot = await db.collection('events').limit(1).get();

    if (eventsSnapshot.empty) {
      const initialEvents = [
        { title: "120주년 기념식", date: "2026-05-10", month: "5월", time: "10:00 - 12:00", location: "숙명여자대학교 대강당", description: "120년의 역사를 축하하는 기념식입니다. 총장님의 축사, 동문 대표 축하 메시지, 기념 공연 등 다채로운 프로그램이 준비되어 있습니다.", capacity: 1000, registered: 456, displayOrder: 1, active: true },
        { title: "동문 네트워킹", date: "2026-05-11", month: "5월", time: "14:00 - 17:00", location: "학생회관 다목적실", description: "전공별, 졸업년도별 동문들과 소통하며 네트워크를 확장하는 시간입니다. 산하동문 후원금 전달식, 네트워킹 세션 등이 진행됩니다.", capacity: 300, registered: 178, displayOrder: 2, active: true },
        { title: "문화 행사", date: "2026-05-12", month: "5월", time: "10:00 - 18:00", location: "캠퍼스 전체", description: "공연, 전시, 체험 프로그램 등 다양한 문화 행사가 진행됩니다. 동문 예술가들의 초청 공연, 학생 동아리 공연, 특별 전시회 등을 만나보세요.", capacity: 500, registered: 234, displayOrder: 3, active: true },
        { title: "120주년 기념 학술 심포지엄", date: "2026-03-15", month: "3월", time: "14:00 - 17:00", location: "국제교육관", description: "여성 교육의 역사와 미래를 주제로 학술 심포지엄을 개최합니다. 저명한 교수님들과 동문 학자들이 참여합니다.", capacity: 200, registered: 89, displayOrder: 4, active: true },
        { title: "동문 러닝 페스티벌", date: "2026-04-20", month: "4월", time: "09:00 - 12:00", location: "캠퍼스 운동장", description: "건강한 체력으로 동문들과 함께 달리는 러닝 페스티벌입니다. 5km, 10km 코스가 마련되어 있으며, 참가자 모두에게 기념품이 제공됩니다.", capacity: 400, registered: 156, displayOrder: 5, active: true },
        { title: "동문 채용 박람회", date: "2026-06-10", month: "6월", time: "13:00 - 17:00", location: "체육관", description: "동문들이 근무하는 기업/기관의 채용 정보를 나누는 박람회입니다. 취업 준비생 동문들에게 좋은 기회가 될 것입니다.", capacity: 500, registered: 203, displayOrder: 6, active: true }
      ];

      for (const item of initialEvents) {
        await db.collection('events').add({
          ...item,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Site Config 초기 데이터
    const siteConfigRef = db.collection('config').doc('site_settings');
    const siteConfigSnap = await siteConfigRef.get();

    if (!siteConfigSnap.exists) {
      await siteConfigRef.set({
        id: 'site_settings',
        siteTitle: '숙명여자대학교 120주년 기념 동문회',
        siteDescription: '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.',
        targetDate: '2026-05-22T00:00:00',
        contactEmail: 'alumni@sookmyung.ac.kr',
        contactPhone: '02-710-9114',
        showGallery: true,
        showEvents: true,
        showTimeline: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, message: '초기 데이터가 생성되었습니다.' };
  } catch (error: any) {
    console.error('Initialize data error:', error);
    throw new functions.https.HttpsError('internal', '초기 데이터 생성 중 오류가 발생했습니다.');
  }
});

// ==================== ALIMTALK ====================

export const getAlimtalkTemplates = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = adminUserDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

  if (!adminUserDoc.exists || !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }

  const { appKey, secretKey, senderKey } = data;

  if (!appKey || !secretKey || !senderKey) {
    throw new functions.https.HttpsError('invalid-argument', '필수 설정(App Key, Secret Key, Sender Key)이 누락되었습니다.');
  }

  try {
    const alimtalkService = createAlimTalkService({
      appKey,
      secretKey,
      senderKey,
      templates: {}
    });

    const templates = await alimtalkService.getTemplates(senderKey);
    return { templates };
  } catch (error: any) {
    console.error('Get Alimtalk templates error:', error);
    if (error.message) {
       throw new functions.https.HttpsError('internal', error.message);
    }
    throw new functions.https.HttpsError('internal', '템플릿 목록을 불러오는 중 오류가 발생했습니다.');
  }
});

// ==================== PAYMENT CANCELLATION ====================

export const cancelPaymentByAdmin = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { paymentId, cancelReason } = data;

  if (!paymentId) {
    throw new functions.https.HttpsError('invalid-argument', '결제 ID가 필요합니다.');
  }

  try {
    const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = adminUserDoc.data();
    const isAdmin = userData?.role === 'admin' || userData?.email === 'aaron@beoksolution.com';

    if (!adminUserDoc.exists || !isAdmin) {
      throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', '결제 정보를 찾을 수 없습니다.');
    }

    const paymentData = paymentDoc.data();
    
    if (paymentData?.status !== 'completed') {
      throw new functions.https.HttpsError('failed-precondition', '취소할 수 없는 결제 상태입니다.');
    }

    const paymentKey = paymentData.payment_key;
    
    // Load Toss secret key
    let tossSecretKey = process.env.TOSS_SECRET_KEY;
    try {
      const siteConfigDoc = await db.collection('settings').doc('site_config').get();
      if (!tossSecretKey && siteConfigDoc.exists) {
        tossSecretKey = siteConfigDoc.data().pg_config?.secretKey;
      }
    } catch (configError) {
      console.warn('Failed to load site config for Toss key:', configError);
    }

    if (!tossSecretKey) {
      throw new functions.https.HttpsError('failed-precondition', '결제 시크릿 키가 설정되지 않았습니다.');
    }

    const reason = cancelReason || '관리자 취소';

    try {
      const tossResponse = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: reason,
        }),
      });

      if (!tossResponse.ok) {
        const tossError = await tossResponse.json() as { code?: string; message?: string };
        console.error('Toss cancellation failed:', tossError);

        if (tossError.code !== 'ALREADY_CANCELED_PAYMENT') {
          throw new functions.https.HttpsError('internal', `결제 취소 실패: ${tossError.message}`);
        }
      }

      await paymentRef.update({
        status: 'cancelled',
        cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
        cancel_reason: reason,
        cancelled_by: context.auth.uid,
      });

      if (paymentData?.user_id && paymentData?.user_id !== 'anonymous') {
        const userRef = db.collection('users').doc(paymentData.user_id);
        await userRef.update({
          paymentStatus: false,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send Cancellation Alimtalk
        try {
          const userDoc = await userRef.get();
          const userData = userDoc.data();
          if (userData && userData.phone && userData.name) {
            const alimtalkService = await getAlimtalkService();
            await alimtalkService.sendRefundComplete(
              userData.phone,
              userData.name,
              paymentData.amount || 0
            );
          }
        } catch (alimtalkErr) {
          console.error('Failed to send cancellation Alimtalk:', alimtalkErr);
        }
      }

      return { success: true, message: '결제가 취소되었습니다.' };
    } catch (paymentError: any) {
      console.error('Payment cancellation error:', paymentError);
      throw new functions.https.HttpsError('internal', paymentError.message || '결제 취소 중 오류가 발생했습니다.');
    }
  } catch (error: any) {
    console.error('Cancel payment by admin error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '결제 취소 처리 중 오류가 발생했습니다.');
  }
});

// ==================== MANUAL BANK TRANSFER ====================

export const applyVbank = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const userId = context.auth.uid;
  const { amount, orderId } = data;

  console.log(`Apply Vbank request: userId=${userId}, amount=${amount}, orderId=${orderId}`);

  try {
    if (!userId || !amount || !orderId) {
      console.error('Missing required parameters for applyVbank:', { userId, amount, orderId });
      throw new functions.https.HttpsError('invalid-argument', '필수 파라미터(사용자 ID, 금액, 주문번호)가 누락되었습니다.');
    }

    // 1. Update user info
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`User document not found for applyVbank: ${userId}`);
      throw new functions.https.HttpsError('not-found', '사용자 정보를 찾을 수 없습니다.');
    }

    await userRef.set({
      paymentMethod: 'vbank',
      vbankStatus: 'pending',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // 2. Create payment record
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({
      user_id: userId,
      order_id: orderId,
      amount: Number(amount),
      status: 'pending',
      payment_type: 'event',
      method: 'vbank',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Vbank application record created for user ${userId}`);

    // 3. Send Vbank Pending Alimtalk
    try {
      const userData = userDoc.data();
      if (userData && userData.phone && userData.name) {
        const alimtalkService = await getAlimtalkService();
        console.log(`Sending vbank pending notification to ${userData.phone}`);
        const alimResult = await alimtalkService.sendVbankPending(
          userData.phone,
          userData.name,
          Number(amount)
        );
        if (!alimResult.success) {
          console.warn('AlimTalk delivery reported failure:', alimResult.error);
        }
      } else {
        console.warn(`User data missing phone/name for AlimTalk: ${JSON.stringify(userData)}`);
      }
    } catch (alimtalkError: any) {
      console.error('Failed to send vbank pending AlimTalk:', alimtalkError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Apply vbank unexpected error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `무통장입금 처리 중 오류가 발생했습니다: ${error.message || String(error)}`);
  }
});

export const approveVbank = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', '사용자 ID가 필요합니다.');
  }

  console.log(`Approving Vbank for user: ${userId}`);

  try {
    const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
    const adminData = adminUserDoc.data();
    const isAdmin = adminData?.role === 'admin' || adminData?.email === 'aaron@beoksolution.com';

    if (!isAdmin) {
      throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', '사용자를 찾을 수 없습니다.');
    }

    await db.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        paymentStatus: true,
        vbankStatus: 'approved',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      const paymentsSnapshot = await db.collection('payments')
        .where('user_id', '==', userId)
        .where('method', '==', 'vbank')
        .where('status', '==', 'pending')
        .get();

      paymentsSnapshot.docs.forEach(doc => {
        transaction.update(doc.ref, {
          status: 'completed',
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          approved_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    });

    console.log(`Vbank approval completed for user: ${userId}`);

    // Send Welcome Alimtalk
    if (userData?.phone && userData?.name) {
      try {
        const paymentsSnapshot = await db.collection('payments')
          .where('user_id', '==', userId)
          .where('method', '==', 'vbank')
          .orderBy('created_at', 'desc')
          .limit(1)
          .get();
        
        const lastPayment = paymentsSnapshot.docs[0]?.data();
        const amount = lastPayment?.amount || 0;
        const orderId = lastPayment?.order_id || 'manual';

        const alimtalkService = await getAlimtalkService();
        console.log(`Sending welcome notification to ${userData.phone}`);
        await alimtalkService.sendWelcomeMessage(
          userData.phone,
          userData.name,
          amount,
          orderId
        );
      } catch (alimError) {
        console.error('Failed to send AlimTalk after vbank approval:', alimError);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Approve vbank error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `승인 처리 중 오류가 발생했습니다: ${error.message || String(error)}`);
  }
});

export const sendManualAlimtalk = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { userId, templateType } = data; // templateType: 'welcome' | 'pending' | 'refund'
  if (!userId || !templateType) {
    throw new functions.https.HttpsError('invalid-argument', '필수 파라미터가 누락되었습니다.');
  }

  try {
    const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = adminUserDoc.data()?.role === 'admin' || adminUserDoc.data()?.email === 'aaron@beoksolution.com';
    if (!isAdmin) throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || !userData.phone || !userData.name) {
      throw new functions.https.HttpsError('not-found', '사용자 정보(전화번호/성명)가 부족합니다.');
    }

    const alimtalkService = await getAlimtalkService();
    let result;

    if (templateType === 'welcome') {
      const paymentsSnapshot = await db.collection('payments')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();
      const amount = paymentsSnapshot.docs[0]?.data()?.amount || 0;
      const orderId = paymentsSnapshot.docs[0]?.data()?.order_id || 'manual';
      result = await alimtalkService.sendWelcomeMessage(userData.phone, userData.name, amount, orderId);
    } else if (templateType === 'pending') {
      const paymentsSnapshot = await db.collection('payments')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();
      const amount = paymentsSnapshot.docs[0]?.data()?.amount || 0;
      result = await alimtalkService.sendVbankPending(userData.phone, userData.name, amount);
    } else {
      throw new functions.https.HttpsError('invalid-argument', '지원하지 않는 템플릿입니다.');
    }

    return { success: result.success, message: result.success ? '알림톡이 발송되었습니다.' : `발송 실패: ${result.error}` };
  } catch (error: any) {
    console.error('Send manual AlimTalk error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `알림톡 발송 중 오류: ${error.message}`);
  }
});

export const updateUserStatus = functions.region('asia-northeast3').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { userId, paymentStatus, vbankStatus } = data;
  if (!userId) throw new functions.https.HttpsError('invalid-argument', '사용자 ID가 필요합니다.');

  try {
    const adminUserDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = adminUserDoc.data()?.role === 'admin' || adminUserDoc.data()?.email === 'aaron@beoksolution.com';
    if (!isAdmin) throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');

    const updateData: any = { updated_at: admin.firestore.FieldValue.serverTimestamp() };
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (vbankStatus !== undefined) updateData.vbankStatus = vbankStatus;

    await db.collection('users').doc(userId).update(updateData);
    
    // Auto-send Alimtalk if changing to completed/pending?
    // According to user request: "상태를 값을 변경함에 따라 진행해야 합니다... 결제 상태를 변경하면 알림톡이 발송되게 하면 됩니다."
    if (paymentStatus === true || vbankStatus === 'approved') {
       // Trigger AlimTalk send logic via internal call or separate trigger
       // For simplicity, we can call the service here if we have info
       try {
         const userDoc = await db.collection('users').doc(userId).get();
         const userData = userDoc.data();
         if (userData?.phone && userData?.name) {
            const alimtalkService = await getAlimtalkService();
            // Get amount from last payment
            const paymentsSnapshot = await db.collection('payments')
              .where('user_id', '==', userId)
              .orderBy('created_at', 'desc')
              .limit(1)
              .get();
            const amount = paymentsSnapshot.docs[0]?.data()?.amount || 0;
            const orderId = paymentsSnapshot.docs[0]?.data()?.order_id || 'manual';
            await alimtalkService.sendWelcomeMessage(userData.phone, userData.name, amount, orderId);
         }
       } catch (e) {
         console.warn('Silent failure sending auto-alimtalk during status update:', e);
       }
    } else if (vbankStatus === 'pending') {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (userData?.phone && userData?.name) {
           const alimtalkService = await getAlimtalkService();
           const paymentsSnapshot = await db.collection('payments')
             .where('user_id', '==', userId)
             .orderBy('created_at', 'desc')
             .limit(1)
             .get();
           const amount = paymentsSnapshot.docs[0]?.data()?.amount || 0;
           await alimtalkService.sendVbankPending(userData.phone, userData.name, amount);
        }
      } catch (e) {
        console.warn('Silent failure sending auto-alimtalk during status update:', e);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Update user status error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `상태 변경 중 오류: ${error.message}`);
  }
});
