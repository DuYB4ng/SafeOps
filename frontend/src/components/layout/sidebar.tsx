'use client';

import * as React from 'react';
import {
  AlertOctagon,
  ChevronRight,
  Compass,
  LayoutDashboard,
  Radio,
  Settings,
} from 'lucide-react';
import { cn } from 'cn';

export type NavItemKey = 'dashboard' | 'map' | 'dispatch' | 'admin';

interface SidebarProps {
  activeItem?: NavItemKey;
  onSelect?: (item: NavItemKey) => void;
  className?: string;
}

interface NavItemDef {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

const navItems: NavItemDef[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan Dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'map',
    label: 'Bản đồ trực tuyến',
    icon: Compass,
    badgeCount: 5,
  },
  {
    key: 'dispatch',
    label: 'Điều phối lực lượng',
    icon: Radio,
    badgeCount: 2,
  },
  {
    key: 'admin',
    label: 'Quản trị hệ thống',
    icon: Settings,
  },
];

export function Sidebar({ activeItem = 'dashboard', onSelect, className }: SidebarProps) {
  return (
    <aside
      data-slot="safeops-sidebar"
      className={cn(
        'flex w-64 shrink-0 flex-col justify-between border-r border-[#e2e8f0] bg-[#475569] p-4 text-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950',
        className,
      )}
    >
      {/* Navigation Menu List */}
      <div className="space-y-2">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
          Phân hệ tác chiến
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect?.(item.key)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all text-left',
                  isActive
                    ? 'bg-[#eff6ff] text-[#2563eb] shadow-sm font-semibold'
                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-700 hover:text-white',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-[#2563eb]' : 'text-slate-300 group-hover:text-white',
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badgeCount && (
                    <span
                      className={cn(
                        'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-600 text-slate-200',
                      )}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-[#2563eb]" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tactical Emergency CTA Button (from Figma Admin Dashboard) */}
      <div className="mt-8 pt-4 border-t border-slate-600/60">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-[0.98]"
        >
          <AlertOctagon className="h-4 w-4 animate-bounce" />
          <span>BÁO ĐỘNG KHẨN CẤP</span>
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Chỉ kích hoạt khi xảy ra sự cố CRITICAL
        </p>
      </div>
    </aside>
  );
}
