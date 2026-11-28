'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  Map,
  Megaphone,
  Radio,
  Search,
  Shield,
  Siren,
  UsersRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar, type SidebarItem } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ConnectionBanner } from '@/components/common/ConnectionBanner';
import { DispatchDialog, type DispatchSelection } from '@/components/common/DispatchDialog';
import { IncidentStatusBadge } from '@/components/common/IncidentStatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ConnectionStatus } from '@/types/ui';
import type { DashboardIncident } from '@/types/incidents';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { dashboardIncidents, dashboardUnits } from '../fixtures';
import { useIncidentFilters } from '../hooks/useIncidentFilters';
import { DashboardMetrics } from './DashboardMetrics';
import { AreaSummary } from './AreaSummary';
import { TacticalMap } from './TacticalMap';
import { IncidentFeed } from './IncidentFeed';

const navItems: readonly SidebarItem[] = [
  {
    id: 'overview',
    label: 'Tổng quan Dashboard',
    href: '#dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  { id: 'map', label: 'Bản đồ trực tuyến', href: '/map', icon: <Map size={16} /> },
  {
    id: 'incidents',
    label: 'Sự cố & điều phối',
    href: '#incident-feed',
    icon: <Radio size={16} />,
    badge: '8',
  },
  { id: 'units', label: 'Quản lý lực lượng', href: '#units', icon: <UsersRound size={16} /> },
  {
    id: 'statistics',
    label: 'Báo cáo & thống kê',
    href: '#statistics',
    icon: <ChartNoAxesCombined size={16} />,
  },
];

export function AdminDashboard() {
  const searchInput = useRef<HTMLInputElement>(null);
  const [activeNav, setActiveNav] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>('reconnecting');
  const { search, setSearch, priority, setPriority, incidents, resetFilters } =
    useIncidentFilters(dashboardIncidents);
  const [selected, setSelected] = useState<DashboardIncident>(dashboardIncidents[2]);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchTrigger, setDispatchTrigger] = useState<HTMLButtonElement | null>(null);
  const [details, setDetails] = useState<DashboardIncident | null>(null);
  const [detailsTrigger, setDetailsTrigger] = useState<HTMLButtonElement | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  useKeyboardShortcut('k', () => searchInput.current?.focus(), {
    ctrlOrMeta: true,
    preventDefault: true,
  });
  useKeyboardShortcut('Escape', () => setMobileNav(false));

  function previewDispatch(selection: DispatchSelection) {
    const unit = dashboardUnits.find((item) => item.id === selection.unitId);
    toast.success('Đã ghi nhận lựa chọn mẫu', {
      description: `${selected.code} · ${selection.priority} · ${unit?.label.split(' — ')[0]}. Chưa gửi lệnh thật.`,
    });
  }
  function requestCancel() {
    setDispatchOpen(false);
    setReason('');
    setReasonError('');
    setReasonOpen(true);
  }
  function openDetails(incident: DashboardIncident, trigger: HTMLButtonElement | null = null) {
    setDetails(incident);
    setDetailsTrigger(trigger);
  }

  return (
    <div className="admin-dashboard" data-nav-open={mobileNav}>
      <a href="#dashboard" className="dashboard-skip">
        Đến nội dung chính
      </a>
      <Header
        variant="dashboard"
        connectionStatus={connection}
        notificationCount={3}
        userName="Lê Hoàng Sơn"
        userSubtitle="SOC Lead Commander"
        onMenuClick={() => setMobileNav((current) => !current)}
        brand={
          <Link href="/dashboard" className="dashboard-brand">
            <span>
              <Shield size={23} strokeWidth={2.4} />
            </span>
            <span>
              SafeOps<small>SECURITY OPERATIONS</small>
            </span>
          </Link>
        }
        search={
          <div className="dashboard-search">
            <Search size={14} aria-hidden="true" />
            <Input
              ref={searchInput}
              aria-label="Tìm sự cố, vị trí, đơn vị"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã sự cố (INC-#), vị trí, đơn vị..."
            />
            {search && (
              <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
            <kbd>
              <Command size={10} /> K
            </kbd>
          </div>
        }
        actions={
          <Button
            className="dashboard-sos"
            size="sm"
            onClick={() =>
              toast.info('SOS · Bản xem thử', {
                description: 'Chức năng phát cảnh báo khẩn cấp chưa kết nối hệ thống.',
              })
            }
          >
            <Siren size={14} />
            SOS
          </Button>
        }
        onNotificationsClick={() =>
          toast.info('Thông báo mẫu', {
            description: '3 cảnh báo mới: xâm nhập khu A, nhiệt độ kho B4 và cửa thoát hiểm.',
          })
        }
        onUserClick={() =>
          toast.info('Lê Hoàng Sơn · COMMANDER', {
            description: 'Hồ sơ minh họa theo thiết kế, chưa xác thực tài khoản.',
          })
        }
      />
      {connection !== 'connected' && (
        <div className="dashboard-warning">
          <ConnectionBanner status={connection} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConnection('connected');
              toast.info('Đã đổi trạng thái kết nối mẫu', {
                description: 'Chưa có kết nối Socket.IO thật.',
              });
            }}
          >
            Thử kết nối lại
            <ChevronDown size={12} />
          </Button>
        </div>
      )}
      <div className="dashboard-body">
        {mobileNav && (
          <button
            className="dashboard-nav-backdrop"
            aria-label="Đóng điều hướng"
            onClick={() => setMobileNav(false)}
          />
        )}
        <Sidebar
          variant="dashboard"
          items={navItems}
          activeId={activeNav}
          onNavigate={(id) => {
            setActiveNav(id);
            setMobileNav(false);
          }}
          header={
            <div className="dashboard-workspace">
              <span>H</span>
              <div>
                <strong>SAFEOPS SOC</strong>
                <small>Trung tâm điều hành</small>
              </div>
              <ChevronDown size={13} />
            </div>
          }
          footer={
            <div className="dashboard-sidebar-footer">
              <Button
                className="broadcast-button"
                onClick={() =>
                  toast.info('Phát thông báo · Bản xem thử', {
                    description: 'Chưa gửi thông báo đến lực lượng.',
                  })
                }
              >
                <Megaphone size={15} />
                Phát thông báo khẩn
              </Button>
              <div className="sidebar-system-state">
                <span>
                  <i />
                  Hệ thống giám sát
                </span>
                <small>Dữ liệu mẫu</small>
              </div>
              <button type="button" className="sidebar-help" onClick={() => setHelpOpen(true)}>
                <CircleHelp size={15} />
                Trợ giúp & hướng dẫn
              </button>
            </div>
          }
        />
        <main id="dashboard" className="dashboard-main">
          <h1 className="sr-only">Tổng quan điều hành SafeOps</h1>
          <DashboardMetrics />
          <div className="dashboard-workspace-grid">
            <TacticalMap onSelectIncident={() => openDetails(dashboardIncidents[0])} />
            <AreaSummary />
          </div>
          <IncidentFeed
            incidents={incidents}
            priority={priority}
            onPriorityChange={setPriority}
            onReset={resetFilters}
            onDetails={openDetails}
            onDispatch={(incident, trigger) => {
              setSelected(incident);
              setDispatchTrigger(trigger);
              setDispatchOpen(true);
            }}
          />
        </main>
      </div>
      <footer className="dashboard-footer">
        <span>
          <Shield size={12} />
          SafeOps · Security Operations Center
        </span>
        <span>Dữ liệu minh họa · Chưa kết nối hệ thống</span>
        <span>Phiên bản 0.1.0</span>
      </footer>
      <DispatchDialog
        key={selected.id}
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        incidentCode={`#${selected.code}`}
        location={selected.location}
        initialPriority={selected.priority}
        returnFocusTo={dispatchTrigger}
        units={dashboardUnits}
        allowedActions={selected.allowedActions}
        onConfirm={previewDispatch}
        onRequestCancel={requestCancel}
      />
      <Dialog
        open={Boolean(details)}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            if (detailsTrigger?.isConnected) {
              event.preventDefault();
              detailsTrigger.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Chi tiết sự cố #{details?.code}</DialogTitle>
            <DialogDescription>Thông tin minh họa của trung tâm điều hành.</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="incident-detail">
              <h3>{details.title}</h3>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge priority={details.priority} />
                <IncidentStatusBadge status={details.status} />
              </div>
              <dl>
                <dt>Vị trí</dt>
                <dd>{details.location}</dd>
                <dt>Khu vực</dt>
                <dd>{details.area}</dd>
                <dt>Tiếp nhận</dt>
                <dd>
                  {details.time} · {details.date}
                </dd>
                <dt>Nguồn</dt>
                <dd>{details.source}</dd>
                <dt>Lực lượng</dt>
                <dd>{details.unit ?? 'Chưa phân công'}</dd>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do hủy / báo cáo giả</DialogTitle>
            <DialogDescription>
              Nhập lý do cho sự cố #{selected.code}. Đây là thao tác mẫu.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!reason.trim()) {
                setReasonError('Vui lòng nhập lý do.');
                return;
              }
              toast.info('Đã ghi nhận lý do mẫu', { description: reason.trim() });
              setReasonOpen(false);
            }}
          >
            <Label htmlFor="dashboard-cancel-reason">Lý do bắt buộc</Label>
            <Textarea
              id="dashboard-cancel-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
              aria-required="true"
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? 'dashboard-reason-error' : undefined}
            />
            {reasonError && (
              <p role="alert" id="dashboard-reason-error" className="text-sm text-destructive">
                {reasonError}
              </p>
            )}
            <Button type="submit">Xác nhận hủy (mẫu)</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hướng dẫn Dashboard</DialogTitle>
            <DialogDescription>
              Bản xem thử giao diện SafeOps với dữ liệu minh họa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm leading-6">
            <p>
              Tìm theo mã sự cố, vị trí hoặc đơn vị trong thanh tìm kiếm. Dùng bộ lọc mức độ để thu
              hẹp danh sách và xuất kết quả thành CSV.
            </p>
            <p>
              Chọn pin sự cố để xem chi tiết; bật/tắt lớp lực lượng, cảm biến, drone trên sơ đồ. Các
              thao tác điều phối chỉ ghi nhận lựa chọn mẫu.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
