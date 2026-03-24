import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, functions } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, getDocs, updateDoc, setDoc, serverTimestamp, addDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import Layout from '../components/Layout';
import { User, Payment, Config, Notice, WithdrawalRequest, SiteConfig, PriceTier, Message } from '../types';
import { CheckCircle, XCircle, Plus, Edit2, Trash2, Calendar, Download, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

import AlimtalkSettings from '../components/admin/AlimtalkSettings';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'notices' | 'withdrawals' | 'config' | 'site_settings' | 'alimtalk' | 'messages'>('users');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'general' as 'event' | 'payment' | 'general' | 'urgent',
    is_pinned: false,
  });
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [siteConfigForm, setSiteConfigForm] = useState({
    clientKey: '',
    secretKey: '',
    service_terms: '',
    privacy_policy: '',
    third_party_provision: '',
    marketing_consent: '',
    refund_policy: '',
  });

  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      let userData: User | null = null;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        }
      } catch (error) {
        console.warn('사용자 정보 로드 실패 (Firestore 문제 가능성):', error);
      }

      const ADMIN_UID = 'DiMxXk9JZug3Ma2I2hK68ia0WZs1';
      const ADMIN_EMAILS = ['aaron@beoksolution.com'];

      // Force admin role for specific UID or Email
      if (currentUser.uid === ADMIN_UID || (currentUser.email && ADMIN_EMAILS.includes(currentUser.email))) {
        if (!userData) {
          // Create a temporary admin user object if Firestore read failed or doc doesn't exist
          userData = {
            id: currentUser.uid,
            email: currentUser.email || '',
            name: 'Admin',
            role: 'admin',
            paymentStatus: false,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          } as User;
        } else {
          userData.role = 'admin';
        }
      }

      if (userData && userData.role === 'admin') {
        setUser(userData);
        fetchAdminData();
      } else {
        setUser(null);
        setLoginError('관리자 권한이 없습니다.');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);

      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const paymentsData = paymentsSnapshot.docs.map(doc => {
        const paymentData = doc.data() as Payment;
        const user = usersData.find(u => u.id === paymentData.user_id);
        return {
          id: doc.id,
          ...paymentData,
          user_name: user?.name || '',
        } as Payment;
      });
      setPayments(paymentsData);

      const noticesQuery = query(collection(db, 'notices'), orderBy('created_at', 'desc'));
      const noticesSnapshot = await getDocs(noticesQuery);
      const noticesData = noticesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notice));
      setNotices(noticesData);

      const withdrawalsQuery = query(
        collection(db, 'withdrawal_requests'),
        orderBy('requested_at', 'desc')
      );
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
      const withdrawalsData = withdrawalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WithdrawalRequest));
      setWithdrawalRequests(withdrawalsData);

      const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(messagesData);

      const configDoc = await getDoc(doc(db, 'config', 'event_settings'));
      if (configDoc.exists()) {
        const configData = configDoc.data() as Config;
        setConfig(configData);
        if (configData.priceTiers) {
          setPriceTiers(configData.priceTiers);
        } else {
          setPriceTiers([]);
        }
      }

      const siteConfigDoc = await getDoc(doc(db, 'settings', 'site_config'));
      if (siteConfigDoc.exists()) {
        const siteConfigData = siteConfigDoc.data() as SiteConfig;
        setSiteConfig(siteConfigData);
        setSiteConfigForm({
          clientKey: siteConfigData.pg_config.clientKey || '',
          secretKey: siteConfigData.pg_config.secretKey || '',
          service_terms: siteConfigData.terms.service_terms || '',
          privacy_policy: siteConfigData.terms.privacy_policy || '',
          third_party_provision: siteConfigData.terms.third_party_provision || '',
          marketing_consent: siteConfigData.terms.marketing_consent || '',
          refund_policy: siteConfigData.terms.refund_policy || '',
        });
      }
    } catch (error) {
      console.error('관리자 데이터 로드 실패:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will trigger the useEffect
    } catch (err: any) {
      setLoginError('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
      setLoginLoading(false);
    }
  };

  const handleAddPriceTier = () => {
    setPriceTiers([
      ...priceTiers,
      {
        id: Date.now().toString(),
        label: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        amount: 10000,
        active: true,
      }
    ]);
  };

  const handleRemovePriceTier = (id: string) => {
    if (window.confirm('이 가격 구간을 삭제하시겠습니까?')) {
      setPriceTiers(priceTiers.filter(t => t.id !== id));
    }
  };

  const handleUpdatePriceTier = (id: string, field: keyof PriceTier, value: any) => {
    setPriceTiers(priceTiers.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleUpdateConfig = async () => {
    try {
      if (priceTiers.length === 0) {
        alert('활성화된 기간별 금액 설정이 없습니다. 최소 1개 이상의 기간별 금액을 설정해주세요.');
        return;
      }

      await setDoc(doc(db, 'config', 'event_settings'), {
        priceTiers,
        updated_at: serverTimestamp(),
      }, { merge: true });
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleUpdateSiteConfig = async () => {
    try {
      await setDoc(doc(db, 'settings', 'site_config'), {
        id: 'site_config',
        type: 'site_config',
        pg_config: {
          clientKey: siteConfigForm.clientKey,
          secretKey: siteConfigForm.secretKey,
          pg_provider: 'toss',
          enabled: true,
        },
        terms: {
          service_terms: siteConfigForm.service_terms,
          privacy_policy: siteConfigForm.privacy_policy,
          third_party_provision: siteConfigForm.third_party_provision,
          marketing_consent: siteConfigForm.marketing_consent,
          refund_policy: siteConfigForm.refund_policy,
        },
        updated_at: serverTimestamp(),
      }, { merge: true });
      alert('사이트 설정이 저장되었습니다.');
    } catch (error) {
      console.error('사이트 설정 저장 실패:', error);
      alert('사이트 설정 저장에 실패했습니다.');
    }
  };

  const handleExportExcel = () => {
    const data = users.map(u => ({
      '이름': u.name,
      '전화번호': u.phone,
      '이메일': u.email,
      '생년월일': u.birthdate,
      '주소': u.address,
      '상세주소': u.address_detail,
      '입학년도': u.enrollment_year,
      '학과': u.department,
      '회사명': (u as any).company || '',
      '부서명': (u as any).company_department || '',
      '직위': (u as any).position || '',
      '축하메시지': u.message,
      'Ⅰ. 서울 근교 투어': (u as any).additional_program_domestic_tour ? ((u as any).additional_program_domestic_tour_option === 'option1' ? '신청 (선택1: 게스트룸)' : '신청 (선택2: 신라스테이)') : '미신청',
      'Ⅱ. 캠퍼스 투어': (u as any).additional_program_campus_tour ? '신청' : '미신청',
      '결제상태': u.paymentStatus ? '완료' : '미결',
      '가입일': u.created_at ? formatDate(u.created_at) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '회원목록');
    XLSX.writeFile(workbook, `숙명여대_120주년_참가자명단_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCancelPayment = async (paymentId: string, userId: string) => {
    if (!window.confirm('정말로 이 결제를 취소하시겠습니까?\n(PG사 결제 취소 및 DB 상태 변경이 진행됩니다.)')) return;

    try {
      const cancelPaymentFunction = httpsCallable(functions, 'cancelPaymentByAdmin');
      const result = await cancelPaymentFunction({ 
        paymentId, 
        cancelReason: '관리자 요청에 의한 취소' 
      });
      
      const { success, message } = result.data as any;

      if (success) {
        setPayments(payments.map(p => 
          p.id === paymentId ? { ...p, status: 'cancelled' } : p
        ));
        setUsers(users.map(u => 
          u.id === userId ? { ...u, paymentStatus: false } : u
        ));

        alert(message || '결제가 취소되었습니다.');
      }
    } catch (error: any) {
      console.error('결제 취소 실패:', error);
      alert(error.message || '결제 취소 처리에 실패했습니다.');
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSaveNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      if (editingNotice) {
        await updateDoc(doc(db, 'notices', editingNotice.id), {
          title: noticeForm.title,
          content: noticeForm.content,
          category: noticeForm.category,
          is_pinned: noticeForm.is_pinned,
          updated_at: serverTimestamp(),
        });
        alert('공지사항이 수정되었습니다.');
      } else {
        await addDoc(collection(db, 'notices'), {
          title: noticeForm.title,
          content: noticeForm.content,
          category: noticeForm.category,
          is_pinned: noticeForm.is_pinned,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: user?.id || '',
        });
        alert('공지사항이 등록되었습니다.');
      }

      setShowNoticeModal(false);
      setEditingNotice(null);
      setNoticeForm({ title: '', content: '', category: 'general', is_pinned: false });
      fetchAdminData();
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      is_pinned: notice.is_pinned,
    });
    setShowNoticeModal(true);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;

    try {
      await updateDoc(doc(db, 'notices', noticeId), {
        deleted_at: serverTimestamp(),
      });
      alert('공지사항이 삭제되었습니다.');
      fetchAdminData();
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  const handleProcessWithdrawal = async (requestId: string, action: 'approve' | 'reject', rejectReason?: string) => {
    try {
      const processWithdrawalFunction = httpsCallable(functions, 'processWithdrawal');
      const result = await processWithdrawalFunction({ requestId, action, rejectReason });
      const data = result.data as { success: boolean; message: string };
      
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      }
    } catch (error: any) {
      console.error('탈퇴 처리 실패:', error);
      alert(error.message || '탈퇴 처리에 실패했습니다.');
    }
  };

  const handleRejectWithdrawal = () => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    if (rejectingRequestId) {
      handleProcessWithdrawal(rejectingRequestId, 'reject', rejectReason);
      setShowRejectModal(false);
      setRejectingRequestId(null);
      setRejectReason('');
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
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              관리자 로그인
            </h2>

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loginLoading ? '로그인 중...' : '관리자 로그인'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">관리자 페이지</h1>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b flex-wrap">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              등록 목록 ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              결제 관리 ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'notices'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              공지사항 ({notices.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'withdrawals'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              탈퇴 신청 ({withdrawalRequests.filter(w => w.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'config'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              기본 설정
            </button>
            <button
              onClick={() => setActiveTab('site_settings')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'site_settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              PG 및 약관 관리
            </button>
            <button
              onClick={() => setActiveTab('alimtalk')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'alimtalk'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              알림톡 설정
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 min-w-[120px] py-4 px-6 font-medium ${
                activeTab === 'messages'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              축하메시지
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    엑셀 다운로드
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-24">이름</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">전화번호</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-40">학과 / 입학</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">소속</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-24">결제 상태</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">등록일</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 w-20">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {u.department || '-'}
                          {u.enrollment_year && <span className="text-gray-400 text-sm ml-1">({u.enrollment_year})</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="truncate max-w-[200px]" title={`${(u as any).company || ''} ${(u as any).position || ''}`}>
                            {(u as any).company || '-'}
                            {(u as any).position && <span className="text-gray-400 text-sm ml-1">{(u as any).position}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              u.paymentStatus
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {u.paymentStatus ? '완료' : '미결'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openUserModal(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="상세보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="이름, 주문번호로 검색..."
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">신청자 이름</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">주문번호</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">금액</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">상태</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">유형</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">결제일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter(p => 
                        !paymentSearchTerm || 
                        (p.user_name && p.user_name.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
                        (p.order_id && p.order_id.toLowerCase().includes(paymentSearchTerm.toLowerCase()))
                      )
                      .map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{p.user_name || '-'}</td>
                          <td className="py-3 px-4">{p.order_id}</td>
                          <td className="py-3 px-4 font-bold">{p.amount.toLocaleString()}원</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                p.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : p.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {p.status === 'completed' && '완료'}
                              {p.status === 'pending' && '대기'}
                              {p.status === 'failed' && '실패'}
                              {p.status === 'cancelled' && '취소'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {p.payment_type === 'membership' && '회비'}
                            {p.payment_type === 'donation' && '후원금'}
                            {p.payment_type === 'event' && '이벤트'}
                          </td>
                          <td className="py-3 px-4 text-sm">{formatDate(p.created_at)}</td>
                          <td className="py-3 px-4">
                            {p.status === 'completed' && (
                              <button
                                onClick={() => handleCancelPayment(p.id, p.user_id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                취소
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'notices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-blue-900">공지사항 관리</h3>
                  <button
                    onClick={() => {
                      setEditingNotice(null);
                      setNoticeForm({ title: '', content: '', category: 'general', is_pinned: false });
                      setShowNoticeModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    공지사항 등록
                  </button>
                </div>

                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {notice.is_pinned && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                중요
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              notice.category === 'urgent' ? 'bg-red-100 text-red-700' :
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
                          <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(notice.created_at)}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditNotice(notice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <p className="text-center text-gray-500 py-8">등록된 공지사항이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-blue-900">탈퇴 신청 관리</h3>
                
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              request.status === 'approved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {request.status === 'pending' && '대기중'}
                              {request.status === 'approved' && '승인됨'}
                              {request.status === 'rejected' && '거절됨'}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900">{request.user_name}</h4>
                          <p className="text-sm text-gray-600">{request.user_email}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">사유:</span> {request.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            신청일: {formatDate(request.requested_at)}
                          </p>
                          {request.reject_reason && (
                            <p className="text-sm text-red-600 mt-2">
                              <span className="font-medium">거절 사유:</span> {request.reject_reason}
                            </p>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleProcessWithdrawal(request.id, 'approve')}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              승인
                            </button>
                            <button
                              onClick={() => {
                                setRejectingRequestId(request.id);
                                setShowRejectModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              거절
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {withdrawalRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-8">탈퇴 신청이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-4xl">
                <h3 className="text-xl font-bold mb-6 text-blue-900">기간별 금액 설정</h3>

                <div className="space-y-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-2 text-yellow-800">⚠️ 중요</h4>
                    <p className="text-sm text-yellow-700">
                      기본 참가비 설정은 제거되었습니다. <strong>기간별 금액 설정</strong>을 사용해주세요.
                      활성화된 기간별 금액이 없으면 결제가 불가능합니다.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold">기간별 금액 설정 (얼리버드 등)</h4>
                      <button
                        onClick={handleAddPriceTier}
                        className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        구간 추가
                      </button>
                    </div>
                    
                    {priceTiers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        설정된 기간별 금액이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {priceTiers.map((tier) => (
                          <div key={tier.id} className="flex flex-wrap md:flex-nowrap gap-4 items-start border p-4 rounded-lg bg-gray-50">
                            <div className="flex-1 min-w-[200px]">
                              <label className="block text-xs font-medium text-gray-500 mb-1">라벨 (예: 얼리버드)</label>
                              <input
                                type="text"
                                value={tier.label}
                                onChange={(e) => handleUpdatePriceTier(tier.id, 'label', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="구간 이름"
                              />
                            </div>
                            <div className="w-full md:w-40">
                              <label className="block text-xs font-medium text-gray-500 mb-1">시작일</label>
                              <input
                                type="date"
                                value={tier.startDate}
                                onChange={(e) => handleUpdatePriceTier(tier.id, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                              />
                            </div>
                            <div className="w-full md:w-40">
                              <label className="block text-xs font-medium text-gray-500 mb-1">종료일</label>
                              <input
                                type="date"
                                value={tier.endDate}
                                onChange={(e) => handleUpdatePriceTier(tier.id, 'endDate', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                              />
                            </div>
                             <div className="w-full md:w-40">
                               <label className="block text-xs font-medium text-gray-500 mb-1">금액 (원)</label>
                               <input
                                 type="number"
                                 value={tier.amount}
                                 onChange={(e) => handleUpdatePriceTier(tier.id, 'amount', parseInt(e.target.value) || 0)}
                                 className="w-full px-3 py-2 border rounded-md"
                               />
                             </div>
                             <div className="flex items-center gap-4 pt-6">
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={tier.active}
                                   onChange={(e) => handleUpdatePriceTier(tier.id, 'active', e.target.checked)}
                                   className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                 />
                                 <span className="text-sm font-medium text-gray-700">활성화</span>
                               </label>
                               <button
                                 onClick={() => handleRemovePriceTier(tier.id)}
                                 className="p-2 text-red-600 hover:bg-red-100 rounded"
                                 title="삭제"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUpdateConfig}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'site_settings' && (
              <div className="max-w-4xl">
                <h3 className="text-xl font-bold mb-6 text-blue-900">PG 및 약관 관리</h3>

                <div className="space-y-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold mb-4 text-gray-900">토스페이먼츠 설정</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          클라이언트 키 (API 개별 연동 키)
                        </label>
                        <input
                          type="text"
                          value={siteConfigForm.clientKey}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, clientKey: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="live_ck_..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          * 토스페이먼츠 API 개별 연동 키 (클라이언트 키)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          시크릿 키 (백엔드용)
                        </label>
                        <input
                          type="password"
                          value={siteConfigForm.secretKey}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, secretKey: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="live_sk_..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          * 토스페이먼츠 시크릿 키 (결제 승인용, 백엔드에서만 사용)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold mb-4 text-gray-900">약관 관리</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이용약관
                        </label>
                        <textarea
                          value={siteConfigForm.service_terms}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, service_terms: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="이용약관 내용을 입력하세요."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          개인정보 처리방침
                        </label>
                        <textarea
                          value={siteConfigForm.privacy_policy}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, privacy_policy: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="개인정보 처리방침 내용을 입력하세요."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          제3자 정보제공 동의
                        </label>
                        <textarea
                          value={siteConfigForm.third_party_provision}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, third_party_provision: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="제3자 정보제공 동의 내용을 입력하세요."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          정보성 메시지 수신동의
                        </label>
                        <textarea
                          value={siteConfigForm.marketing_consent}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, marketing_consent: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="정보성 메시지 수신동의 내용을 입력하세요."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          환불정책
                        </label>
                        <textarea
                          value={siteConfigForm.refund_policy}
                          onChange={(e) => setSiteConfigForm({ ...siteConfigForm, refund_policy: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="환불정책 내용을 입력하세요."
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateSiteConfig}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    사이트 설정 저장
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'alimtalk' && (
              <AlimtalkSettings user={user} />
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">축하메시지 관리</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      전체 ({messages.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      대기중 ({messages.filter(m => !m.isApproved).length})
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      승인됨 ({messages.filter(m => m.isApproved).length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">이름</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">메시지</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 w-24">상태</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 w-32">등록일</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600 w-32">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => (
                        <tr key={msg.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{msg.senderName}</td>
                          <td className="py-3 px-4 text-gray-600">{msg.content}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                msg.isApproved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {msg.isApproved ? '승인됨' : '대기중'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleDateString('ko-KR') : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {!msg.isApproved && (
                              <button
                                onClick={async () => {
                                  if (confirm('이 메시지를 승인하시겠습니까?')) {
                                    await updateDoc(doc(db, 'messages', msg.id), { isApproved: true });
                                    const updatedMessages = messages.map(m => 
                                      m.id === msg.id ? { ...m, isApproved: true } : m
                                    );
                                    setMessages(updatedMessages);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-1"
                              >
                                승인
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm('이 메시지를 삭제하시겠습니까?')) {
                                  await deleteDoc(doc(db, 'messages', msg.id));
                                  const updatedMessages = messages.filter(m => m.id !== msg.id);
                                  setMessages(updatedMessages);
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                      {messages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            등록된 축하메시지가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {showNoticeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingNotice ? '공지사항 수정' : '공지사항 등록'}
                </h3>
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    setEditingNotice(null);
                    setNoticeForm({ title: '', content: '', category: 'general', is_pinned: false });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">일반</option>
                    <option value="event">행사</option>
                    <option value="payment">결제</option>
                    <option value="urgent">긴급</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="공지사항 제목을 입력하세요."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="공지사항 내용을 입력하세요."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={noticeForm.is_pinned}
                    onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_pinned" className="ml-2 text-sm font-medium text-gray-700">
                    상단 고정 (중요 공지)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNoticeModal(false);
                      setEditingNotice(null);
                      setNoticeForm({ title: '', content: '', category: 'general', is_pinned: false });
                    }}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveNotice}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingNotice ? '수정' : '등록'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">탈퇴 거절</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingRequestId(null);
                    setRejectReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절 사유
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="거절 사유를 입력해주세요."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingRequestId(null);
                    setRejectReason('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleRejectWithdrawal}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  거절
                </button>
              </div>
            </div>
          </div>
        )}

        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">회원 상세 정보</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">Step 1: 본인 인증 정보</h4>
                  <dl className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">휴대전화 번호</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.phone || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">비밀번호</dt>
                        <dd className="text-sm text-gray-900 mt-1">****** (보안정보)</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">Step 2: 기본 정보</h4>
                  <dl className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">성명 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">생년월일 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.birthdate || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">핸드폰 (인증된 번호) *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.phone || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">이메일 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.email || '-'}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">주소 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {selectedUser.address ? (
                            <>
                              {selectedUser.address}
                              {selectedUser.address_detail && ` ${selectedUser.address_detail}`}
                            </>
                          ) : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">학과명 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.department || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">입학년도 *</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedUser.enrollment_year || '-'}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">선택: 직장 정보</h4>
                  <dl className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">회사명</dt>
                        <dd className="text-sm text-gray-900 mt-1">{(selectedUser as any).company || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">부서명</dt>
                        <dd className="text-sm text-gray-900 mt-1">{(selectedUser as any).company_department || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">직위</dt>
                        <dd className="text-sm text-gray-900 mt-1">{(selectedUser as any).position || '-'}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">120주년 축하 메시지</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">메시지</dt>
                      <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">
                        {selectedUser.message || '메시지 없음'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">Step 3: 추가 프로그램 신청</h4>
                  <dl className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        • Ⅰ. 서울 근교 투어: {(selectedUser as any).additional_program_domestic_tour 
                            ? `✅ 신청 (${(selectedUser as any).additional_program_domestic_tour_option === 'option1' ? '선택1: 게스트룸' : '선택2: 신라스테이'})` 
                            : '❌ 미신청'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        • Ⅱ. 캠퍼스 투어: {(selectedUser as any).additional_program_campus_tour ? '✅ 신청' : '❌ 미신청'}
                      </span>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">Step 4: 개인정보 이용동의</h4>
                  <dl className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        • 개인정보 수집 및 이용 동의: {(selectedUser as any).consent?.privacy_policy ? '✅ 동의' : '❌ 미동의'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        • 개인정보 제3자 제공 동의: {(selectedUser as any).consent?.third_party_provision ? '✅ 동의' : '❌ 미동의'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        • 마케팅 정보 수신 동의: {(selectedUser as any).consent?.marketing_consent ? '✅ 동의' : '❌ 미동의'}
                      </span>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-lg">시스템 정보</h4>
                  <dl className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">결제 상태</dt>
                        <dd className="mt-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              selectedUser.paymentStatus
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {selectedUser.paymentStatus ? '✅ 결제 완료' : '⏳ 결제 미완료'}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">가입일</dt>
                        <dd className="text-sm text-gray-900 mt-1">{formatDate(selectedUser.created_at)}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
