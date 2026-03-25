import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Calendar, 
  Calculator, 
  CheckCircle, 
  AlertTriangle,
  Save,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PriceTier } from '../../types';
import { formatAmount, cn } from '../../lib/utils';

interface ConfigManagementProps {
  priceTiers: PriceTier[];
  onAddTier: () => void;
  onRemoveTier: (id: string) => void;
  onUpdateTier: (id: string, field: keyof PriceTier, value: any) => void;
  onSave: () => Promise<void>;
}

const ConfigManagement: React.FC<ConfigManagementProps> = ({ 
  priceTiers, 
  onAddTier, 
  onRemoveTier, 
  onUpdateTier, 
  onSave 
}) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
       <div>
        <h2 className="text-2xl font-bold text-gray-900">참가비 및 기간 관리</h2>
        <p className="text-gray-500 mt-1">얼리버드 등 기간별 참가 금액을 유연하게 설정할 수 있습니다.</p>
      </div>

      <div className="bg-amber-50 rounded-4xl p-8 border border-amber-200/50 flex flex-col md:flex-row gap-6 items-start shadow-sm mb-8 animate-slide-down">
         <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
           <AlertTriangle className="w-6 h-6" />
         </div>
         <div>
            <h4 className="font-bold text-amber-900 text-lg mb-2 flex items-center gap-2 tracking-tight">
               ⚠️ 현재 활성화된 참가비 체계
            </h4>
            <p className="text-amber-800/80 text-sm leading-relaxed mb-4">
              참가 희망자가 결제 시 적용되는 금액을 설정합니다. 현재 <strong className="text-amber-900 underline underline-offset-4 decoration-amber-500/50 decoration-2">{priceTiers.filter(t => t.active).length}개</strong>의 기간별 정책이 활발하게 적용 중입니다.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-4xl border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
               <Calculator className="w-6 h-6 text-sookmyung-blue-800" />
               기간별 가격 정책 상세
            </h3>
            <button
               onClick={onAddTier}
               className="flex items-center gap-2 px-6 py-3 bg-sookmyung-blue-50 text-sookmyung-blue-800 rounded-2xl font-bold hover:bg-sookmyung-blue-100 transition-all active:scale-95 shadow-sm"
            >
               <Plus className="w-4 h-4" />
               정책 추가
            </button>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {priceTiers.length > 0 ? (
               priceTiers.map((tier) => (
                  <div key={tier.id} className="relative group bg-gray-50/50 rounded-3xl p-6 border border-gray-100 hover:border-sookmyung-blue-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-4">
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2 px-1">Label Name (e.g. Early Bird)</label>
                           <div className="relative group/input">
                              <input
                                 type="text"
                                 value={tier.label}
                                 onChange={(e) => onUpdateTier(tier.id, 'label', e.target.value)}
                                 className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-sookmyung-blue-600 outline-none transition-all"
                                 placeholder="정책 이름"
                              />
                           </div>
                        </div>

                        <div className="md:col-span-4">
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2 px-1 text-center">Date Range</label>
                           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1 shadow-inner">
                              <div className="relative flex-1">
                                 <input
                                    type="date"
                                    value={tier.startDate}
                                    onChange={(e) => onUpdateTier(tier.id, 'startDate', e.target.value)}
                                    className="w-full border-none rounded-xl px-3 py-2 text-xs focus:ring-0 outline-none hover:bg-gray-50 transition-colors"
                                 />
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                              <div className="relative flex-1">
                                 <input
                                    type="date"
                                    value={tier.endDate}
                                    onChange={(e) => onUpdateTier(tier.id, 'endDate', e.target.value)}
                                    className="w-full border-none rounded-xl px-3 py-2 text-xs focus:ring-0 outline-none hover:bg-gray-50 transition-colors"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="md:col-span-2">
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2 px-1">Amount (KRW)</label>
                           <div className="relative group/input">
                              <input
                                 type="number"
                                 value={tier.amount}
                                 onChange={(e) => onUpdateTier(tier.id, 'amount', parseInt(e.target.value) || 0)}
                                 className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-sookmyung-blue-600 outline-none transition-all text-right pr-10"
                                 placeholder="0"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">원</span>
                           </div>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:justify-end items-center gap-4">
                           <label className="flex items-center gap-2 cursor-pointer py-3">
                              <div className="relative inline-flex items-center cursor-pointer group/toggle">
                                 <input
                                    type="checkbox"
                                    checked={tier.active}
                                    onChange={(e) => onUpdateTier(tier.id, 'active', e.target.checked)}
                                    className="sr-only peer"
                                 />
                                 <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sookmyung-blue-800"></div>
                                 <span className="ml-2 text-xs font-bold text-gray-500 peer-checked:text-sookmyung-blue-800">Active</span>
                              </div>
                           </label>
                           <button
                              onClick={() => onRemoveTier(tier.id)}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                              title="삭제"
                           >
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold text-lg">설정된 기간 정책이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-1 mb-8">새로운 참가비 정책을 추가하여 결제 프로세스를 활성화하세요.</p>
                  <button
                     onClick={onAddTier}
                     className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 mx-auto"
                  >
                     <Plus className="w-4 h-4" /> 첫 번째 정책 추가
                  </button>
               </div>
            )}
         </div>

         <div className="pt-8 flex flex-col items-center">
             <button
                onClick={onSave}
                className="w-full flex items-center justify-center gap-3 py-4 bg-sookmyung-blue-800 text-white rounded-2xl font-bold text-lg hover:bg-sookmyung-blue-900 shadow-xl shadow-sookmyung-blue-100 transition-all active:scale-[0.98] group"
             >
                <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                구성 정책 저장하기
             </button>
             <p className="mt-4 text-[11px] text-gray-400 font-medium">저장 시 시스템 전체에 실시간으로 반영됩니다. 신중하게 결정해주세요.</p>
         </div>
      </div>
    </div>
  );
};

export default ConfigManagement;
