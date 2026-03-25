import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle, 
  Send, 
  RefreshCw, 
  Eye, 
  Trash2,
  Filter,
  MoreVertical,
  XCircle,
  Calendar,
  Building,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { User } from '../../types';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface UserManagementProps {
  users: User[];
  onExportExcel: () => void;
  onUpdateStatus: (userId: string, paymentStatus: boolean, vbankStatus: string) => Promise<void>;
  onSendManualAlimtalk: (userId: string, templateType: 'welcome' | 'pending') => Promise<void>;
  onDeleteUser: (userId: string, name: string) => Promise<void>;
  onOpenUserDetails: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onExportExcel, 
  onUpdateStatus, 
  onSendManualAlimtalk, 
  onDeleteUser,
  onOpenUserDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'paid' && u.paymentStatus) ||
      (filterStatus === 'pending' && (u as any).vbankStatus === 'pending') ||
      (filterStatus === 'unpaid' && !u.paymentStatus && (u as any).vbankStatus !== 'pending');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">등록 인원 관리</h2>
          <p className="text-gray-500 mt-1">참가 신청자 목록 및 상태를 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all shadow-emerald-200"
          >
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-sookmyung-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="이름, 전화번호, 학과 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sookmyung-blue-600 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl items-center">
          <button
            onClick={() => setFilterStatus('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterStatus === 'all' ? "bg-white text-sookmyung-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            전체
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterStatus === 'paid' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            완료
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterStatus === 'pending' ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            대기
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterStatus === 'unpaid' ? "bg-white text-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            미결
          </button>
        </div>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">이름 / 연락처</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">소속 / 학과</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">결제 상태</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">등록일</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sookmyung-blue-100 rounded-xl flex items-center justify-center text-sookmyung-blue-700 font-bold group-hover:scale-110 transition-transform">
                          {u.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">
                        {u.department || '학과 없음'}
                        {u.enrollment_year && <span className="ml-1 text-gray-400 text-xs">({u.enrollment_year})</span>}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        {(u as any).company || '소속 없음'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm",
                          u.paymentStatus
                            ? 'bg-emerald-50 text-emerald-700 shadow-emerald-100'
                            : (u as any).vbankStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 shadow-amber-100'
                              : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          u.paymentStatus ? "bg-emerald-500 animate-pulse" : (u as any).vbankStatus === 'pending' ? "bg-amber-500" : "bg-gray-400"
                        )} />
                        {u.paymentStatus ? '결제완료' : ((u as any).vbankStatus === 'pending' ? '입금대기' : '미결')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Approval Action */}
                        {((u as any).vbankStatus === 'pending' || !u.paymentStatus) && (
                          <button
                            onClick={() => onUpdateStatus(u.id, true, 'approved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="결제완료로 변경"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* Alimtalk Action */}
                        <button
                          onClick={() => {
                            const type = window.confirm('확정(Welcome) 알림톡을 보내시겠습니까? (취소 누르면 입금대기 알림톡 안내)') ? 'welcome' : 'pending';
                            onSendManualAlimtalk(u.id, type as any);
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="알림톡 수동 발송"
                        >
                          <Send className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => onOpenUserDetails(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="상세보기"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => onDeleteUser(u.id, u.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="사용자 삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Users className="w-12 h-12 mb-3 opacity-20" />
                      <p>등록된 인원이 없습니다.</p>
                      {searchTerm && <p className="text-xs mt-1">검색어를 확인해주세요.</p>}
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

export default UserManagement;
