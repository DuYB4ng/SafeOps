'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
};

type SidebarProps = {
  items: readonly SidebarItem[];
  activeId: string;
  onNavigate?: (id: string) => void | boolean;
  className?: string;
  variant?: 'default' | 'dashboard';
  header?: ReactNode;
  footer?: ReactNode;
};

export function Sidebar({
  items,
  activeId,
  onNavigate,
  className,
  variant = 'default',
  header,
  footer,
}: SidebarProps) {
  return (
    <aside
      className={cn('safeops-sidebar', className)}
      data-variant={variant}
      data-figma-node="13:29"
    >
      <div>
        {header}
        <nav aria-label="Điều hướng SafeOps" className="flex flex-col gap-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="safeops-nav-item"
              aria-current={item.id === activeId ? 'page' : undefined}
              onClick={(event) => {
                if (onNavigate?.(item.id) === false) event.preventDefault();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="nav-count">{item.badge}</span>}
            </a>
          ))}
        </nav>
      </div>
      {footer}
    </aside>
  );
}
