'use client';

import type { ConnectionStatus } from '@/types/ui';
import { cn } from '@/lib/utils';
import { ConnectionBadge } from './ConnectionBadge';
import type { ReactNode } from 'react';
import { Bell, ChevronDown, Menu, UserRound } from 'lucide-react';

type HeaderProps = {
  title?: string;
  connectionStatus: ConnectionStatus;
  notificationCount?: number;
  userName?: string;
  onNotificationsClick?: () => void;
  onUserClick?: () => void;
  className?: string;
  variant?: 'default' | 'dashboard';
  brand?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  userSubtitle?: string;
  onMenuClick?: () => void;
};

export function Header({
  title = 'Trung tâm điều hành an ninh SafeOps',
  connectionStatus,
  notificationCount = 0,
  userName = 'Trực ban A',
  onNotificationsClick,
  onUserClick,
  className,
  variant = 'default',
  brand,
  search,
  actions,
  userSubtitle,
  onMenuClick,
}: HeaderProps) {
  return (
    <header
      className={cn('safeops-header', className)}
      data-variant={variant}
      data-figma-node="14:34"
    >
      <div className="safeops-header-brand">
        {onMenuClick && (
          <button
            type="button"
            className="dashboard-menu-button"
            aria-label="Mở điều hướng"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
        )}
        {brand ?? <span className="safeops-header-title">{title}</span>}
        {search}
      </div>
      <div className="safeops-header-actions">
        <ConnectionBadge status={connectionStatus} />
        {actions}
        <span className="header-divider" aria-hidden="true">
          |
        </span>
        <button type="button" className="header-action" onClick={onNotificationsClick}>
          {variant === 'dashboard' ? (
            <>
              <Bell size={17} aria-hidden="true" />
              <span className="dashboard-notification-count">{notificationCount}</span>
              <span className="sr-only">Thông báo ({notificationCount})</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">🔔</span> Thông báo ({notificationCount})
            </>
          )}
        </button>
        <span className="header-divider" aria-hidden="true">
          |
        </span>
        <button type="button" className="header-action" onClick={onUserClick}>
          {variant === 'dashboard' ? (
            <>
              <span className="dashboard-avatar">
                <UserRound size={18} />
              </span>
              <span className="dashboard-user-name">
                {userName}
                {userSubtitle && <small>{userSubtitle}</small>}
              </span>
              <ChevronDown size={13} />
            </>
          ) : (
            <>
              <span aria-hidden="true">👤</span> {userName}
            </>
          )}
        </button>
      </div>
    </header>
  );
}
