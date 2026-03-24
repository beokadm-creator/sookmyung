import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { functions, auth } from '../firebase';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UserCircle, CheckCircle, AlertCircle, Phone, Lock, KeyRound } from 'lucide-react';
import { useRateLimit } from '../hooks/useRateLimit';

type TabType = 'password' | 'verification';
type Step = 'input' | 'verify' | 'result';

interface UserData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  department?: string;
  enrollment_year?: string;
  birthdate?: string;
  address?: string;
  address_detail?: string;
  company?: string;
  company_department?: string;
  position?: string;
  message?: string;
  paymentStatus: boolean;
  created_at: any;
}

export default function ApplicationCheck() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('password');
  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [customToken, setCustomToken] = useState<string | null>(null);

  const { isBlocked, blockTimeRemaining, checkRateLimit } = useRateLimit();

  const handleCheckWithPassword = async () => {
    if (!phone || !/^010\d{8}$/.test(phone)) {
      setError('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      setError(`요청이 너무 많습니다. ${Math.ceil(rateLimitResult.remainingTime! / 1000)}초 후에 다시 시도해주세요.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const loginFn = httpsCallable(functions, 'loginWithPhone');
      const result = await loginFn({
        phone: phone.startsWith('010') ? phone : `010${phone}`,
        password: password,
      });

      const data = result.data as any;
      if (data.success) {
        setUserData(data.user);
        setCustomToken(data.token || null);
        setStep('result');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('로그인 실패:', err);
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phone || !/^010\d{8}$/.test(phone)) {
      setError('올바른 전화번호를 입력해주세요.');
      return;
    }

    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      setError(`요청이 너무 많습니다. ${Math.ceil(rateLimitResult.remainingTime! / 1000)}초 후에 다시 시도해주세요.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sendCodeFn = httpsCallable(functions, 'sendVerificationCode');
      const result = await sendCodeFn({
        phone: phone.startsWith('010') ? phone : `010${phone}`,
        purpose: 'check',
      });

      const data = result.data as any;
      if (data.success) {
        // For test user, automatically fill the verification code
        const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;
        if (normalizedPhone === '01012341234' && data.code) {
          setVerificationCode(data.code);
        }
        setSuccessMessage(data.message || '인증번호가 발송되었습니다.');
        setStep('verify');
        setCountdown(300);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      console.error('인증번호 발송 실패:', err);
      setError(err.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeAndFetchData = async () => {
    if (!verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      setError(`요청이 너무 많습니다. ${Math.ceil(rateLimitResult.remainingTime! / 1000)}초 후에 다시 시도해주세요.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const verifyFn = httpsCallable(functions, 'verifyCode');
      const verifyResult = await verifyFn({
        phone: phone.startsWith('010') ? phone : `010${phone}`,
        code: verificationCode,
      });

      const verifyData = verifyResult.data as any;
      if (!verifyData.success) {
        setError(verifyData.message || '인증에 실패했습니다.');
        setLoading(false);
        return;
      }

      const normalizedPhone = phone.startsWith('010') ? phone : `010${phone}`;

      // TEST USER: Directly show dummy data for 010-1234-1234
      if (normalizedPhone === '01012341234') {
        const testUserData: UserData = {
          id: 'test-user-1234',
          name: '테스트사용자',
          phone: '01012341234',
          email: 'test@smwu.ac.kr',
          department: '컴퓨터공학과',
          enrollment_year: '2014',
          birthdate: '1995-01-01',
          address: '서울시 용산구',
          address_detail: '숙명여대 nearby',
          company: '테스트주식회사',
          company_department: '개발팀',
          position: '대리',
          message: '',
          paymentStatus: false,
          created_at: { toDate: () => new Date() } as any,
        };
        setUserData(testUserData);
        setCustomToken(null);
        setStep('result');
        setLoading(false);
        return;
      }

      const fetchUserFn = httpsCallable(functions, 'fetchUserByPhone');
      const userResult = await fetchUserFn({
        phone: normalizedPhone,
      });

      const userDataResult = userResult.data as any;
      if (userDataResult.success && userDataResult.user) {
        setUserData(userDataResult.user);
        setCustomToken(userDataResult.token || null);
        setStep('result');
      } else {
        setError('신청되지 않은 전화번호입니다. 신청 페이지에서 먼저 신청해주세요.');
      }
    } catch (err: any) {
      console.error('사용자 정보 조회 실패:', err);
      setError(err.message || '사용자 정보 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const goToMyPage = async () => {
    if (!customToken) {
      setUserData((prev) => ({ ...prev!, tokenRequired: false } as any));
      navigate('/mypage', { state: { userData } });
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInWithCustomToken(auth, customToken);
      navigate('/mypage');
    } catch (err: any) {
      console.error('로그인 실패:', err);
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setStep('input');
    setPhone('');
    setPassword('');
    setVerificationCode('');
    setError('');
    setSuccessMessage('');
    setUserData(null);
    setCustomToken(null);
    setCountdown(0);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <Layout>
      <Section padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-sookmyung-blue-900 mb-2">
                신청조회
              </h1>
              <p className="text-gray-600">
                신청 정보를 조회합니다
              </p>
            </div>

            <Card variant="elevated" className="p-4 sm:p-8">
              {step === 'input' && (
                <>
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => switchTab('password')}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'password'
                          ? 'text-sookmyung-blue-600 border-b-2 border-sookmyung-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        비밀번호로 조회
                      </div>
                    </button>
                    <button
                      onClick={() => switchTab('verification')}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'verification'
                          ? 'text-sookmyung-blue-600 border-b-2 border-sookmyung-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        인증번호로 조회
                      </div>
                    </button>
                  </div>

                  {activeTab === 'password' && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <UserCircle className="w-16 h-16 text-sookmyung-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">비밀번호로 조회</h2>
                        <p className="text-sm text-gray-600 mt-2">
                          신청 시 입력한 전화번호와 비밀번호를 입력해주세요
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          전화번호
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                setPhone(value);
                              }
                            }}
                            placeholder="01012345678"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sookmyung-blue-500"
                            inputMode="numeric"
                            autoComplete="tel"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="비밀번호 입력"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sookmyung-blue-500"
                            inputMode="numeric"
                            autoComplete="current-password"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handleCheckWithPassword}
                        disabled={loading || isBlocked}
                      >
                        {loading ? '조회 중...' : isBlocked ? '잠시 후 다시 시도해주세요' : '조회하기'}
                      </Button>
                    </div>
                  )}

                  {activeTab === 'verification' && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Phone className="w-16 h-16 text-sookmyung-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">인증번호로 조회</h2>
                        <p className="text-sm text-gray-600 mt-2">
                          비밀번호를 잊어버린 경우 인증번호로 조회합니다
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          전화번호
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                setPhone(value);
                              }
                            }}
                            placeholder="01012345678"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sookmyung-blue-500"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={sendVerificationCode}
                        disabled={loading || isBlocked}
                      >
                        {loading ? '발송 중...' : isBlocked ? '잠시 후 다시 시도해주세요' : '인증번호 받기'}
                      </Button>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/application')}
                      className="text-sm text-sookmyung-blue-600 hover:text-sookmyung-blue-700"
                    >
                      신청하러 가기
                    </button>
                  </div>
                </>
              )}

              {step === 'verify' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">인증번호 입력</h2>
                    <p className="text-sm text-gray-600 mt-2">
                      전화번호로 전송된 인증번호를 입력해주세요
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      인증번호
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6자리 인증번호"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sookmyung-blue-500"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    {countdown > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        유효시간: {formatCountdown(countdown)}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={verifyCodeAndFetchData}
                    disabled={loading}
                  >
                    {loading ? '조회 중...' : '조회하기'}
                  </Button>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={resetForm}
                  >
                    다시 입력
                  </Button>
                </div>
              )}

              {step === 'result' && userData && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">신청 정보 확인</h2>
                    <p className="text-sm text-gray-600 mt-2">
                      {userData.name}님의 신청 정보입니다
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">이름:</span>
                        <span className="ml-2 text-gray-900">{userData.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">전화번호:</span>
                        <span className="ml-2 text-gray-900">{userData.phone}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">학과:</span>
                        <span className="ml-2 text-gray-900">{userData.department || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">입학년도:</span>
                        <span className="ml-2 text-gray-900">{userData.enrollment_year || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">결제상태:</span>
                        <span className={`ml-2 font-medium ${userData.paymentStatus ? 'text-green-600' : 'text-red-600'}`}>
                          {userData.paymentStatus ? '완료' : '미완료'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">신청일:</span>
                        <span className="ml-2 text-gray-900">{formatDate(userData.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={goToMyPage}
                      disabled={loading}
                    >
                      {loading ? '이동 중...' : '마이페이지로 이동'}
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={resetForm}
                    >
                      다른 전화번호 조회
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
