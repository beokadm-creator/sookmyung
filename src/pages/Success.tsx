import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { User } from '../types';

// Helper to get base URL for functions
const getFunctionsUrl = (name: string) => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  // Use a different port if needed, or rely on firebase emulator configuration
  if (import.meta.env.DEV) {
    return `http://127.0.0.1:5001/${projectId}/us-central1/${name}`;
  }
  return `https://asia-northeast3-${projectId}.cloudfunctions.net/${name}`;
};

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const paymentKey = queryParams.get('paymentKey');
        const orderId = queryParams.get('orderId');
        const amount = queryParams.get('amount');
        const userId = queryParams.get('userId');

        if (!paymentKey || !orderId || !amount) {
          navigate('/application');
          return;
        }

        // If userId is provided (new flow), use it directly
        if (userId) {
          try {
            const response = await fetch(getFunctionsUrl('confirmPayment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentKey,
                orderId,
                amount: parseInt(amount),
                userId: userId,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || errorData.error || 'Payment confirmation failed');
            }
          } catch (paymentError) {
             console.error('결제 승인 실패:', paymentError);
             setErrorMsg('결제 승인 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
             setLoading(false);
             return;
          }
          
          setPaymentData({
            orderId,
            amount: parseInt(amount),
          });

          // Auto-redirect to MyPage after 2 seconds
          setTimeout(() => {
            navigate('/mypage');
          }, 2000);

          setLoading(false);
          return;
        }

        // Load temp data from localStorage
        const storedData = localStorage.getItem('temp_application_data');
        if (!storedData) {
          // If no stored data but user is logged in, assume it's a logged-in payment
          if (auth.currentUser) {
             // Handle logged-in user payment (existing logic)
             // For this flow change, we primarily focus on new registration
          } else {
            setErrorMsg('신청 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.');
            setLoading(false);
            return;
          }
        }

        const localUser = storedData ? JSON.parse(storedData) : null;
        let user = auth.currentUser;

        if (!user && localUser) {
          try {
            // Try to create account
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              localUser.email, 
              localUser.password
            );
            user = userCredential.user;
            await updateProfile(user, { displayName: localUser.name });
          } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
              // If email exists, try to sign in
              try {
                const userCredential = await signInWithEmailAndPassword(
                  auth,
                  localUser.email,
                  localUser.password
                );
                user = userCredential.user;
              } catch (loginError) {
                console.error('로그인 실패:', loginError);
                setErrorMsg('이미 가입된 이메일이지만 비밀번호가 일치하지 않습니다.');
                setLoading(false);
                return;
              }
            } else {
              console.error('계정 생성 실패:', authError);
              setErrorMsg('계정 생성 중 오류가 발생했습니다.');
              setLoading(false);
              return;
            }
          }
        }

        if (user && localUser) {
          // Save User Data (Create/Update user profile first)
          try {
            await setDoc(doc(db, 'users', user.uid), {
              id: user.uid,
              email: localUser.email,
              name: localUser.name,
              phone: localUser.phone,
              department: localUser.department || '',
              company: localUser.company || '',
              company_department: localUser.company_department || '',
              position: localUser.position || '',
              birthdate: localUser.birthdate || '',
              address: localUser.address || '',
              address_detail: localUser.address_detail || '',
              enrollment_year: localUser.enrollment_year || '',
              message: localUser.message || '',
              additional_program_domestic_tour: localUser.additional_program_domestic_tour || false,
              additional_program_school_tour: localUser.additional_program_school_tour || false,
              role: 'user',
              // paymentStatus will be updated by cloud function
              paymentStatus: false,
              consent: localUser.consent || {
                privacy_policy: false,
                third_party_provision: false,
                marketing_consent: false,
              },
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
            }, { merge: true });
          } catch (dbError) {
            console.warn('사용자 정보 저장 실패:', dbError);
          }

          // Call Cloud Function to confirm payment and update payment status
          try {
            const response = await fetch(getFunctionsUrl('confirmPayment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentKey,
                orderId,
                amount: parseInt(amount),
                userId: user.uid, // Pass the authenticated user ID
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || errorData.error || 'Payment confirmation failed');
            }
            
            // Clear temp data
            localStorage.removeItem('temp_application_data');
          } catch (paymentError) {
             console.error('결제 승인 실패:', paymentError);
             setErrorMsg('결제 승인 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
             setLoading(false);
             return;
          }
        } else if (user) {
           // Existing logged in user logic (fallback)
           // Call Cloud Function
           try {
            const response = await fetch(getFunctionsUrl('confirmPayment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentKey,
                orderId,
                amount: parseInt(amount),
                userId: user.uid,
              }),
            });

            if (!response.ok) {
               throw new Error('Payment confirmation failed');
            }
           } catch (e) {
             console.error(e);
           }
        }

        setPaymentData({
          orderId,
          amount: parseInt(amount),
        });

        // Auto-redirect to MyPage after 1.5 seconds
        setTimeout(() => {
          navigate('/mypage', { replace: true });
        }, 1500);
      } catch (error) {
        console.error('결제 처리 중 오류:', error);
        setErrorMsg('결제 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">결제 처리 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">✅</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-blue-900">
              결제 완료
            </h1>

            <p className="text-gray-600 mb-2">
              숙명여자대학교 창학120주년 기념 전야제 참가비 결제가 완료되었습니다.
            </p>
            
            <p className="text-sm text-blue-600 mb-8">
              잠시 후 마이페이지로 자동 이동합니다...
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-medium">{paymentData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-bold text-blue-600">
                      {paymentData.amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/mypage')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                마이페이지로 이동
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
