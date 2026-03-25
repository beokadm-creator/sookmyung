import React from 'react';
import { 
  Users, 
  CreditCard, 
  Bell, 
  UserMinus, 
  Settings, 
  ShieldCheck, 
  MessageSquare, 
  LayoutDashboard,
  LogOut,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type AdminTab = 'dashboard' | 'users' | 'payments' | 'notices' | 'withdrawals' | 'config' | 'site_settings' | 'alimtalk' | 'messages';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  counts: {
    users: number;
    payments: number;
    notices: number;
    withdrawals: number;
    messages: number;
  };
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, onLogout, counts }) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'users', label: '등록 인원', icon: Users, count: counts.users },
    { id: 'payments', label: '결제 내역', icon: CreditCard, count: counts.payments },
    { id: 'notices', label: '공지사항', icon: Bell, count: counts.notices },
    { id: 'withdrawals', label: '탈퇴 신청', icon: UserMinus, count: counts.withdrawals },
    { id: 'messages', label: '축하 메시지', icon: MessageSquare, count: counts.messages },
    { id: 'alimtalk', label: '알림톡 설정', icon: Send },
    { id: 'config', label: '참가비 설정', icon: Settings },
    { id: 'site_settings', label: 'PG 및 약관', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 bg-sookmyung-blue-800 rounded-xl flex items-center justify-center text-white shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Admin</h1>
            <p className="text-xxs text-gray-400 font-medium tracking-wider uppercase">Sookmyung 120th</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-sookmyung-blue-50 text-sookmyung-blue-800 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === item.id ? "text-sookmyung-blue-800" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {item.label}
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  activeTab === item.id ? "bg-sookmyung-blue-800 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
