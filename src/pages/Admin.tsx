import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, functions } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  setDoc, 
  serverTimestamp, 
  addDoc, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Download, 
  Eye, 
  RefreshCw, 
  Send, 
  MessageSquare,
  ShieldCheck,
  Lock,
  Mail,
  ChevronRight,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { User, Payment, Config, Notice, WithdrawalRequest, SiteConfig, PriceTier, Message } from '../types';
import * as XLSX from 'xlsx';

// Modular Components
import AdminSidebar, { AdminTab } from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import PaymentManagement from '../components/admin/PaymentManagement';
import NoticeManagement from '../components/admin/NoticeManagement';
import WithdrawalManagement from '../components/admin/WithdrawalManagement';
import MessageManagement from '../components/admin/MessageManagement';
import ConfigManagement from '../components/admin/ConfigManagement';
import SiteSettingsManagement from '../components/admin/SiteSettingsManagement';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import AlimtalkSettings from '../components/admin/AlimtalkSettings';

// UI Helpers
import { formatDate, cn } from '../lib/utils';

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
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  
  // Modals Visibility
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'general' as 'event' | 'payment' | 'general' | 'urgent',
    is_pinned: false,
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Login State
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
      const usersQuery = query(collection(db, 'users'), orderBy('created_at', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
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
    } catch (err: any) {
      setLoginError('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('정말로 로그아웃 하시겠습니까?')) {
      await signOut(auth);
      setUser(null);
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

  const handleUpdateUserStatus = async (userId: string, paymentStatus: boolean, vbankStatus: string) => {
    if (!window.confirm(`사용자의 상태를 '결제완료'로 변경하시겠습니까? 신청 완료 알림톡이 발송됩니다.`)) return;

    try {
      const updateUserStatus = httpsCallable(functions, 'updateUserStatus');
      await updateUserStatus({ userId, paymentStatus, vbankStatus });
      alert('변경되었습니다.');
      fetchAdminData();
    } catch (err: any) {
      alert('변경 중 오류 발생: ' + err.message);
    }
  };

  const handleSendManualAlimtalk = async (userId: string, templateType: 'welcome' | 'pending') => {
    if (!window.confirm(`${templateType === 'welcome' ? '참가확정' : '입금대기'} 알림톡을 수동 발송하시겠습니까?`)) return;

    try {
      const sendManualAlimtalkFunction = httpsCallable(functions, 'sendManualAlimtalk');
      const result = await sendManualAlimtalkFunction({ userId, templateType });
      alert((result.data as any).message);
    } catch (err: any) {
      alert('발송 중 오류 발생: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`${name}님의 정보를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const deleteUserByAdmin = httpsCallable(functions, 'deleteUserByAdmin');
      await deleteUserByAdmin({ userId });
      alert('삭제되었습니다.');
      fetchAdminData();
    } catch (err: any) {
      alert('삭제 중 오류 발생: ' + err.message);
    }
  };

  const handleCancelPayment = async (paymentId: string, userId: string) => {
    if (!window.confirm('정말로 이 결제를 취소하시겠습니까? PG사 취소가 진행됩니다.')) return;

    try {
      const cancelPaymentFunction = httpsCallable(functions, 'cancelPaymentByAdmin');
      const result = await cancelPaymentFunction({ paymentId, cancelReason: '관리자 요청 취소' });
      const { success, message } = result.data as any;
      if (success) {
        alert(message || '결제가 취소되었습니다.');
        fetchAdminData();
      }
    } catch (error: any) {
      alert(error.message || '취소 처리에 실패했습니다.');
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
      alert(error.message || '처리에 실패했습니다.');
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    try {
      if (editingNotice) {
        await updateDoc(doc(db, 'notices', editingNotice.id), {
          ...noticeForm,
          updated_at: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'notices'), {
          ...noticeForm,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: user?.id || '',
        });
      }
      setShowNoticeModal(false);
      setEditingNotice(null);
      setNoticeForm({ title: '', content: '', category: 'general', is_pinned: false });
      fetchAdminData();
    } catch (err) {
      alert('공지사항 저장 실패');
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      alert('공지사항이 삭제되었습니다.');
      fetchAdminData();
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  const handleUpdatePriceTier = (id: string, field: keyof PriceTier, value: any) => {
    setPriceTiers(priceTiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSaveConfig = async () => {
    if (priceTiers.length === 0) return alert('최소 1개 이상의 정책이 필요합니다.');
    try {
      await setDoc(doc(db, 'config', 'event_settings'), {
        priceTiers,
        updated_at: serverTimestamp(),
      }, { merge: true });
      alert('저장되었습니다.');
    } catch (err) {
      alert('저장 실패');
    }
  };

  const handleSaveSiteConfig = async () => {
    try {
      await setDoc(doc(db, 'settings', 'site_config'), {
        id: 'site_config',
        pg_config: { 
          clientKey: siteConfigForm.clientKey, 
          secretKey: siteConfigForm.secretKey, 
          pg_provider: 'toss', 
          enabled: true 
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
      alert('저장되었습니다.');
    } catch (err) {
      alert('저장 실패');
    }
  };

  const handleMessageApprove = async (msgId: string) => {
    await updateDoc(doc(db, 'messages', msgId), { isApproved: true });
    fetchAdminData();
  };

  const handleMessageDelete = async (msgId: string) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'messages', msgId));
    fetchAdminData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-sookmyung-blue-800 animate-spin" />
          <p className="font-bold text-gray-500 animate-pulse uppercase tracking-[0.2em] text-xs">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sookmyung-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-anniversary-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

        <div className="m-auto w-full max-w-xl p-8 lg:p-12 animate-fade-in">
           <div className="bg-white rounded-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="flex-1 p-10 md:p-14">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-sookmyung-blue-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sookmyung-blue-100 rotate-3 hover:rotate-0 transition-transform cursor-default">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">Admin Control</h2>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] mt-2">Professional Authority Required</p>
                    </div>
                 </div>

                 <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Welcome Back</h1>
                 <p className="text-gray-400 text-sm font-medium mb-10">로그인 정보를 입력하여 관리자 시스템에 접속하세요.</p>

                 {loginError && (
                   <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
                     <AlertCircle className="w-5 h-5 shrink-0" />
                     <p className="text-sm font-bold">{loginError}</p>
                   </div>
                 )}

                 <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2 group">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1 block group-focus-within:text-sookmyung-blue-600 transition-colors">Administrator Email</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-sookmyung-blue-600 transition-colors" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-sookmyung-blue-600 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                            placeholder="admin@sookmyung.com"
                          />
                       </div>
                    </div>

                    <div className="space-y-2 group">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1 block group-focus-within:text-sookmyung-blue-600 transition-colors">Security Credentials</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-sookmyung-blue-600 transition-colors" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sookmyung-blue-600 focus:bg-white transition-all outline-none tracking-widest placeholder:tracking-normal placeholder:text-gray-300"
                            placeholder="••••••••"
                          />
                       </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-sookmyung-blue-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-sookmyung-blue-100 disabled:bg-gray-200 disabled:shadow-none active:scale-[0.98] group flex items-center justify-center gap-3"
                    >
                      {loginLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Authorize Access
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                 </form>

                 <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <span>© Sookmyung Women's Univ</span>
                    <span>Systems 2026</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview users={users} payments={payments} messages={messages} withdrawals={withdrawalRequests} />;
      case 'users':
        return (
          <UserManagement 
            users={users} 
            onExportExcel={handleExportExcel}
            onUpdateStatus={handleUpdateUserStatus}
            onSendManualAlimtalk={handleSendManualAlimtalk}
            onDeleteUser={handleDeleteUser}
            onOpenUserDetails={(u) => setSelectedUser(u)}
          />
        );
      case 'payments':
        return <PaymentManagement payments={payments} onCancelPayment={handleCancelPayment} />;
      case 'notices':
        return (
          <NoticeManagement 
            notices={notices} 
            onAdd={() => setShowNoticeModal(true)} 
            onEdit={(n) => { setEditingNotice(n); setNoticeForm(n); setShowNoticeModal(true); }}
            onDelete={(id) => handleDeleteNotice(id)}
          />
        );
      case 'withdrawals':
        return <WithdrawalManagement requests={withdrawalRequests} onProcess={handleProcessWithdrawal} />;
      case 'messages':
        return <MessageManagement messages={messages} onApprove={handleMessageApprove} onDelete={handleMessageDelete} />;
      case 'alimtalk':
        return <AlimtalkSettings user={user} />;
      case 'config':
        return (
          <ConfigManagement 
            priceTiers={priceTiers}
            onAddTier={() => setPriceTiers([...priceTiers, { id: Date.now().toString(), label: '', startDate: '', endDate: '', amount: 0, active: true }])}
            onRemoveTier={(id) => setPriceTiers(priceTiers.filter(t => t.id !== id))}
            onUpdateTier={handleUpdatePriceTier}
            onSave={handleSaveConfig}
          />
        );
      case 'site_settings':
        return (
          <SiteSettingsManagement 
            formData={siteConfigForm}
            onChange={(field, value) => setSiteConfigForm({ ...siteConfigForm, [field]: value })}
            onSave={handleSaveSiteConfig}
          />
        );
      default:
        return <div>Not Yet Implemented</div>;
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        counts={{
          users: users.length,
          payments: payments.length,
          notices: notices.length,
          withdrawals: withdrawalRequests.filter(r => r.status === 'pending').length,
          messages: messages.filter(m => !m.isApproved).length
        }}
      />
      
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Persistence of Modals in parent to maintain state easily */}
      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {showNoticeModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
           <div className="bg-white rounded-4xl p-8 max-w-2xl w-full shadow-2xl animate-slide-up border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingNotice ? 'Edit Announcement' : 'New Announcement'}</h3>
                 <button onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} className="hover:rotate-90 transition-transform">
                   <XCircle className="w-8 h-8 text-gray-200 hover:text-gray-400" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">Category</label>
                       <select
                          value={noticeForm.category}
                          onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sookmyung-blue-600 transition-all"
                       >
                          <option value="general">일반 공지</option>
                          <option value="event">행사 정보</option>
                          <option value="payment">결제/환불</option>
                          <option value="urgent">긴급 안내</option>
                       </select>
                    </div>
                    <div className="flex items-center pt-6 px-4">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={noticeForm.is_pinned}
                            onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                            className="w-5 h-5 rounded-lg text-sookmyung-blue-800 border-gray-200 focus:ring-offset-0 focus:ring-0 transition-all border-none bg-gray-100"
                          />
                          <span className="text-sm font-black text-gray-500 uppercase tracking-tighter group-hover:text-amber-500 transition-colors">📌 Pin to top</span>
                       </label>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">Announcement Title</label>
                    <input
                       type="text"
                       value={noticeForm.title}
                       onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                       className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sookmyung-blue-600 transition-all"
                       placeholder="제목을 입력하세요."
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">Detailed Content</label>
                    <textarea
                       value={noticeForm.content}
                       onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                       rows={6}
                       className="w-full bg-gray-50 border-none rounded-3xl px-6 py-5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-sookmyung-blue-600 transition-all resize-none"
                       placeholder="공지사항 내용을 자세히 작성해주세요."
                    />
                 </div>

                 <button
                    onClick={handleSaveNotice}
                    className="w-full py-5 bg-sookmyung-blue-800 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-sookmyung-blue-100 hover:bg-black transition-all active:scale-[0.98]"
                 >
                    {editingNotice ? 'Update Post' : 'Publish Announcement'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
