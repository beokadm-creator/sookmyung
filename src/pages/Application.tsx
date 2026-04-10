import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { RegisterFormData, SiteConfig, UserConsent } from '../types';
import { X, Phone, Lock, User, CheckCircle, AlertCircle, Calendar, MapPin, Mail, School, MessageSquare, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useRateLimit } from '../hooks/useRateLimit';

function NoticeBox() {
  return (
    <div className="border-2 border-amber-400 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
        <span className="flex items-center gap-2 font-bold text-amber-900 text-base md:text-lg">
          <span>📢</span>
          One Table 신청 및 참가비 안내
        </span>
      </div>
      <div className="px-6 py-4 space-y-4 text-gray-800 text-base">
        <div className="leading-relaxed">
          <p className="font-bold mb-3">One Table(10좌석) 신청을 희망하시는 대표 신청자께서는<br className="hidden md:block" /> 총동문회 사무국으로 반드시 연락주시기 바랍니다.</p>
          
          <div className="text-sm md:text-base space-y-2 bg-white p-3 border border-amber-200 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-x-2">
              <span className="font-bold text-gray-900 shrink-0">참가비:</span>
              <div className="space-y-0.5">
                <p className="font-medium text-gray-800">
                  <span className="text-blue-600 font-bold">일반예약</span> 28만원 / <span className="text-blue-600 font-bold">조기예약</span>(4/30까지) 25만원
                </p>
                <p className="font-medium text-gray-800">
                  One Table(10좌석) 250만원(전기간 동일 적용)
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-amber-50 rounded-lg py-2 border border-amber-200">
          <p className="text-sm text-gray-600 font-bold">총동문회 사무국 문의</p>
          <p className="font-bold text-gray-900 text-lg md:text-xl">📞 02-712-1212</p>
        </div>
      </div>
    </div>
  );
}

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

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'privacy' | 'third_party' | 'marketing'>('privacy');
  
  // Refund Policy toggle
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  // Payment states
  const [amount, setAmount] = useState(0);
  const [priceLabel, setPriceLabel] = useState('');

  const navigate = useNavigate();
  const { checkRateLimit } = useRateLimit();

  // Font Size state
  const [fontSizeBase, setFontSizeBase] = useState(17);

  const increaseFontSize = () => setFontSizeBase(prev => Math.min(prev + 2, 25));
  const decreaseFontSize = () => setFontSizeBase(prev => Math.max(prev - 2, 13));
  const resetFontSize = () => setFontSizeBase(17);

  // Load Config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'site_config'));
        if (configDoc.exists()) {
          setSiteConfig(configDoc.data() as SiteConfig);
        }

        const eventConfigDoc = await getDoc(doc(db, 'config', 'event_settings'));
        if (eventConfigDoc.exists()) {
          const eventData = eventConfigDoc.data();
          let currentFee = null;
          let currentLabel = '';

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
    const nextConsent = { ...consent, [field]: checked };
    setConsent(nextConsent);
    setSelectAll(Object.values(nextConsent).every(v => v === true));
  };

  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setFormData({ ...formData, address: fullAddress });
    setIsAddressModalOpen(false);
  };

  // Validation
  const getValidationError = () => {
    const normalizedPhone = formData.phone.startsWith('010') ? formData.phone : `010${formData.phone}`;
    if (!/^010\d{8}$/.test(normalizedPhone)) return '올바른 휴대전화 번호를 입력해주세요.';
    if (formData.password.length !== 6) return '비밀번호 6자리를 입력해주세요.';
    if (!formData.name.trim()) return '성명을 입력해주세요.';
    if (!formData.birthdate.trim()) return '생년월일을 입력해주세요.';
    if (!formData.department.trim()) return '소속(학과)를 입력해주세요.';
    if (!formData.enrollment_year.trim()) return '입학년도를 입력해주세요.';
    
    if (!consent.privacy_policy) return '개인정보 수집 및 이용 동의가 필요합니다.';
    if (!consent.third_party_provision) return '개인정보 제3자 제공 동의가 필요합니다.';
    
    if (formData.additional_program_domestic_tour && !formData.additional_program_domestic_tour_option) {
      return '서울 근교 투어를 선택하셨다면 프로그램을 선택해주세요.';
    }
    
    return null;
  };

  const getMissingRequirements = () => {
    const missing = [];
    if (!formData.phone || formData.phone.length < 10) missing.push("휴대전화 번호(01012345678)");
    if (!formData.password || formData.password.length !== 6) missing.push("비밀번호 숫자 6자리");
    if (!formData.name.trim()) missing.push("성명");
    if (!formData.birthdate.trim() || formData.birthdate.length !== 8) missing.push("생년월일 8자리(YYYYMMDD)");
    if (!formData.department.trim()) missing.push("소속(학과)");
    if (!formData.enrollment_year.trim()) missing.push("입학년도");
    if (!consent.privacy_policy) missing.push("개인정보 수집 동의");
    if (!consent.third_party_provision) missing.push("제3자 제공 동의");
    if (formData.additional_program_domestic_tour && !formData.additional_program_domestic_tour_option) {
      missing.push("투어 프로그램 선택");
    }
    return missing;
  };

  const isFormValid = () => getValidationError() === null;

  const handleSubmit = async () => {
    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedPhone = formData.phone.startsWith('010') ? formData.phone : `010${formData.phone}`;
      
      // Verification-less registration: generate pseudo token
      const dummyToken = btoa(`${normalizedPhone}:${Date.now()}`);

      const registerRequest = httpsCallable(functions, 'registerWithPhone');
      const registerResult = await registerRequest({
        tempToken: dummyToken,
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

      const { success, userId, token, message } = registerResult.data as any;

      if (!success) throw new Error(message || '신청에 실패했습니다.');

      localStorage.setItem('temp_application_data', JSON.stringify({
        userId,
        token,
        name: formData.name,
        email: formData.email,
        phone: normalizedPhone,
        amount,
        priceLabel
      }));

      navigate('/checkout');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || '처리 중 오류가 발생했습니다.');
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) setError(`결제 실패: ${message}`);
  }, []);

  return (
    <>
      <style>
        {`
          #application-root { font-size: ${fontSizeBase}px; }
          #application-root .text-xs { font-size: 0.75em !important; }
          #application-root .text-sm { font-size: 0.875em !important; }
          #application-root .text-base { font-size: 1em !important; }
          #application-root .text-lg { font-size: 1.125em !important; }
          #application-root .text-xl { font-size: 1.25em !important; }
          #application-root svg { width: 1.2em; height: 1.2em; }
        `}
      </style>
      <Layout>
        <div id="application-root" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-900 py-6 px-8 relative text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                숙명여자대학교 창학120주년 기념 전야제 참가신청
              </h2>
              <div className="mt-4 flex justify-center gap-2">
                <button type="button" onClick={decreaseFontSize} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors border border-white/30">가-</button>
                <button type="button" onClick={resetFontSize} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors border border-white/30">기본</button>
                <button type="button" onClick={increaseFontSize} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors border border-white/30">가+</button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-4 sm:p-8 space-y-10">
              <NoticeBox />

              {/* Step 1 */}
              <section className="space-y-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 1</span>
                  휴대전화번호 및 비밀번호 설정
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">휴대전화 번호 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="01012345678" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      비밀번호 설정 <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs font-normal text-blue-600">(숫자 6자리 입력)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData({ ...formData, password: val });
                        }}
                        onBlur={(e) => {
                          if (e.target.value.length > 0 && e.target.value.length !== 6) {
                            alert('비밀번호는 반드시 숫자 6자리여야 합니다.');
                          }
                        }}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.password.length > 0 && formData.password.length !== 6 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                        placeholder="숫자 6자리" 
                        maxLength={6} 
                        inputMode="numeric" 
                        autoComplete="new-password" 
                        required
                      />
                    </div>
                    {formData.password.length > 0 && formData.password.length !== 6 && (
                      <p className="text-[10px] text-red-500 mt-1 font-medium">※ 반드시 6자리 숫자를 입력해 주세요. (현재 {formData.password.length}자리)</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">휴대전화번호와 비밀번호가 아이디 역할을 하므로 정확히 입력해 주세요.</p>
                  </div>
                </div>
              </section>

              {/* Step 2 */}
              <section className="space-y-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 2</span>
                  기본 정보 입력
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">성명 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="홍길동" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">생년월일 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" name="birthdate" value={formData.birthdate} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="YYYYMMDD (예: 19900101)" maxLength={8} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">주소 <span className="text-gray-400 text-xs">(선택사항)</span></label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" name="address" value={formData.address} readOnly className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" placeholder="주소 검색 버튼을 이용해주세요" />
                      </div>
                      <button type="button" onClick={() => setIsAddressModalOpen(true)} className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">주소 검색</button>
                    </div>
                    <input type="text" name="address_detail" value={formData.address_detail} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="상세 주소를 입력해주세요" />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      소속(학과) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 컴퓨터과학전공" />
                    </div>
                    <p className="mt-1 text-[11px] md:text-[13px] text-gray-500">※ 동문이 아닌 경우 OOO지인, 교수, 교직원 등 기재</p>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      입학년도 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" name="enrollment_year" value={formData.enrollment_year} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 2020 또는 기타" />
                    </div>
                    <p className="mt-1 text-[11px] md:text-[13px] text-gray-500">※ 동문이 아닌 경우 '기타'로 기재</p>
                  </div>
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">이메일 <span className="text-gray-400 text-xs">(선택사항)</span></label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="example@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">120주년 축하 메시지 <span className="text-gray-400 text-xs">(선택사항)</span></label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-6 text-gray-400 w-5 h-5" />
                        <textarea name="message" value={formData.message} onChange={handleChange} rows={3} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="숙명여대 창학 120주년 축하 메시지를 남겨주세요." />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3 */}
              <section className="space-y-6 pt-6 border-t font-noto-sans">
                <h3 className="text-base md:text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 3</span>
                  추가 프로그램 신청 <span className="ml-2 text-xs font-normal text-gray-500">(선택사항)</span>
                </h3>
                <div className="space-y-6">
                  <div className={`rounded-xl border-2 transition-all overflow-hidden ${formData.additional_program_domestic_tour ? 'border-blue-500 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="p-5">
                      <label className="flex items-start cursor-pointer">
                        <input type="checkbox" checked={formData.additional_program_domestic_tour || false} onChange={(e) => setFormData({ ...formData, additional_program_domestic_tour: e.target.checked, additional_program_domestic_tour_option: e.target.checked ? formData.additional_program_domestic_tour_option : null })} className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <div className="ml-3">
                          <span className="text-base md:text-lg font-bold text-gray-900">서울 근교 투어(※ 해외지회 동문만 신청가능)</span>
                          <p className="text-base md:text-lg font-bold text-gray-900 mt-1">2026.5.22(금)~5.24(일) / 2박3일</p>
                        </div>
                      </label>
                      <div className="mt-5 space-y-3 pl-9">
                        <p className="text-sm font-bold text-blue-900 mb-2">프로그램 및 참가비 (택 1 필수)</p>
                        {['option1', 'option2'].map((opt) => (
                          <label key={opt} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.additional_program_domestic_tour_option === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                            <input type="radio" name="domestic_tour_option" checked={formData.additional_program_domestic_tour_option === opt} onChange={() => setFormData({ ...formData, additional_program_domestic_tour_option: opt as 'option1' | 'option2', additional_program_domestic_tour: true })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-base text-gray-900 font-bold">
                              {opt === 'option1' ? '선택1. 동문회관 게스트룸 숙박+관광+식사: ' : '선택2. 삼성동 신라스테이 숙박+관광+식사: '}
                              <span className="text-blue-600 font-black">{opt === 'option1' ? 'USD 700' : 'USD 850'}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 4 */}
              <section className="space-y-4 pt-6 border-t">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 4</span>
                  개인정보 이용동의
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start pb-3 border-b border-gray-200">
                    <input type="checkbox" id="select_all" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                    <label htmlFor="select_all" className="ml-3 text-sm font-bold text-gray-900 cursor-pointer">전체 동의하기</label>
                  </div>
                  {['privacy_policy', 'third_party_provision', 'marketing_consent'].map((key) => (
                    <div key={key} className="flex items-start">
                      <input type="checkbox" id={key} checked={consent[key as keyof UserConsent]} onChange={(e) => handleConsentChange(key as keyof UserConsent, e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                      <label htmlFor={key} className="ml-2 text-sm text-gray-700 flex-1">
                        <span className={key !== 'marketing_consent' ? 'text-red-600 font-medium' : 'text-gray-500'}>[{key !== 'marketing_consent' ? '필수' : '선택'}]</span>
                        {key === 'privacy_policy' && ' 개인정보 수집 및 이용 동의'}
                        {key === 'third_party_provision' && ' 개인정보 제3자 제공 동의'}
                        {key === 'marketing_consent' && ' 마케팅 정보 수신 동의'}
                        <button type="button" onClick={() => { setActivePolicyTab(key === 'privacy_policy' ? 'privacy' : key === 'third_party_provision' ? 'third_party' : 'marketing'); setShowPolicyModal(true); }} className="ml-2 text-blue-600 hover:underline text-xs">보기</button>
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              {/* Step 5 */}
              <section className="space-y-6 pt-6 border-t">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded mr-2">Step 5</span>
                  결제하기
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-gray-700 font-semibold">총 결제 금액</span>
                      {priceLabel && <span className="ml-2 inline-block text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">{priceLabel} 적용</span>}
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-blue-700">{amount.toLocaleString()}원</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-3 flex items-center gap-1"><CreditCard className="w-4 h-4" /> 신청 완료 후 Toss Payments 결제 페이지로 이동합니다.</p>
                </div>
              </section>

                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs md:text-sm text-blue-800 leading-snug shadow-sm">
                  <p className="font-bold flex items-center gap-1 mb-0.5">📢 얼리버드 기간 연장 안내</p>
                  <p>조기예약 연장에 대한 요청과 문의가 많아 기간을 4/30까지 연장합니다. 원활한 행사를 위한 결정이오니 서둘러 신청해 주신 분들의 너른 양해 부탁드립니다.</p>
                </div>

                <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold md:text-lg shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-400 transform hover:-translate-y-0.5"
                >
                  {loading ? '처리 중...' : '참가 신청 및 결제하기'}
                </button>
                
                {!isFormValid() && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> 아래 필수 항목을 모두 입력해주세요
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {getMissingRequirements().map((req, idx) => (
                        <span key={idx} className="text-xs text-orange-700 font-medium">
                          • {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-8 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => setShowRefundPolicy(!showRefundPolicy)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                  >
                    <span className="flex items-center gap-2 font-bold text-gray-700">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      환불 정책 안내 (필독)
                    </span>
                    {showRefundPolicy ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                    )}
                  </button>
                  
                  {showRefundPolicy && (
                    <div className="mt-2 p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {siteConfig?.terms?.refund_policy || '등록된 환불 정책이 없습니다.'}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs md:text-sm text-gray-500 mt-4">위 버튼을 누르면 결제 창이 호출됩니다. 신청 완료 메시지가 나오기 전까지 창을 닫지 마세요.</p>
              </div>
            </form>
          </div>
        </div>
      </Layout>

      {/* Modals (Address, Policy) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">주소 검색</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-auto"><DaumPostcodeEmbed onComplete={handleAddressComplete} autoClose={false} style={{ width: '100%', height: '400px' }} /></div>
          </div>
        </div>
      )}

      {showPolicyModal && siteConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">약관 및 동의사항</h2>
              <button onClick={() => setShowPolicyModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="flex border-b">
              {(['privacy', 'third_party', 'marketing'] as const).map((tab) => (
                <button key={tab} onClick={() => setActivePolicyTab(tab)} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activePolicyTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'privacy' ? '개인정보 수집' : tab === 'third_party' ? '제3자 제공' : '마케팅 활용'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {activePolicyTab === 'privacy' && siteConfig.terms?.privacy_policy}
              {activePolicyTab === 'third_party' && siteConfig.terms?.third_party_provision}
              {activePolicyTab === 'marketing' && siteConfig.terms?.marketing_consent}
            </div>
            <div className="p-4 border-t bg-gray-50"><button onClick={() => setShowPolicyModal(false)} className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">확인</button></div>
          </div>
        </div>
      )}
    </>
  );
}