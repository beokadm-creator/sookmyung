import { useState, useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface PhoneInputProps {
    phone: string;
    setPhone: (phone: string) => void;
    name: string;
    setName: (name: string) => void;
    verificationCode: string;
    setVerificationCode: (code: string) => void;
    onSendCode: () => Promise<void>;
    onVerifyCode: () => Promise<void>;
    isVerified: boolean;
    isSendingCode: boolean;
    isVerifying: boolean;
    sendCodeSuccess: boolean;
    error: string;
}

export default function PhoneInput({
    phone,
    setPhone,
    name,
    setName,
    verificationCode,
    setVerificationCode,
    onSendCode,
    onVerifyCode,
    isVerified,
    isSendingCode,
    isVerifying,
    sendCodeSuccess,
    error,
}: PhoneInputProps) {
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [recaptchaError, setRecaptchaError] = useState('');
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load reCAPTCHA script
        const loadRecaptcha = () => {
            if (typeof window !== 'undefined' && window.grecaptcha) {
                renderRecaptcha();
            } else {
                const script = document.createElement('script');
                script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
                script.async = true;
                script.onload = () => {
                    if (window.grecaptcha) {
                        renderRecaptcha();
                    }
                };
                document.head.appendChild(script);
            }
        };

        const renderRecaptcha = () => {
            if (window.grecaptcha && recaptchaContainerRef.current) {
                // Clear existing reCAPTCHA
                recaptchaContainerRef.current.innerHTML = '';

                window.grecaptcha.render(recaptchaContainerRef.current, {
                    sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
                    theme: 'light',
                    size: 'compact',
                    callback: (token: string) => {
                        setRecaptchaToken(token);
                        setRecaptchaError('');
                    },
                    'expired-callback': () => {
                        setRecaptchaToken(null);
                        setRecaptchaError('reCAPTCHA가 만료되었습니다. 다시 시도해주세요.');
                    },
                    'error-callback': () => {
                        setRecaptchaToken(null);
                        setRecaptchaError('reCAPTCHA 로드에 실패했습니다.');
                    },
                });
            }
        };

        loadRecaptcha();

        return () => {
            // Cleanup if needed
        };
    }, []);

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            setPhone(value);
        }
    };

    const handleSendCode = async () => {
        if (!recaptchaToken) {
            setRecaptchaError('reCAPTCHA 인증을 완료해주세요.');
            return;
        }
        await onSendCode();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="홍길동"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                </label>
                <div className="flex gap-2">
                    <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                        010
                    </span>
                    <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="12345678"
                        maxLength={8}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-1">'-' 없이 숫자만 입력해주세요.</p>
            </div>

            {/* reCAPTCHA Container */}
            <div ref={recaptchaContainerRef}></div>
            {recaptchaError && (
                <p className="text-sm text-red-600">{recaptchaError}</p>
            )}

            {sendCodeSuccess && !isVerified && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        인증번호 *
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="123456"
                            maxLength={6}
                        />
                        <button
                            type="button"
                            onClick={onVerifyCode}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {isVerifying ? '확인 중...' : '확인'}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">카카오 알림톡으로 발송된 인증번호 6자리를 입력해주세요.</p>
                </div>
            )}

            {isVerified && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    인증이 완료되었습니다.
                </div>
            )}

            {!isVerified && (
                <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || name.length < 2 || phone.length < 8 || !recaptchaToken}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSendingCode ? '발송 중...' : '인증번호 발송'}
                </button>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}

// Declare global grecaptcha type
declare global {
    interface Window {
        grecaptcha: any;
    }
}
