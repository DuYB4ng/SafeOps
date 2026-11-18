'use client';

import * as React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';
import { cn } from 'cn';

interface HeaderProps {
  title?: string;
  isSocketConnected?: boolean;
  unreadNotificationsCount?: number;
  userName?: string;
  userRole?: string;
  className?: string;
}

export function Header({
  title = 'Trung tâm điều hành an ninh SafeOps',
  isSocketConnected = true,
  unreadNotificationsCount = 3,
  userName = 'Trực ban A',
  userRole = 'Operator',
  className,
}: HeaderProps) {
  return (
    <header
      data-slot="safeops-header"
      className={cn(
        'sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e2e8f0] bg-white px-6 text-xs font-medium text-[#0f172a] shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
        className,
      )}
    >
      {/* Left: Project title & Security logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-[#0f172a] dark:text-zinc-50">
            {title}
          </h1>
          <p className="text-[11px] text-[#64748b] dark:text-zinc-400">
            Hệ thống quản lý & phản ứng nhanh sự cố an ninh
          </p>
        </div>
      </div>

      {/* Right: Realtime status, notifications and user profile */}
      <div className="flex items-center gap-4 text-[#475569] dark:text-zinc-300">
        {/* Realtime Socket Status */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-800/80">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isSocketConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                : 'bg-red-500',
            )}
          />
          <span className="font-medium text-slate-700 dark:text-zinc-200">
            {isSocketConnected ? 'Socket: Đang kết nối' : 'Socket: Mất kết nối'}
          </span>
        </div>

        <span className="text-slate-300 dark:text-zinc-700">|</span>

        {/* Notifications button */}
        <button
          type="button"
          className="relative flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Bell className="h-4 w-4 text-amber-500" />
          <span>Thông báo</span>
          {unreadNotificationsCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <span className="text-slate-300 dark:text-zinc-700">|</span>

        {/* User profile */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
              {userName}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400">{userRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
