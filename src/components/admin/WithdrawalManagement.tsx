import React, { useState } from 'react';
import { 
  UserMinus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { WithdrawalRequest } from '../../types';
import { formatDate, cn } from '../../lib/utils';

interface WithdrawalManagementProps {
  requests: WithdrawalRequest[];
  onProcess: (requestId: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
}

const WithdrawalManagement: React.FC<WithdrawalManagementProps> = ({ requests, onProcess }) => {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }
    if (rejectId) {
      await onProcess(rejectId, 'reject', rejectReason);
      setRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">탈퇴 신청 관리</h2>
        <p className="text-gray-500 mt-1">사용자들의 탈퇴 요청을 검토하고 처리합니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    request.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    request.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-red-50 text-red-700'
                  )}>
                    {request.status === 'pending' && '대기중'}
                    {request.status === 'approved' && '승인됨'}
                    {request.status === 'rejected' && '거절됨'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{formatDate(request.requested_at)}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{request.user_name}</h4>
                <p className="text-sm text-gray-500 mb-3">{request.user_email}</p>
                <div className="bg-gray-50 p-4 rounded-2xl italic text-gray-600 text-sm border-l-4 border-gray-200">
                   "{request.reason}"
                </div>
                {request.reject_reason && (
                  <p className="mt-3 text-xs text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    거절 사유: {request.reject_reason}
                  </p>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => onProcess(request.id, 'approve')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    승인
                  </button>
                  <button
                    onClick={() => setRejectId(request.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                  >
                    <XCircle className="w-4 h-4" />
                    거절
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-soft">
             <UserMinus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-medium">현재 대기 중인 탈퇴 신청이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Reject Reason Dialog */}
      {rejectId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
             <h3 className="text-xl font-bold text-gray-900 mb-4">탈퇴 요청 거절</h3>
             <textarea
               value={rejectReason}
               onChange={(e) => setRejectReason(e.target.value)}
               placeholder="사용자에게 전달할 거절 사유를 입력해주세요."
               className="w-full h-32 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-red-500 outline-none mb-6 resize-none"
             />
             <div className="flex gap-3">
               <button
                 onClick={() => setRejectId(null)}
                 className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
               >
                 취소
               </button>
               <button
                 onClick={handleReject}
                 className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all"
               >
                 거절 처리
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;
