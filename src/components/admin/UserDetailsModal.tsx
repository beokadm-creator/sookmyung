import React from 'react';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Building, 
  MessageSquare,
  Compass,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { User } from '../../types';
import { formatDate, cn } from '../../lib/utils';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const sections = [
    {
      title: '본인 인증 및 연락처',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50',
      fields: [
        { label: '휴대전화 번호', value: user.phone || '-', icon: Phone },
        { label: '이메일 주소', value: user.email || '-', icon: Mail },
      ]
    },
    {
      title: '기본 신상 정보',
      icon: GraduationCap,
      color: 'text-sookmyung-blue-600 bg-sookmyung-blue-50',
      fields: [
        { label: '성명', value: user.name || '-', icon: UserIcon },
        { label: '생년월일', value: user.birthdate || '-', icon: Calendar },
        { label: '학과명', value: user.department || '-', icon: GraduationCap },
        { label: '입학년도', value: user.enrollment_year ? `${user.enrollment_year}학번` : '-', icon: GraduationCap },
        { label: '주소', value: user.address ? `${user.address} ${user.address_detail || ''}` : '-', icon: MapPin },
      ]
    },
    {
      title: '직장 정보 (선택)',
      icon: Building,
      color: 'text-emerald-600 bg-emerald-50',
      fields: [
        { label: '회사명', value: (user as any).company || '-', icon: Building },
        { label: '부서명', value: (user as any).company_department || '-', icon: Building },
        { label: '직위', value: (user as any).position || '-', icon: Building },
      ]
    },
    {
      title: '참가 프로그램',
      icon: Compass,
      color: 'text-amber-600 bg-amber-50',
      fields: [
        { 
          label: 'I. 서울 근교 투어', 
          value: (user as any).additional_program_domestic_tour 
            ? `신청 (${(user as any).additional_program_domestic_tour_option === 'option1' ? '게스트룸' : '신라스테이'})` 
            : '미신청' 
        },
        { 
          label: 'II. 캠퍼스 투어', 
          value: (user as any).additional_program_campus_tour ? '신청' : '미신청' 
        },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-4xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-gray-100">
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-sookmyung-blue-800 to-anniversary-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center font-bold text-2xl shadow-lg border border-white/30">
              {user.name.substring(0, 1)}
            </div>
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                {user.name} 
                {user.paymentStatus ? (
                  <span className="bg-emerald-400 text-emerald-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-lg shadow-sm">Verified</span>
                ) : (
                  <span className="bg-white/20 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-lg">Unpaid</span>
                )}
              </h3>
              <p className="text-white/70 text-sm font-medium">{user.department} · {user.enrollment_year}학번</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", section.color)}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-sookmyung-blue-800 transition-colors uppercase tracking-tight text-sm">
                    {section.title}
                  </h4>
                </div>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        {/* {field.icon && <field.icon className="w-3 h-3" />} */}
                        {field.label}
                      </span>
                      <span className="text-sm font-medium text-gray-800 break-words leading-relaxed">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Celebration Message Section */}
          <div className="bg-sookmyung-blue-50/50 rounded-3xl p-8 border border-sookmyung-blue-100 group">
            <h4 className="font-bold text-sookmyung-blue-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              120주년 축하 메시지
            </h4>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sookmyung-blue-100/50 relative overflow-hidden italic text-gray-700 leading-relaxed group-hover:shadow-md transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <MessageSquare className="w-12 h-12 text-sookmyung-blue-800" />
               </div>
               {user.message || '등록된 메시지가 없습니다.'}
            </div>
          </div>

          {/* Legal / Data Consent Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { label: '개인정보 이용', agreed: (user as any).consent?.privacy_policy },
               { label: '제3자 정보제공', agreed: (user as any).consent?.third_party_provision },
               { label: '마케팅 활용', agreed: (user as any).consent?.marketing_consent },
             ].map((consent) => (
               <div key={consent.label} className="bg-gray-100/50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">{consent.label}</span>
                  {consent.agreed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
               </div>
             ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-50 bg-white flex justify-between items-center px-8">
          <div className="flex gap-4 items-center">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Registered</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
