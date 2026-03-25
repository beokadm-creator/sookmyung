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
import { UserCircle, AlertCircle, Phone, Lock } from 'lucide-react';
import { useRateLimit } from '../hooks/useRateLimit';

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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [customToken, setCustomToken] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'result'>('input');

  const { isBlocked, checkRateLimit } = useRateLimit();

  const handleCheckWithPassword = async () => {
    if (!phone || !/^010\d{8}$/.test(phone)) {
      setError('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!password || password.length !== 6) {
      setError('비밀번호 6자리를 입력해주세요.');
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

  const goToMyPage = async () => {
    if (!customToken) {
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
    setError('');
    setUserData(null);
    setCustomToken(null);
  };

  return (
    <Layout>
      <Section padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-sookmyung-blue-900 mb-2">
                신청 내역 확인
              </h1>
              <p className="text-sm text-gray-600">
                휴대전화번호와 비밀번호를 가 아이디와 비밀번호 역할을 합니다.
              </p>
            </div>

            <Card variant="elevated" className="p-6 sm:p-10">
              {step === 'input' ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <UserCircle className="w-16 h-16 text-sookmyung-blue-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      신청 시 입력했던 정보를 입력해 주세요.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">휴대전화 번호</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="01012345678"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sookmyung-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 (6자리)</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="비밀번호 숫자 6자리"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sookmyung-blue-500 outline-none"
                          maxLength={6}
                          inputMode="numeric"
                        />
                      </div>
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
                    className="py-4 text-base font-bold bg-blue-900 border-none"
                  >
                    {loading ? '조회 중...' : '신청 내역 조회'}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/application')}
                      className="text-sm text-sookmyung-blue-600 hover:underline"
                    >
                      새로 신청하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{userData?.name}님의 신청 정보</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-3">
                      <span className="text-gray-500">성명</span>
                      <span className="text-gray-900 font-medium">{userData?.name}</span>
                      <span className="text-gray-500">휴대전화</span>
                      <span className="text-gray-900 font-medium">{userData?.phone}</span>
                      <span className="text-gray-500">학과</span>
                      <span className="text-gray-900 font-medium">{userData?.department || '-'}</span>
                      <span className="text-gray-500">입학년도</span>
                      <span className="text-gray-900 font-medium">{userData?.enrollment_year || '-'}</span>
                      <span className="text-gray-500">결제상태</span>
                      <span className={`font-bold ${userData?.paymentStatus ? 'text-green-600' : 'text-red-600'}`}>
                        {userData?.paymentStatus ? '결제완료' : '결제미완료'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={goToMyPage}
                      className="py-4 font-bold bg-blue-900 border-none"
                    >
                      마이페이지로 상세 확인
                    </Button>
                    <button
                      onClick={resetForm}
                      className="w-full py-3 text-sm text-gray-500 hover:text-gray-700"
                    >
                      다른 번호로 조회하기
                    </button>
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
