'use client';

import * as React from 'react';
import { Flame, Radio, ShieldAlert, Users } from 'lucide-react';

interface StatsCardsProps {
  criticalCount?: number;
  activeOfficerCount?: number;
  avgResponseTime?: string;
  totalPending?: number;
}

export function StatsCards({
  criticalCount = 1,
  activeOfficerCount = 14,
  avgResponseTime = '3.8 phút',
  totalPending = 6,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Sự cố khẩn cấp (P0)',
      value: `${criticalCount} vụ`,
      desc: 'Cần thẩm định & điều phối ngay',
      icon: Flame,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Chờ tiếp nhận xử lý',
      value: `${totalPending} báo cáo`,
      desc: 'Từ cảm biến IoT & camera',
      icon: ShieldAlert,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Lực lượng trực chiến',
      value: `${activeOfficerCount} cán bộ`,
      desc: 'Sẵn sàng cơ động trong 5 phút',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Thời gian phản ứng TB',
      value: avgResponseTime,
      desc: 'Nhanh hơn mục tiêu 1.2 phút',
      icon: Radio,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{item.title}</div>
              <div className="text-xl font-bold tracking-tight text-foreground">{item.value}</div>
              <div className="text-[11px] text-muted-foreground">{item.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
