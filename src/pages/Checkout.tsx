import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Layout from '../components/Layout';
import { SiteConfig } from '../types';

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [amount, setAmount] = useState(0);
  const [priceLabel, setPriceLabel] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer'>('card');
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
        const configDoc = await getDoc(doc(db, 'settings', 'site_config'));
        if (configDoc.exists()) {
          const configData = configDoc.data() as SiteConfig;
          const key = configData.pg_config.clientKey || '';
          setClientKey(key);

          if (!key) {
            setError('결제 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
            setLoading(false);
            return;
          }

          setLoading(false);
        } else {
          setError('결제 설정을 찾을 수 없습니다.');
          setLoading(false);
        }
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

  const handlePayment = async (method: 'card' | 'transfer') => {
    try {
      const tossPayments = await loadTossPayments(clientKey);

      const date = new Date();
      const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = `SMWU${dateStr}${randomStr}`;

      const storedData = JSON.parse(localStorage.getItem('temp_application_data') || '{}');
      const userId = storedData.userId || auth.currentUser?.uid;

      const paymentParams: any = {
        amount: amount,
        taxExemptionAmount: amount,
        orderId: orderId,
        orderName: '숙명여자대학교 창학120주년 기념 전야제 참가비',
        successUrl: `${window.location.origin}/success?userId=${userId}`,
        failUrl: `${window.location.origin}/application?paymentFailed=true`,
      };

      if (method === 'card') {
        paymentParams.customerName = userName;
        paymentParams.customerEmail = userEmail;
      } else if (method === 'transfer') {
        paymentParams.customerName = userName;
        paymentParams.customerMobilePhone = phone || storedData.phone || '';
      }

      await tossPayments.requestPayment(method === 'card' ? '카드' : '계좌이체', paymentParams);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-semibold">결제 금액</span>
            {priceLabel && (
              <span className="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">
                {priceLabel} 적용
              </span>
            )}
          </div>
          <span className="text-3xl font-bold text-blue-700">{amount.toLocaleString()}원</span>
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
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={() => handlePayment(selectedMethod)}
          disabled={!selectedMethod}
          className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {selectedMethod === 'card' ? '카드 결제하기' : '계좌이체하기'} ({amount.toLocaleString()}원)
        </button>

        <div className="text-center space-y-2 mt-4">
          <p className="text-red-500 text-sm font-medium">※ 하나카드는 결제가 불가합니다.</p>
          <p className="text-gray-500 text-sm">위 버튼을 누르면 결제 창이 호출됩니다. (Toss Payments)</p>
        </div>
      </div>
    </Layout>
  );
}
