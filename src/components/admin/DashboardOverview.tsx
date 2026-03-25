import React from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  UserPlus, 
  ArrowUpRight,
  Plus,
  UserMinus
} from 'lucide-react';
import { User, Payment, Message, WithdrawalRequest } from '../../types';
import { formatAmount, cn } from '../../lib/utils';

interface DashboardOverviewProps {
  users: User[];
  payments: Payment[];
  messages: Message[];
  withdrawals: WithdrawalRequest[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ users, payments, messages, withdrawals }) => {
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const approvedMessages = messages.filter(m => m.isApproved).length;

  const stats = [
    { 
      label: '총 등록 인원', 
      value: `${users.length}명`, 
      icon: Users, 
      color: 'bg-blue-500', 
      trend: '+12%', // Static for now, but looks premium
      description: '전체 참가 신청자 수'
    },
    { 
      label: '총 결제 금액', 
      value: formatAmount(totalRevenue), 
      icon: CreditCard, 
      color: 'bg-emerald-500', 
      trend: '+15%', 
      description: '총 완료된 결제 금액'
    },
    { 
      label: '입금 대기', 
      value: `${pendingPayments}건`, 
      icon: Clock, 
      color: 'bg-amber-500', 
      trend: '-5%', 
      description: '가상계좌 입금 대기 중'
    },
    { 
      label: '축하 메시지', 
      value: `${approvedMessages}건`, 
      icon: TrendingUp, 
      color: 'bg-purple-500', 
      trend: '+60%', 
      description: '승인된 격려 메시지'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">시스템 현황</h2>
          <p className="text-gray-500 mt-1">Sookmyung 120주년 기념사업 운영 현황입니다.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:border-gray-300">
            <Plus className="w-4 h-4" />
            보고서 내보내기
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-soft hover:shadow-md transition-all duration-300 group border border-gray-50">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                stat.color
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Actions */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              처리가 필요한 내역
            </h3>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">
              {pendingWithdrawals + pendingPayments}건 대기 중
            </span>
          </div>
          <div className="p-6 space-y-4">
            {pendingWithdrawals > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <UserMinus className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 underline pointer">탈퇴 신청 승인 대기</h4>
                    <p className="text-xs text-gray-500">신속한 처리가 권장됩니다.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{pendingWithdrawals}건</p>
                  <p className="text-xxs text-gray-400">지금 확인</p>
                </div>
              </div>
            )}
            {pendingPayments > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 underline">가상계좌 입금 대기</h4>
                    <p className="text-xs text-gray-500">정상적으로 입금이 완료되어야 확정됩니다.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{pendingPayments}건</p>
                  <p className="text-xxs text-gray-400">명단 보기</p>
                </div>
              </div>
            )}
            {pendingWithdrawals === 0 && pendingPayments === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">현재 대기 중인 항목이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Recent Users Preview */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              최근 가입자
            </h3>
            <button className="text-sookmyung-blue-600 text-xs font-bold hover:underline">
              전체보기
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sookmyung-blue-50 rounded-full flex items-center justify-center text-sookmyung-blue-800 font-bold text-sm">
                      {u.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{u.name}</h4>
                      <p className="text-xs text-gray-400">{u.department} · {u.enrollment_year}학번</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xxs font-bold",
                    u.paymentStatus ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {u.paymentStatus ? '결제완료' : '미결'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
