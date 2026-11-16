'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { cn } from 'cn';

interface ConnectionBannerProps {
  isVisible?: boolean;
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ConnectionBanner({
  isVisible = true,
  message = '⚠️ Đang mất kết nối tới máy chủ Socket.IO, đang thử lại...',
  onRetry,
  onClose,
  className,
}: ConnectionBannerProps) {
  if (!isVisible) return null;

  return (
    <div
      data-slot="connection-banner"
      className={cn(
        'relative flex h-10 w-full items-center justify-between border-b border-amber-200 bg-[#fef3c7] px-4 text-xs font-medium text-[#b45309] shadow-xs dark:border-amber-900/60 dark:bg-amber-950/80 dark:text-amber-300',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-[#b45309] dark:text-amber-400" />
        <span>{message}</span>
      </div>

      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-950 dark:hover:text-amber-100"
          >
            <RefreshCw className="h-3 w-3" />
            Thử lại ngay
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cảnh báo"
            className="rounded p-0.5 text-amber-700 hover:bg-amber-200/60 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
