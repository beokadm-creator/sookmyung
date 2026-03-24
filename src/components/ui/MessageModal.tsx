import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { X } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageModal({ isOpen, onClose }: MessageModalProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderName: name,
        content: message,
        isApproved: false, // Requires admin approval
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setName('');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error adding message: ', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
        
        {success ? (
          <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">전송 완료!</h3>
            <p className="text-gray-600">관리자 승인 후 메인 화면에 게시됩니다.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">축하 메시지 보내기</h2>
              <p className="text-gray-600 text-sm">숙명여자대학교 창학 120주년을 축하해주세요.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">이름 (학번/학과)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동 (00학번/국문과)"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">축하 메시지</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="따뜻한 축하의 한마디를 남겨주세요."
                  required
                  maxLength={100}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                />
                <div className="text-right text-xs text-gray-400 mt-1 font-medium">{message.length}/100</div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                {loading ? '전송 중...' : '메시지 보내기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
