import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  XCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  History
} from 'lucide-react';
import { Payment } from '../../types';
import { formatDate, formatAmount, cn } from '../../lib/utils';

interface PaymentManagementProps {
  payments: Payment[];
  onCancelPayment: (paymentId: string, userId: string) => Promise<void>;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ payments, onCancelPayment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled' | 'failed'>('all');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      (p.user_name && p.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.order_id && p.order_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' || p.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100 flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3 h-3" />
            결제 완료
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 shadow-sm shadow-amber-100 flex items-center gap-1.5 w-fit">
            <Clock className="w-3 h-3 animate-pulse" />
            확인 대기
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 shadow-sm flex items-center gap-1.5 w-fit">
            <XCircle className="w-3 h-3" />
            결제 취소
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 shadow-sm shadow-red-100 flex items-center gap-1.5 w-fit">
            <History className="w-3 h-3" />
            결제 실패
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 shadow-sm flex items-center gap-1.5 w-fit">
            <HelpCircle className="w-3 h-3" />
            알 수 없음
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">결제 및 매출 관리</h2>
          <p className="text-gray-500 mt-1">참가비 결제 내역을 모니터링하고 관리합니다.</p>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-sookmyung-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="이름, 주문번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sookmyung-blue-600 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl items-center overflow-x-auto max-w-full">
           {[
             { id: 'all', label: '전체' },
             { id: 'completed', label: '완료' },
             { id: 'pending', label: '대기' },
             { id: 'cancelled', label: '취소' },
             { id: 'failed', label: '실패' }
           ].map((status) => (
             <button
                key={status.id}
                onClick={() => setFilterStatus(status.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  filterStatus === status.id ? "bg-white text-sookmyung-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                {status.label}
              </button>
           ))}
        </div>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">신청자</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">주문번호 / 일시</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">금액</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                       <span className="text-sm font-bold text-gray-900">{p.user_name || '-'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-medium text-gray-900 border-none">{p.order_id}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(p.created_at)}</p>
                    </td>
                    <td className="py-4 px-6 text-left">
                       {getStatusBadge(p.status)}
                    </td>
                    <td className="py-4 px-6 font-black text-gray-900 text-sm">
                      {formatAmount(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-right">
                       {p.status === 'completed' && (
                         <button
                           onClick={() => onCancelPayment(p.id, p.user_id)}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all ml-auto opacity-100 lg:opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 className="w-3 h-3" />
                           취소 처리
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                      <p>결제 내역이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
