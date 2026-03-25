import React from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Message } from '../../types';
import { cn } from '../../lib/utils';

interface MessageManagementProps {
  messages: Message[];
  onApprove: (messageId: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

const MessageManagement: React.FC<MessageManagementProps> = ({ messages, onApprove, onDelete }) => {
  const pendingCount = messages.filter(m => !m.isApproved).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">축하 메시지 관리</h2>
          <p className="text-gray-500 mt-1">참가자들이 남긴 120주년 축하 메시지를 승인하거나 삭제합니다.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold shadow-sm border border-amber-100 flex items-center gap-2">
             <AlertCircle className="w-4 h-4" />
             승인 대기: {pendingCount}건
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "bg-white rounded-3xl p-6 shadow-soft border group relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md h-64",
                msg.isApproved ? "border-emerald-50" : "border-amber-100"
              )}
            >
              {!msg.isApproved && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] uppercase font-black rounded-lg animate-pulse">Pending Review</span>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto italic text-gray-700 text-sm leading-relaxed mb-6 scrollbar-thin scrollbar-thumb-gray-200">
                 "{msg.content}"
              </div>

              <div className="border-t border-gray-50 pt-4 mt-auto">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-sookmyung-blue-50 rounded-lg flex items-center justify-center text-sookmyung-blue-800 font-bold text-xs uppercase">
                         {msg.senderName.substring(0, 1)}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-gray-900">{msg.senderName}</p>
                         <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                           {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleDateString('ko-KR') : '-'}
                         </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-1 items-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!msg.isApproved && (
                         <button
                           onClick={() => onApprove(msg.id)}
                           className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                           title="승인"
                         >
                           <CheckCircle className="w-5 h-5 shadow-emerald-50" />
                         </button>
                      )}
                      <button
                        onClick={() => onDelete(msg.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="삭제"
                      >
                        <Trash2 className="w-5 h-5 shadow-red-50" />
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-gray-100">
             <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold text-lg">메시지가 아직 없습니다.</p>
             <p className="text-gray-400 text-sm mt-1">참가자들이 작성한 격려의 말들이 이곳에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement;
