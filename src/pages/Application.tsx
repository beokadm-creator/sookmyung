import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { RegisterFormData, SiteConfig, UserConsent } from '../types';
import { X, Phone, Lock, User, CheckCircle, AlertCircle, Calendar, MapPin, Mail, School, MessageSquare, CreditCard } from 'lucide-react';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useRateLimit } from '../hooks/useRateLimit';

export default function Application() {
  const [formData, setFormData] = useState<RegisterFormData>({
    phone: '',
    password: '',
    name: '',
    verificationCode: '',
    department: '',
    birthdate: '',
    address: '',
    address_detail: '',
    email: '',
    enrollment_year: '',
    message: '',
    additional_program_domestic_tour: false,
    additional_program_domestic_tour_option: null,
    additional_program_campus_tour: false,
    company: '',
    company_department: '',
    position: '',
  });

  const [consent, setConsent] = useState<UserConsent>({
    privacy_policy: false,
    third_party_provision: false,
    marketing_consent: false,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth states
  const [isVerified, setIsVerified] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sendCodeSuccess, setSendCodeSuccess] = useState(false);
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'privacy' | 'third_party' | 'marketing'>('privacy');

  // Payment states
  const [amount, setAmount] = useState(0);
  const [priceLabel, setPriceLabel] = useState('');

  const navigate = useNavigate();
  const { isBlocked, checkRateLimit } = useRateLimit();

  // Load Config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Load Site Config (Terms only)
        const configDoc = await getDoc(doc(db, 'settings', 'site_config'));
        if (configDoc.exists()) {
          const data = configDoc.data() as SiteConfig;
          setSiteConfig(data);
        }

        // Load Event Settings (Fee)
        const eventConfigDoc = await getDoc(doc(db, 'config', 'event_settings'));
        if (eventConfigDoc.exists()) {
          const eventData = eventConfigDoc.data();

          let currentFee = null;
          let currentLabel = '';

          // Only use price tiers, ignore registrationFee
          if (eventData.priceTiers && Array.isArray(eventData.priceTiers)) {
            const today = new Date().toISOString().split('T')[0];
            const activeTier = eventData.priceTiers.find((tier: any) =>
              tier.active && today >= tier.startDate && today <= tier.endDate
            );

            if (activeTier) {
              currentFee = activeTier.amount;
              currentLabel = activeTier.label;
            }
          }

          if (currentFee === null) {
            console.warn('No active price tier found');
          }

          setAmount(currentFee || 0);
          setPriceLabel(currentLabel);
        }
      } catch (err) {
        console.error('Config load error:', err);
      }
    };

    loadConfig();
  }, []);

  // Handlers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSendVerificationCode = async () => {
    setError('');
    setShowAlreadyRegistered(false);

    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      setError(`요청이 너무 많습니다. ${Math.ceil(rateLimitResult.remainingTime! / 1000)}초 후에 다시 시도해주세요.`);
      return;
    }

    setIsSendingCode(true);

    const normalizedPhone = formData.phone.startsWith('010')
      ? formData.phone
      : `010${formData.phone}`;

    try {
      const sendCode = httpsCallable(functions, 'sendVerificationCode');
      const result = await sendCode({
        phone: normalizedPhone,
      });

      const { success, message, code, alimtalkError } = result.data as any;

      if (success) {
        setSendCodeSuccess(true);

        // TEST USER: Auto-fill verification code for 010-1234-1234
        if (normalizedPhone === '01012341234' && code) {
          setFormData({ ...formData, verificationCode: code });
          alert(`테스트용 인증번호가 자동 입력되었습니다: ${code}`);
        } else if (code) {
          alert(`인증번호: ${code}\n(개발 모드: 알림톡 발송 실패 시 코드가 표시됩니다)`);
        } else if (alimtalkError) {
          alert(`인증번호가 발송되었습니다.\n\n참고: 알림톡 발송에 일부 문제가 있을 수 있습니다. 카카오 알림톡을 확인해주세요.`);
        } else {
          alert('인증번호가 발송되었습니다. 카카오 알림톡을 확인해주세요.');
        }
      } else {
        setError(message || '인증번호 발송에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Send code error:', err);
      if (err.code === 'already-exists') {
        setShowAlreadyRegistered(true);
        setError('이미 등록된 전화번호입니다.');
      } else {
        setError(err.message || '인증번호 발송 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setIsVerifying(true);

    const normalizedPhone = formData.phone.startsWith('010')
      ? formData.phone
      : `010${formData.phone}`;

    try {
      const verifyCode = httpsCallable(functions, 'verifyCode');
      const result = await verifyCode({
        phone: normalizedPhone,
        code: formData.verificationCode,
      });

      const { success, tempToken: token, message } = result.data as any;

      if (success && token) {
        setTempToken(token);
        setIsVerified(true);
        setSendCodeSuccess(false);

      } else {
        setError(message || '인증번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('Verify code error:', err);
      setError(err.message || '인증 확인 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setConsent({
      privacy_policy: checked,
      third_party_provision: checked,
      marketing_consent: checked,
    });
  };

  const handleConsentChange = (field: keyof UserConsent, checked: boolean) => {
    setConsent({ ...consent, [field]: checked });
    const allChecked = { ...consent, [field]: checked };
    const allSelected = Object.values(allChecked).every(v => v === true);
    setSelectAll(allSelected);
  };

  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setFormData({ ...formData, address: fullAddress });
    setIsAddressModalOpen(false);
  };

  // Validation
  const isFormValid = () => {
    if (!isVerified) return false;
    if (formData.password.length !== 6) return false;
    if (!formData.name.trim()) return false;
    if (!formData.birthdate.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.email.trim()) return false; // Basic email check?
    if (!formData.department.trim()) return false;
    if (!formData.enrollment_year.trim()) return false;
    // Message is optional? "기본정보(... 축하 메세지) 입력". Usually messages are optional but listed in basic info.
    // If it's "Input ... Message", it might be required. I'll make it optional unless specified.
    // Prompt says "Basic info (...) input". It lists it. I'll assume it's part of the input.
    // Let's assume required for now as it's in the list of inputs.
    if (!formData.message.trim()) return false; 
    
    if (!consent.privacy_policy || !consent.third_party_provision) return false;
    
    // Step 3 Validation: If domestic tour is selected, an option must be chosen
    if (formData.additional_program_domestic_tour && !formData.additional_program_domestic_tour_option) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('모든 필수 항목을 입력하고 동의해주세요.');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedPhone = formData.phone.startsWith('010')
        ? formData.phone
        : `010${formData.phone}`;

      // Register user first
      const registerRequest = httpsCallable(functions, 'registerWithPhone');
      const registerResult = await registerRequest({
        tempToken: tempToken,
        password: formData.password,
        name: formData.name,
        department: formData.department,
        birthdate: formData.birthdate,
        address: formData.address,
        address_detail: formData.address_detail,
        email: formData.email,
        enrollment_year: formData.enrollment_year,
        message: formData.message,
        consent: consent,
        additional_program_domestic_tour: formData.additional_program_domestic_tour,
        additional_program_domestic_tour_option: formData.additional_program_domestic_tour_option,
        additional_program_campus_tour: formData.additional_program_campus_tour,
        company: formData.company,
        company_department: formData.company_department,
        position: formData.position,
      });

      const { success, userId, message } = registerResult.data as any;

      if (!success) {
        throw new Error(message || '신청에 실패했습니다.');
      }

      // Save to localStorage and navigate to checkout
      localStorage.setItem('temp_application_data', JSON.stringify({
        userId,
        name: formData.name,
        email: formData.email,
        phone: normalizedPhone,
        amount,
        priceLabel
      }));

      navigate('/checkout');
    } catch (err: any) {
      console.error('Submission error:', err);

      let errorMessage = '처리 중 오류가 발생했습니다.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'failed-precondition') {
        errorMessage = '결제 시스템이 구성되지 않았습니다. 관리자에게 문의해주세요.';
      } else if (err.details) {
        errorMessage = err.details;
      }

      setError(errorMessage);
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  // Check for payment failure query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const message = urlParams.get('message');
    
    if (code && message) {
      setError(`결제 실패: ${message}`);
    }
  }, []);

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-900 py-6 px-8">
              <h2 className="text-2xl font-bold text-white text-center">
                숙명여자대학교 창학120주년 기념 전야제 참가신청
              </h2>
            </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-4 sm:p-8 space-y-10">
                {/* 1. Phone Verification & Password */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 1</span>
                  본인 인증 및 비밀번호 설정
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      휴대전화 번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="01012345678"
                        disabled={isVerified}
                      />
                    </div>
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode || formData.phone.length < 10}
                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                      >
                        {isSendingCode ? '인증번호 발송 중...' : '인증번호 발송'}
                      </button>
                    )}
                  </div>

                  {/* Verification Code */}
                  {sendCodeSuccess && !isVerified && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        인증번호 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="verificationCode"
                          value={formData.verificationCode}
                          onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="인증번호 6자리"
                          maxLength={6}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={isVerifying || formData.verificationCode.length !== 6}
                          className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 flex-shrink-0"
                        >
                          확인
                        </button>
                      </div>
                    </div>
                  )}

                  {isVerified && (
                    <div className="md:col-span-2 flex items-center text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">본인 인증이 완료되었습니다.</span>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 설정 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="숫자 6자리"
                        maxLength={6}
                        disabled={!isVerified}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">신청 내역 확인 시 사용될 비밀번호입니다. (숫자 6자리)</p>
                  </div>
                </div>
              </section>

              {/* 2. Basic Info */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 2</span>
                  기본 정보 입력
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      성명 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="홍길동"
                      />
                    </div>
                  </div>

                  {/* Birthdate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      생년월일 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="YYYYMMDD (예: 19900101)"
                        maxLength={8}
                      />
                    </div>
                  </div>

                  {/* Mobile (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      핸드폰 <span className="text-gray-400 text-xs">(인증된 번호)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.phone ? formData.phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') : ''}
                        readOnly
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주소 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            readOnly
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                            placeholder="주소 검색을 이용해주세요"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap transition-colors"
                        >
                          주소 검색
                        </button>
                      </div>
                      <input
                        type="text"
                        name="address_detail"
                        value={formData.address_detail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="상세 주소를 입력해주세요"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학과명 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 컴퓨터과학전공"
                      />
                    </div>
                  </div>

                  {/* Enrollment Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      입학년도 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="enrollment_year"
                        value={formData.enrollment_year}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 2020"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* Company Info (Optional) */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 mt-4">
                    <div className="md:col-span-3 mb-2">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded mr-2">선택</span>
                        직장 정보 (선택사항)
                      </h4>
                    </div>
                    
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        회사명
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={(formData as any).company || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="회사명 입력"
                      />
                    </div>

                    {/* Department Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        부서명
                      </label>
                      <input
                        type="text"
                        name="company_department"
                        value={(formData as any).company_department || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="부서명 입력"
                      />
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직위
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={(formData as any).position || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="직위 입력"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      120주년 축하 메세지 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-6 text-gray-400 w-5 h-5" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="숙명여대 창학 120주년 축하 메세지를 남겨주세요."
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Additional Programs */}
              <section className="space-y-6 pt-6 border-t font-noto-sans">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 3</span>
                  추가 프로그램 신청
                  <span className="ml-2 text-xs font-normal text-gray-500">(중복 신청 가능)</span>
                </h3>

                <div className="space-y-6">
                  {/* Program I: Seoul Environs Tour */}
                  <div className={`rounded-xl border-2 transition-all overflow-hidden ${formData.additional_program_domestic_tour ? 'border-sookmyung-blue-500 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="p-5">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additional_program_domestic_tour || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              additional_program_domestic_tour: checked,
                              additional_program_domestic_tour_option: checked ? formData.additional_program_domestic_tour_option : null
                            });
                          }}
                          className="mt-1 w-6 h-6 text-sookmyung-blue-600 border-gray-300 rounded focus:ring-sookmyung-blue-500"
                        />
                        <div className="ml-3">
                          <span className="text-lg font-bold text-gray-900">Ⅰ. 서울 근교 투어</span>
                          <p className="text-sm text-gray-500 mt-1">2026.5.22(금)~5.24(일) / 2박3일</p>
                        </div>
                      </label>

                      {/* Sub Options for Program I */}
                      <div className={`mt-5 space-y-3 pl-9 transition-opacity duration-300 ${formData.additional_program_domestic_tour ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <p className="text-sm font-semibold text-sookmyung-blue-900 mb-2">• 프로그램 및 참가비 (택 1 필수)</p>
                        
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.additional_program_domestic_tour_option === 'option1' ? 'border-sookmyung-blue-500 bg-sookmyung-blue-50' : 'border-gray-200 bg-white hover:border-sookmyung-blue-200'}`}>
                          <input
                            type="radio"
                            name="domestic_tour_option"
                            checked={formData.additional_program_domestic_tour_option === 'option1'}
                            onChange={() => setFormData({ ...formData, additional_program_domestic_tour_option: 'option1' })}
                            className="w-4 h-4 text-sookmyung-blue-600 focus:ring-sookmyung-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-800">
                            <strong>선택1.</strong> 동문회관 게스트룸 숙박+관광+식사: <span className="font-bold text-sookmyung-blue-600">USD 700</span>
                          </span>
                        </label>

                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.additional_program_domestic_tour_option === 'option2' ? 'border-sookmyung-blue-500 bg-sookmyung-blue-50' : 'border-gray-200 bg-white hover:border-sookmyung-blue-200'}`}>
                          <input
                            type="radio"
                            name="domestic_tour_option"
                            checked={formData.additional_program_domestic_tour_option === 'option2'}
                            onChange={() => setFormData({ ...formData, additional_program_domestic_tour_option: 'option2' })}
                            className="w-4 h-4 text-sookmyung-blue-600 focus:ring-sookmyung-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-800">
                            <strong>선택2.</strong> 삼성동 신라스테이 숙박+관광+식사: <span className="font-bold text-sookmyung-blue-600">USD 850</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Program II: Campus Tour */}
                  <div className={`rounded-xl border-2 transition-all p-5 ${formData.additional_program_campus_tour ? 'border-green-500 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.additional_program_campus_tour || false}
                        onChange={(e) => setFormData({ ...formData, additional_program_campus_tour: e.target.checked })}
                        className="mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="ml-3">
                        <span className="text-lg font-bold text-gray-900">Ⅱ. 캠퍼스 투어</span>
                        <p className="text-sm text-gray-500 mt-1">2026.5.21(목) / 오후(시간 추후 공지)</p>
                        <p className="text-xs text-green-600 font-bold mt-1">프로그램: 캠퍼스 투어(무료)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              {/* 4. Agreements */}
              <section className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 4</span>
                  개인정보 이용동의
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start pb-3 border-b border-gray-200">
                    <input
                      type="checkbox"
                      id="select_all"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="select_all" className="ml-3 text-sm font-bold text-gray-900 cursor-pointer">
                      전체 동의하기
                    </label>
                  </div>

                  {['privacy_policy', 'third_party_provision', 'marketing_consent'].map((key) => (
                    <div key={key} className="flex items-start">
                      <input
                        type="checkbox"
                        id={key}
                        checked={consent[key as keyof UserConsent]}
                        onChange={(e) => handleConsentChange(key as keyof UserConsent, e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={key} className="ml-2 text-sm text-gray-700 flex-1">
                        <span className={key !== 'marketing_consent' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          [{key !== 'marketing_consent' ? '필수' : '선택'}]
                        </span>{' '}
                        {key === 'privacy_policy' && '개인정보 수집 및 이용 동의'}
                        {key === 'third_party_provision' && '개인정보 제3자 제공 동의'}
                        {key === 'marketing_consent' && '마케팅 정보 수신 동의'}
                        <button
                          type="button"
                          onClick={() => {
                            setActivePolicyTab(key === 'privacy_policy' ? 'privacy' : key === 'third_party_provision' ? 'third_party' : 'marketing');
                            setShowPolicyModal(true);
                          }}
                          className="ml-2 text-blue-600 hover:underline text-xs"
                        >
                          보기
                        </button>
                      </label>
                    </div>
                  ))}

                  {siteConfig?.terms?.refund_policy && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                            환불정책 확인
                          </div>
                          <span className="transition group-open:rotate-180">
                            <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20">
                              <path d="M6 9l6 6 6-6"></path>
                            </svg>
                          </span>
                        </summary>
                        <div className="text-xs text-gray-600 mt-3 leading-relaxed whitespace-pre-line bg-orange-50 p-3 rounded">
                          {siteConfig.terms.refund_policy}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </section>

              {/* 5. Payment */}
              {isVerified && (
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 5</span>
                    결제하기
                  </h3>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-700 font-semibold">총 결제 금액</span>
                        {priceLabel && (
                          <span className="ml-2 text-sm text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">
                            {priceLabel} 적용
                          </span>
                        )}
                      </div>
                      <span className="text-3xl font-bold text-blue-700">{amount.toLocaleString()}원</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      <CreditCard className="w-4 h-4 inline mr-1" />
                      신청 완료 후 Toss Payments 결제 페이지로 이동합니다.
                    </p>
                  </div>
                </section>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    '참가 신청 및 결제하기'
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  위 버튼을 누르면 결제 창이 호출됩니다.
                </p>
              </div>
            </form>
          </div>
        </div>
      </Layout>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">주소 검색</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <DaumPostcodeEmbed onComplete={handleAddressComplete} autoClose={false} style={{ width: '100%', height: '400px' }} />
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && siteConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">약관 상세 내용</h2>
              <button onClick={() => setShowPolicyModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex border-b">
              {['privacy', 'third_party', 'marketing'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePolicyTab(tab as any)}
                  className={`flex-1 py-3 text-sm font-medium ${activePolicyTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'privacy' && '개인정보'}
                  {tab === 'third_party' && '제3자 제공'}
                  {tab === 'marketing' && '마케팅'}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {activePolicyTab === 'privacy' && (siteConfig.terms.privacy_policy || '내용이 없습니다.')}
                {activePolicyTab === 'third_party' && (siteConfig.terms.third_party_provision || '내용이 없습니다.')}
                {activePolicyTab === 'marketing' && (siteConfig.terms.marketing_consent || '내용이 없습니다.')}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}