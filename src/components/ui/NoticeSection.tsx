import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Notice } from '../../types';
import { Bell } from 'lucide-react';

export default function NoticeSection() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(collection(db, 'notices'), orderBy('created_at', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
        setNotices(data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <Bell className="text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-900">주요 공지사항</h2>
        </div>
        
        <div className="space-y-4">
          {notices.length === 0 ? (
             <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">등록된 공지사항이 없습니다.</div>
          ) : (
            notices.map(notice => (
              <div key={notice.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                        <span className={`
                          px-2 py-1 text-xs font-bold rounded shrink-0 mt-1 md:mt-0
                          ${notice.category === 'urgent' ? 'bg-red-100 text-red-700' : 
                            notice.category === 'event' ? 'bg-purple-100 text-purple-700' : 
                            'bg-blue-50 text-blue-700'}
                        `}>
                          {notice.category === 'urgent' ? '긴급' : 
                           notice.category === 'event' ? '행사' : 
                           notice.category === 'payment' ? '회비' : '일반'}
                        </span>
                        <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                          {notice.title}
                        </h3>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">
                        {notice.created_at?.toDate ? notice.created_at.toDate().toLocaleDateString() : '날짜 없음'}
                    </span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
