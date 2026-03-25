import React from 'react';
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Layers,
  Star,
  X
} from 'lucide-react';
import { Notice } from '../../types';
import { formatDate, cn } from '../../lib/utils';

interface NoticeManagementProps {
  notices: Notice[];
  onAdd: () => void;
  onEdit: (notice: Notice) => void;
  onDelete: (noticeId: string) => Promise<void>;
}

const NoticeManagement: React.FC<NoticeManagementProps> = ({ notices, onAdd, onEdit, onDelete }) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'urgent':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg shadow-sm border border-red-200 animate-pulse">Urgent</span>;
      case 'event':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg shadow-sm border border-blue-200">Event</span>;
      case 'payment':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg shadow-sm border border-emerald-200">Payment</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase rounded-lg shadow-sm border border-gray-200">General</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">공지사항 관리</h2>
          <p className="text-gray-500 mt-1">공지사항을 등록하여 참가자들에게 정보를 전달합니다.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-sookmyung-blue-800 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-sookmyung-blue-100 active:scale-95 group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          공지 등록하기
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={cn(
                "bg-white rounded-4xl p-8 shadow-soft border group transition-all duration-300 hover:shadow-lg hover:border-sookmyung-blue-200 relative overflow-hidden",
                notice.is_pinned ? "border-amber-100 bg-amber-50/10" : "border-gray-100"
              )}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                 <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                       {notice.is_pinned && (
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow-md shadow-amber-200">
                           <Star className="w-3 h-3 fill-current" />
                           Pinned
                         </div>
                       )}
                       {getCategoryBadge(notice.category)}
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(notice.created_at)}</span>
                    </div>

                    <div>
                       <h4 className="text-xl font-bold text-gray-900 group-hover:text-sookmyung-blue-800 transition-colors tracking-tight">{notice.title}</h4>
                       <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-2">{notice.content}</p>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex -space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                             {notice.created_by?.substring(0, 1) || 'A'}
                          </div>
                       </div>
                       <p className="text-xs text-gray-400 font-medium">관리자에 의해 등록되었습니다.</p>
                    </div>
                 </div>

                 <div className="flex gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => onEdit(notice)}
                      className="p-4 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                      title="수정"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(notice.id)}
                      className="p-4 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-4xl p-24 text-center border-2 border-dashed border-gray-100 shadow-soft">
             <Bell className="w-20 h-20 text-gray-200 mx-auto mb-6" />
             <p className="text-gray-400 font-bold text-xl uppercase tracking-widest leading-none">Newsfeed Empty</p>
             <p className="text-gray-400 text-sm mt-3 mb-10">참가자들을 위한 소식을 첫 번째로 등록해보세요.</p>
             <button
               onClick={onAdd}
               className="px-10 py-4 bg-white border-2 border-sookmyung-blue-800 text-sookmyung-blue-800 rounded-3xl font-black text-sm hover:bg-sookmyung-blue-800 hover:text-white transition-all shadow-xl shadow-sookmyung-blue-100 flex items-center gap-2 mx-auto uppercase tracking-wider"
             >
               <Plus className="w-5 h-5" /> Write First Announcement
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;
