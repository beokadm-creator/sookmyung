import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, functions } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Layout from '../components/Layout';
import { SiteConfig } from '../types';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [amount, setAmount] = useState(0);
  const [priceLabel, setPriceLabel] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer' | 'manual_vbank'>('card');
  const [showVbankModal, setShowVbankModal] = useState(false);
  const [showVbankSuccess, setShowVbankSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Try to load stored application data (from Application.tsx flow)
        const storedData = localStorage.getItem('temp_application_data');
        if (storedData) {
          const data = JSON.parse(storedData);
          setUserName(data.name || '');
          setUserEmail(data.email || '');
          setPhone(data.phone || '');
          setAmount(data.amount || 0);
          setPriceLabel(data.priceLabel || '');

          // Sign in if token is available but user is not authenticated
          if (!auth.currentUser && data.token) {
            try {
              await signInWithCustomToken(auth, data.token);
              console.log('User signed in with custom token for checkout');
            } catch (authError) {
              console.error('Failed to sign in for checkout:', authError);
            }
          }
        } 
        // 2. If no temp data, check if user is already logged in (from MyPage.tsx flow)
        else {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserName(userData.name || '');
              setUserEmail(userData.email || '');
              setPhone(userData.phone || '');
              
              // Load Fee Config
              const eventConfigDoc = await getDoc(doc(db, 'config', 'event_settings'));
              if (eventConfigDoc.exists()) {
                const eventData = eventConfigDoc.data();
                if (eventData.priceTiers && Array.isArray(eventData.priceTiers)) {
                  const today = new Date().toISOString().split('T')[0];
                  const activeTier = eventData.priceTiers.find((tier: any) =>
                    tier.active && today >= tier.startDate && today <= tier.endDate
                  );
                  if (activeTier) {
                    setAmount(activeTier.amount);
                    setPriceLabel(activeTier.label);
                  }
                }
              }
            } else {
              navigate('/application');
              return;
            }
          } else {
            navigate('/application');
            return;
          }
        }

        // 3. Load PG client key
        let key = '';

        // Check if environment variables directly supply client key (fallback)
        if (import.meta.env.VITE_TOSS_CLIENT_KEY) {
           key = import.meta.env.VITE_TOSS_CLIENT_KEY;
        } else {
           // Fallback to database value
           const configDoc = await getDoc(doc(db, 'config', 'pg_config'));
           if (configDoc.exists() && configDoc.data().clientKey) {
             key = configDoc.data().clientKey;
           } else {
             const siteConfigDoc = await getDoc(doc(db, 'settings', 'site_config'));
             if (siteConfigDoc.exists() && siteConfigDoc.data().pg_config?.clientKey) {
               key = siteConfigDoc.data().pg_config.clientKey;
             }
           }
        }

        setClientKey(key);

        if (!key) {
          setError('결제 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('Checkout init error:', err);
        setError('결제 페이지를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    // Need to handle auth state initialization
    const unsubscribe = auth.onAuthStateChanged(() => {
      init();
    });

    return () => unsubscribe();
  }, [navigate]);

  const handlePayment = async (method: 'card' | 'transfer' | 'manual_vbank') => {
    if (method === 'manual_vbank') {
      setShowVbankModal(true);
      return;
    }

    if (!clientKey) {
      alert('결제 설정이 누락되었습니다. 관리자에게 문의해주세요.');
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      
      const storedData = JSON.parse(localStorage.getItem('temp_application_data') || '{}');
      const userId = auth.currentUser?.uid || storedData.userId;

      if (!userId) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }

      const orderId = `EVENT2026_${userId}_${Date.now()}`;
      
      const paymentParams: any = {
        amount: Number(amount),
        orderId: orderId,
        orderName: '숙명 120주년 전야제 참가신청',
        successUrl: `${window.location.origin}/success?userId=${userId}&amount=${amount}`,
        failUrl: `${window.location.origin}/application?message=payment_failed`,
        taxFreeAmount: Number(amount), // 부가가치세 제외 (전액 면세 처리)
      };

      if (method === 'transfer') {
        paymentParams.customerName = userName;
        paymentParams.customerMobilePhone = phone || storedData.phone || '';
      }

      console.log('Requesting payment with params:', paymentParams);
      await tossPayments.requestPayment(method === 'card' ? '카드' : '계좌이체', paymentParams);
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    }
  };

  const confirmManualVbank = async () => {
    setProcessing(true);
    try {
      const date = new Date();
      const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = `VBK${dateStr}${randomStr}`;

      const applyVbank = httpsCallable(functions, 'applyVbank');
      await applyVbank({ amount, orderId });

      localStorage.removeItem('temp_application_data');
      setShowVbankModal(false);
      setShowVbankSuccess(true);
    } catch (err: any) {
      console.error('Manual vbank error:', err);
      // Show more detailed error if possible
      const errorMessage = err.message || '무통장입금 신청 중 오류가 발생했습니다.';
      alert(`신청 실패: ${errorMessage}\n정보가 정확한지 확인 후 다시 시도해주세요.`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">결제 페이지를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={() => navigate('/application')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              신청 페이지로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">결제하기</h1>
        <p className="text-gray-600 mb-8">숙명여자대학교 창학120주년 기념 전야제 참가비</p>

        {/* Amount Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="mb-2 sm:mb-0">
            <span className="text-gray-700 font-semibold block sm:inline">결제 금액</span>
            {priceLabel && (
              <span className="mt-1 sm:mt-0 sm:ml-2 inline-block text-sm text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">
                {priceLabel} 적용
              </span>
            )}
          </div>
          <span className="text-3xl font-bold text-blue-700 self-end sm:self-auto">{amount.toLocaleString()}원</span>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">결제 수단 선택</h2>
          
          <div className="space-y-4">
            {/* Card Payment */}
            <div
              onClick={() => setSelectedMethod('card')}
              className={`flex items-center justify-between p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'card' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">카드 결제</h3>
                  <p className="text-sm text-gray-600">신용카드, 체크카드 등</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedMethod === 'card'}
                  onChange={() => setSelectedMethod('card')}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
            </div>

            {/* Bank Transfer */}
            <div
              onClick={() => setSelectedMethod('transfer')}
              className={`flex items-center justify-between p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'transfer'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">계좌이체</h3>
                  <p className="text-sm text-gray-600">모바일뱅킹, ATM 송금</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedMethod === 'transfer'}
                  onChange={() => setSelectedMethod('transfer')}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
            </div>

            {/* Manual Bank Transfer */}
            <div
              onClick={() => setSelectedMethod('manual_vbank')}
              className={`flex items-center justify-between p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'manual_vbank'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">무통장입금</h3>
                  <p className="text-sm text-gray-600">직접 계좌로 입금</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedMethod === 'manual_vbank'}
                  onChange={() => setSelectedMethod('manual_vbank')}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={() => handlePayment(selectedMethod)}
          disabled={!selectedMethod || processing}
          className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {processing ? '처리 중...' : (selectedMethod === 'manual_vbank' ? '무통장입금 신청하기' : (selectedMethod === 'card' ? '카드 결제하기' : '계좌이체하기'))} ({amount.toLocaleString()}원)
        </button>

        {/* Manual Vbank Modal */}
        {showVbankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">무통장입금 안내</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-bold mb-2">무통장입금 신청 안내</p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    확인 버튼을 누르면 신청이 접수되며, 아래 계좌로 금액 입금 시 확인 후 최종 승인처리됩니다.
                    <br /><br />
                    <strong>은행:</strong> 국민은행<br />
                    <strong>계좌번호:</strong> 763601-04-178355<br />
                    <strong>예금주:</strong> 숙명여자대학교 총동문회<br />
                    <strong>입금액:</strong> {amount.toLocaleString()}원
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  ※ 입금 확인 후 최종 승인이 완료되면 알림톡이 발송됩니다.<br />
                  ※ 신청 정보와 입금 현황은 마이페이지에서 확인 가능합니다.<br />
                  ※ 문의전화: 02-712-1212
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVbankModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
                >
                  취소
                </button>
                <button
                  onClick={confirmManualVbank}
                  disabled={processing}
                  className="flex-1 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-bold disabled:bg-gray-400"
                >
                  {processing ? '신청 중...' : '확인 (정상 처리)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Vbank Success Modal */}
        {showVbankSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 italic">신청이 완료되었습니다!</h3>
                <p className="text-gray-600 mt-2">무통장입금 확인 후 최종 승인됩니다.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
                <p className="text-blue-900 font-bold text-lg mb-4 border-b border-blue-200 pb-2">입금 안내</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">입금 은행</span>
                    <span className="font-bold text-blue-900">국민은행</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">계좌번호</span>
                    <span className="font-bold text-blue-900">763601-04-178355</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">예금주</span>
                    <span className="font-bold text-blue-900">숙명여자대학교 총동문회</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-blue-700 font-bold">입금액</span>
                    <span className="text-xl font-black text-blue-600">{amount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg leading-relaxed">
                  <div className="mt-0.5">•</div>
                  <div>입금 확인 후 알림톡이 발송되며, 이후 마이페이지에서 '참가 확정' 상태를 확인하실 수 있습니다.</div>
                </div>
                <button
                  onClick={() => navigate('/mypage')}
                  className="w-full py-4 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  확인 (마이페이지로 이동)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-2 mt-4">
          <p className="text-gray-500 text-sm">위 버튼을 누르면 결제 창이 호출됩니다. (Toss Payments)</p>
        </div>
      </div>
    </Layout>
  );
}
