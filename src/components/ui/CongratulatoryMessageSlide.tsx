import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Message } from '../../types';
import { cn } from '@/lib/utils';
import { Play, Pause, MessageSquare } from 'lucide-react';

export default function CongratulatoryMessageSlide() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(30); // seconds for one loop

  useEffect(() => {
    // Fetch approved messages
    const q = query(
      collection(db, 'messages'),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });
    
    return () => unsubscribe();
  }, []);

  if (messages.length === 0) {
    return null; 
  }

  // Duplicate messages for seamless scrolling
  const displayMessages = [...messages, ...messages, ...messages]; 

  return (
    <div className="w-full bg-blue-900/5 border-y border-blue-900/10 py-3 relative overflow-hidden group">
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-scroll {
            animation: scroll ${speed}s linear infinite;
          }
          .paused {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="absolute top-1 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full px-2 py-0.5 shadow-sm">
        <button 
          onClick={() => setSpeed(prev => Math.max(10, prev - 5))} 
          className="text-xs font-bold text-blue-900 px-2 hover:bg-blue-100 rounded"
          title="Faster"
        >
          Fast
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className="p-0.5 hover:bg-blue-100 rounded-full text-blue-900"
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button 
          onClick={() => setSpeed(prev => Math.min(60, prev + 5))} 
          className="text-xs font-bold text-blue-900 px-2 hover:bg-blue-100 rounded"
          title="Slower"
        >
          Slow
        </button>
      </div>

      <div className="container mx-auto px-4 overflow-hidden">
        <div 
          className={cn(
            "flex gap-4 w-max", 
            "animate-scroll",
            !isPlaying && "paused"
          )}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {displayMessages.map((msg, idx) => (
            <div 
              key={`${msg.id}-${idx}`} 
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100 min-w-[200px] max-w-[400px]"
            >
              <div className="bg-blue-100 p-1.5 rounded-full shrink-0">
                <MessageSquare size={14} className="text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-blue-900 text-xs">{msg.senderName}</span>
                <span className="text-gray-600 text-xs truncate">{msg.content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
