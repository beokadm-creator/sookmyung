import React from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  ScrollText, 
  Save, 
  Eye, 
  Lock, 
  Terminal,
  Server
} from 'lucide-react';
import { SiteConfig } from '../../types';
import { cn } from '../../lib/utils';

interface SiteSettingsManagementProps {
  formData: {
    clientKey: string;
    service_terms: string;
    privacy_policy: string;
    third_party_provision: string;
    marketing_consent: string;
    refund_policy: string;
  };
  onChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
}

const SiteSettingsManagement: React.FC<SiteSettingsManagementProps> = ({ formData, onChange, onSave }) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'pg' | 'terms'>('pg');

  const termFields = [
    { id: 'service_terms', label: '이용약관', icon: ScrollText },
    { id: 'privacy_policy', label: '개인정보 처리방침', icon: ShieldCheck },
    { id: 'third_party_provision', label: '제3자 정보제공 동의', icon: Server },
    { id: 'marketing_consent', label: '정보성 메시지 수신동의', icon: Terminal },
    { id: 'refund_policy', label: '환불정책', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">PG 및 정책 관리</h2>
          <p className="text-gray-500 mt-1">토스페이먼츠 연동 정보 및 서비스 이용 약관을 관리합니다.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('pg')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeSubTab === 'pg' ? "bg-white text-sookmyung-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Toss Payments
          </button>
          <button
            onClick={() => setActiveSubTab('terms')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeSubTab === 'terms' ? "bg-white text-sookmyung-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <ScrollText className="w-4 h-4" />
            약관/정책 관리
          </button>
        </div>
      </div>

      {activeSubTab === 'pg' ? (
        <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-soft space-y-10 animate-fade-in">
           <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
               <CreditCard className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Toss Payments Settings</h3>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">토스페이먼츠 API 연동 설정</p>
             </div>
           </div>

           <div className="grid grid-cols-1 gap-8 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-blue-500" />
                  Client Key (Frontend)
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.clientKey}
                    onChange={(e) => onChange('clientKey', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-mono text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                    placeholder="live_ck_..."
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 bg-emerald-50 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-100">Public</div>
                </div>
                <p className="text-[11px] text-gray-400 px-1 font-medium italic">* 토스페이먼츠 관리자 센터에서 확인 가능한 모든 결제창 노출용 키입니다.</p>
              </div>


           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
           {termFields.map((field) => (
             <div key={field.id} className="bg-white rounded-4xl p-8 border border-gray-100 shadow-soft hover:shadow-md transition-shadow group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-sookmyung-blue-100 group-hover:bg-sookmyung-blue-600 transition-colors" />
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 bg-sookmyung-blue-50 rounded-xl flex items-center justify-center text-sookmyung-blue-800 transition-transform group-hover:scale-110 shadow-sm border border-sookmyung-blue-100/50">
                      <field.icon className="w-5 h-5" />
                   </div>
                   <h4 className="text-lg font-black text-gray-900 tracking-tighter uppercase">{field.label}</h4>
                </div>
                <textarea
                  value={(formData as any)[field.id]}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  rows={8}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl px-6 py-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-sookmyung-blue-600 focus:bg-white transition-all shadow-inner scrollbar-thin scrollbar-thumb-gray-200 leading-relaxed font-sans placeholder:italic placeholder:text-gray-300"
                  placeholder={`${field.label} 내용을 입력해주세요...`}
                />
             </div>
           ))}
        </div>
      )}

      <div className="pt-4 flex flex-col items-center">
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-4 py-5 bg-sookmyung-blue-900 text-white rounded-3xl font-black text-lg hover:bg-black shadow-2xl shadow-sookmyung-blue-200 transition-all active:scale-[0.98] group uppercase tracking-widest overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <Save className="w-6 h-6 group-hover:scale-125 transition-transform" />
            Update General Settings
          </button>
          <p className="mt-4 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Sookmyung 120th Admin Control Center</p>
      </div>
    </div>
  );
};

export default SiteSettingsManagement;
