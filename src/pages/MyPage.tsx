import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, functions } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Payment, Notice, WithdrawalRequest } from '../types';
import { signOut } from 'firebase/auth';
import { Bell, Phone, Mail, Calendar, CreditCard, UserCircle, X, AlertCircle, LogOut, Settings, GraduationCap, Building2, Briefcase, CheckCircle } from 'lucide-react';

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        const passedUserData = location.state as any;
        if (passedUserData?.userData && !passedUserData.tokenRequired) {
          const userData = passedUserData.userData as User;
          setUser(userData);
          setLoading(false);
          return;
        }
        navigate('/check');
        return;
      }

      try {
        let userData: User | null = null;

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        } else {
          const passedUserData = location.state as any;
          if (passedUserData?.userData) {
            userData = passedUserData.userData as User;
          } else {
            console.warn('사용자 문서를 찾을 수 없습니다.');
            userData = {
              id: currentUser.uid,
              email: currentUser.email || '',
              name: currentUser.displayName || '사용자',
              role: 'user',
              paymentStatus: false,
              created_at: null,
              updated_at: null,
            } as User;
          }
        }

        setUser(userData);

        const paymentsQuery = query(
          collection(db, 'payments'),
          where('user_id', '==', currentUser.uid)
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Payment));
        setPayments(paymentsData);

        const noticesQuery = query(
          collection(db, 'notices'),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        const noticesSnapshot = await getDocs(noticesQuery);
        const noticesData = noticesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notice));
        setNotices(noticesData);

        const withdrawalQuery = query(
          collection(db, 'withdrawal_requests'),
          where('user_id', '==', currentUser.uid),
          orderBy('requested_at', 'desc'),
          limit(1)
        );
        const withdrawalSnapshot = await getDocs(withdrawalQuery);
        if (!withdrawalSnapshot.empty) {
          const withdrawalData = {
            id: withdrawalSnapshot.docs[0].id,
            ...withdrawalSnapshot.docs[0].data()
          } as WithdrawalRequest;
          setWithdrawalRequest(withdrawalData);
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    setWithdrawing(true);
    try {
      const requestWithdrawalFunction = httpsCallable(functions, 'requestWithdrawal');
      const result = await requestWithdrawalFunction({ reason: withdrawalReason });
      const data = result.data as { success: boolean; message: string; requestId: string };

      if (data.success) {
        alert(data.message);
        setShowWithdrawalModal(false);
        setWithdrawalReason('');
        window.location.reload();
      }
    } catch (error: any) {
      console.error('참가 취소 신청 실패:', error);
      alert(error.message || '참가 취소 신청 중 오류가 발생했습니다.');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <Section padding="lg">
          <Container>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sookmyung-blue-600"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </Container>
        </Section>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Section padding="lg">
        <Container>
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-sookmyung-blue-900 mb-2">
              마이페이지
            </h1>
            <p className="text-gray-600">
              숙명여자대학교 창학120주년 기념 전야제
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card variant="elevated" className="p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-sookmyung-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-sookmyung-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-sookmyung-blue-900">{user.name}</h2>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-3 ${user.paymentStatus
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    <CreditCard className="w-4 h-4" />
                    {user.paymentStatus ? '참가 완료' : (user && (user as any).vbankStatus === 'pending' ? '승인 대기중' : '미결제')}
                  </div>
                </div>

                <div className="space-y-3">
                  {!user.paymentStatus && (
                    <Button
                      variant="gold"
                      fullWidth
                      onClick={() => navigate('/checkout')}
                    >
                      결제하기
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowWithdrawalModal(true)}
                  >
                    참가 취소
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={handleLogout}
                    className="text-gray-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>

                {user.role === 'admin' && (
                  <Button
                    variant="primary"
                    fullWidth
                    className="mt-3"
                    onClick={() => navigate('/admin')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    관리자 페이지
                  </Button>
                )}

                {user && (user as any).vbankStatus === 'pending' && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">입금 확인 대기 중</p>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          아래 계좌로 입금해 주시면 확인 후 승인됩니다.<br />
                          <strong>국민은행 763601-04-178355</strong><br />
                          예금주: 숙명여자대학교 총동문회
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          문의전화: 02-712-1212
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {withdrawalRequest && withdrawalRequest.status === 'pending' && (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900">결제 취소 진행 중</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          결제 취소가 진행 중입니다.
                        </p>
                        <p className="text-xs text-yellow-600 mt-2">
                          신청일: {formatDate(withdrawalRequest.requested_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Info */}
              <Card variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-6 flex items-center gap-2">
                  <UserCircle className="w-6 h-6" />
                  참가자 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <UserCircle className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">이름</p>
                      <p className="text-lg font-medium">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">생년월일</p>
                      <p className="text-lg font-medium">{user.birthdate || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <Phone className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">전화번호</p>
                      <p className="text-lg font-medium">{user.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <Mail className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">이메일</p>
                      <p className="text-lg font-medium">{user.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">입학년도</p>
                      <p className="text-lg font-medium">{user.enrollment_year || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-sookmyung-blue-50 rounded-lg">
                    <GraduationCap className="w-8 h-8 text-sookmyung-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">학과</p>
                      <p className="text-lg font-medium">{user.department || '-'}</p>
                    </div>
                  </div>
                  {/* Job info removed as requested */}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-bold text-sookmyung-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    추가 프로그램 신청
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border flex justify-between items-center ${user.additional_program_domestic_tour ? 'bg-sookmyung-blue-50 border-sookmyung-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Ⅰ. 서울 근교 투어</p>
                        <p className={`text-lg font-bold mt-1 ${user.additional_program_domestic_tour ? 'text-sookmyung-blue-600' : 'text-gray-400'}`}>
                          {user.additional_program_domestic_tour ? '✅ 신청함' : '❌ 미신청'}
                        </p>
                        {user.additional_program_domestic_tour && user.additional_program_domestic_tour_option && (
                          <p className="text-xs text-sookmyung-blue-600 mt-1 font-bold">
                            ({user.additional_program_domestic_tour_option === 'option1' ? '선택1. 동문회관 게스트룸' : '선택2. 삼성동 신라스테이'})
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Campus tour section removed as requested */}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <span className="text-gray-600 text-sm">주소</span>
                    <p className="font-medium">{user.address || '-'} {user.address_detail || ''}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-gray-600 text-sm">축하 메시지</span>
                    <p className="font-medium">{user.message || '-'}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>가입일: </span>
                    <span className="font-medium">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              </Card>

              {/* Notices */}
              {notices.length > 0 && (
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-sookmyung-blue-900 flex items-center gap-2">
                      <Bell className="w-6 h-6" />
                      공지사항
                    </h3>
                    <span className="text-sm text-gray-500">최근 5개</span>
                  </div>
                  <div className="space-y-3">
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {notice.is_pinned && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                  중요
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${notice.category === 'urgent' ? 'bg-red-100 text-red-700' :
                                  notice.category === 'event' ? 'bg-blue-100 text-blue-700' :
                                    notice.category === 'payment' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                {notice.category === 'urgent' && '긴급'}
                                {notice.category === 'event' && '행사'}
                                {notice.category === 'payment' && '결제'}
                                {notice.category === 'general' && '일반'}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900">{notice.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notice.content}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                            {formatDate(notice.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Payment History */}
              <Card variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  결제 내역
                </h3>
                {payments.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">결제 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {payment.payment_type === 'membership' && '회비'}
                              {payment.payment_type === 'donation' && '후원금'}
                              {payment.payment_type === 'event' && '이벤트'}
                            </p>
                            <p className="text-sm text-gray-600">
                              주문번호: {payment.order_id}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {payment.amount.toLocaleString()}원
                            </p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${payment.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {payment.status === 'completed' && '완료'}
                              {payment.status === 'pending' && '대기'}
                              {payment.status === 'failed' && '실패'}
                              {payment.status === 'cancelled' && '취소'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">참가 취소 신청</h3>
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setWithdrawalReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-medium mb-2">환불 안내</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>관리자 승인 후 결제 취소가 진행됩니다.</li>
                      <li>PG사와 카드사의 프로세스에 따라 환불까지 <strong>5-10일 소요</strong>될 수 있습니다.</li>
                      <li>환불 시 결제하신 카드로 자동 입금됩니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                참가 취소를 신청하시면 관리자 승인 후 결제가 취소되고, 등록하신 정보는 안전하게 삭제됩니다.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                취소 사유
              </label>
              <textarea
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="취소 사유를 입력해주세요."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setWithdrawalReason('');
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleWithdrawalRequest}
                disabled={withdrawing}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
              >
                {withdrawing ? '신청 중...' : '참가 취소 신청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
