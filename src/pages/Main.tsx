import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/ui/CountdownTimer';
import CongratulatoryMessageSlide from '@/components/ui/CongratulatoryMessageSlide';
import ProgramSection from '@/components/ui/ProgramSection';
import NoticeSection from '@/components/ui/NoticeSection';
import MessageModal from '@/components/ui/MessageModal';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

export default function Main() {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[url('/bg.png')] bg-contain bg-no-repeat bg-center bg-blue-900 overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-900/70 to-blue-900/90 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-6">
            <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-blue-100 font-semibold text-sm md:text-base border border-white/20 shadow-lg">
              2026. 05. 21 (목) 18:00 | 그랜드 인터컨티넨탈 서울 파르나스 5층 그랜드볼룸
            </span>
            <h1 className="text-4xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl tracking-tight">
              숙명여자대학교<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">창학 120주년</span> 기념 전야제
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
              자랑스러운 숙명의 역사, 빛나는 미래로 이어질<br className="hidden md:block"/>
              뜻깊은 순간에 동문 여러분을 초대합니다.
            </p>
          </div>

          <CountdownTimer targetDate="2026-05-21T17:00:00" className="my-12 scale-110" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 justify-center items-center mt-8 md:mt-12 w-full max-w-sm sm:max-w-2xl md:max-w-3xl mx-auto px-6 sm:px-0">
            <Link to="/application" className="w-full">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full text-base md:text-lg py-4 md:py-5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white border-none shadow-xl hover:shadow-yellow-500/30 transition-all hover:-translate-y-1"
                aria-label="참가신청"
              >
                참가신청
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full text-base md:text-lg py-4 md:py-5 bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm transition-all hover:-translate-y-1"
              onClick={() => setIsInvitationModalOpen(true)}
              aria-label="초대장"
            >
              초대장
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full text-base md:text-lg py-4 md:py-5 bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm transition-all hover:-translate-y-1"
              onClick={() => setIsMessageModalOpen(true)}
              aria-label="축하 메시지 보내기"
            >
              축하 메시지 보내기
            </Button>
          </div>
        </div>
      </section>

      {/* Message Slide */}
      <CongratulatoryMessageSlide />

      {/* Program Section */}
      <ProgramSection />

      {/* Notice Section */}
      <NoticeSection />
      
      {/* Modals */}
      {isMessageModalOpen && (
        <MessageModal 
          isOpen={isMessageModalOpen} 
          onClose={() => setIsMessageModalOpen(false)} 
        />
      )}

      {isInvitationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in" 
            onClick={() => setIsInvitationModalOpen(false)}
          />
          <div className="relative max-w-sm md:max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in group">
            <button
              onClick={() => setIsInvitationModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src="/main/main.jpg" 
              alt="초대장" 
              className="w-full h-auto object-contain cursor-zoom-out"
              onClick={() => setIsInvitationModalOpen(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
