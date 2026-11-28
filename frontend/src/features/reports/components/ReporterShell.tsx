'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleHelp,
  FilePlus2,
  House,
  Map,
  Phone,
  Search,
  Shield,
  Siren,
  UserRound,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Sidebar, type SidebarItem } from '@/components/layout/Sidebar';
import { ConnectionBanner } from '@/components/common/ConnectionBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import type { ConnectionStatus } from '@/types/ui';

const navigation: readonly SidebarItem[] = [
  { id: 'home', label: 'Trang chủ / Báo cáo của tôi', href: '/reports', icon: <House size={17} /> },
  { id: 'new', label: 'Báo cáo sự cố mới', href: '/reports/new', icon: <FilePlus2 size={17} /> },
  {
    id: 'notifications',
    label: 'Thông báo',
    href: '#notifications',
    icon: <Bell size={17} />,
    badge: '3',
  },
  { id: 'map', label: 'Bản đồ khu vực', href: '/reports/new#location', icon: <Map size={17} /> },
  { id: 'profile', label: 'Cá nhân & tài khoản', href: '#profile', icon: <UserRound size={17} /> },
];

export function ReporterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const compact = pathname !== '/reports';
  const [mobileNav, setMobileNav] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>('reconnecting');
  const [topic, setTopic] = useState<'help' | 'hotline' | 'profile' | 'notifications' | null>(null);
  useKeyboardShortcut('Escape', () => setMobileNav(false));
  const brand = (
    <Link className="reporter-brand" href="/reports">
      <span>
        <Shield size={22} />
      </span>
      <span>
        SafeOps<small>CỔNG PHẢN ÁNH CƯ DÂN</small>
      </span>
    </Link>
  );
  const info = {
    help: {
      title: 'Hướng dẫn gửi phản ánh',
      description: 'Gửi thông tin rõ ràng để bộ phận phụ trách hỗ trợ nhanh hơn.',
      content:
        'Nhập tiêu đề, mô tả, chọn vị trí và đính kèm ảnh nếu có. Theo dõi báo cáo tại mục Báo cáo của tôi. Giao diện hiện dùng dữ liệu minh họa, chưa gửi đến SOC.',
    },
    hotline: {
      title: 'Liên hệ Ban Quản lý',
      description: 'Thông tin trực ban của đơn vị chưa được cấu hình.',
      content:
        'Sử dụng kênh liên hệ do Ban Quản lý cung cấp tại nơi bạn đang ở. Nút SOS trên giao diện mở form phản ánh, chưa phát cảnh báo khẩn cấp.',
    },
    profile: {
      title: 'Nguyễn Văn An',
      description: 'Người báo cáo · REPORTER',
      content:
        'Hồ sơ minh họa cho cư dân tòa Landmark. Phiên xác thực và thông tin tài khoản chưa được kết nối backend.',
    },
    notifications: {
      title: 'Thông báo của tôi',
      description: '3 thông báo mẫu gần đây',
      content:
        'Báo cáo RPT-20261109-001 cần bổ sung ảnh; tổ An ninh đã được điều phối; báo cáo tủ công tơ đã hoàn tất xử lý.',
    },
  };
  return (
    <div className="reporter-shell" data-compact={compact} data-nav-open={mobileNav}>
      <a href="#reporter-content" className="reporter-skip">
        Đến nội dung chính
      </a>
      {(!compact || mobileNav) && (
        <>
          <button
            type="button"
            className="reporter-nav-backdrop"
            aria-label="Đóng điều hướng"
            onClick={() => setMobileNav(false)}
          />
          <Sidebar
            className="reporter-sidebar"
            variant="dashboard"
            items={navigation}
            activeId={pathname === '/reports/new' ? 'new' : 'home'}
            onNavigate={(id) => {
              setMobileNav(false);
              if (id === 'notifications' || id === 'profile') {
                setTopic(id);
                return false;
              }
            }}
            header={<div className="reporter-sidebar-brand">{brand}</div>}
            footer={
              <div className="reporter-sidebar-bottom">
                <div className="reporter-hotline-card">
                  <strong>
                    <Phone size={15} />
                    Trực ban Ban Quản lý
                  </strong>
                  <p>Liên hệ bộ phận phụ trách khi bạn cần được hỗ trợ.</p>
                  <Button onClick={() => setTopic('hotline')}>Thông tin liên hệ</Button>
                </div>
                <button type="button" onClick={() => setTopic('help')}>
                  <CircleHelp size={15} />
                  Trợ giúp & hướng dẫn
                </button>
                <small>SafeOps v0.1.0 · Dữ liệu minh họa</small>
              </div>
            }
          />
        </>
      )}
      <div className="reporter-viewport">
        <Header
          className="reporter-header"
          variant="dashboard"
          connectionStatus={connection}
          userName="Nguyễn Văn An"
          userSubtitle="Cư dân · REPORTER"
          notificationCount={3}
          brand={
            compact ? (
              brand
            ) : (
              <div className="reporter-greeting">
                Xin chào, <strong>An!</strong>
                <small>Cùng xây dựng môi trường sống an toàn.</small>
              </div>
            )
          }
          onMenuClick={() => setMobileNav((current) => !current)}
          onNotificationsClick={() => setTopic('notifications')}
          onUserClick={() => setTopic('profile')}
          search={
            !compact && (
              <form className="reporter-global-search" action="/reports">
                <Search size={14} />
                <Input
                  name="q"
                  aria-label="Tìm nhanh báo cáo"
                  placeholder="Tìm sự cố, mã số, vị trí..."
                />
              </form>
            )
          }
          actions={
            compact && (
              <Link className="reporter-sos-link" href="/reports/new?urgency=CRITICAL">
                <Siren size={14} />
                SOS · Phản ánh
              </Link>
            )
          }
        />
        {!compact && connection !== 'connected' && (
          <div className="reporter-connection-banner">
            <ConnectionBanner status={connection} />
            <Button
              size="sm"
              onClick={() => {
                setConnection('connected');
                toast.info('Đã đổi trạng thái kết nối mẫu', {
                  description: 'Chưa có kết nối Socket.IO thật.',
                });
              }}
            >
              Thử kết nối lại
            </Button>
          </div>
        )}
        <main id="reporter-content" className="reporter-content">
          {children}
        </main>
        <footer className="reporter-footer">
          <span>
            <Shield size={12} />
            SafeOps · Cổng phản ánh cư dân
          </span>
          <span>Dữ liệu minh họa · Chưa kết nối hệ thống</span>
          <button type="button" onClick={() => setTopic('help')}>
            Hướng dẫn sử dụng
          </button>
        </footer>
      </div>
      <Dialog
        open={topic !== null}
        onOpenChange={(open) => {
          if (!open) setTopic(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{topic && info[topic].title}</DialogTitle>
            <DialogDescription>{topic && info[topic].description}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">{topic && info[topic].content}</p>
          {topic === 'profile' && (
            <Link href="/login" className="text-sm text-primary underline">
              Về trang đăng nhập
            </Link>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
