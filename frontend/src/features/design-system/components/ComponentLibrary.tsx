'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ConnectionBanner } from '@/components/common/ConnectionBanner';
import { DispatchDialog, type DispatchSelection } from '@/components/common/DispatchDialog';
import { IncidentStatusBadge } from '@/components/common/IncidentStatusBadge';
import { IncidentQueueTable, type IncidentQueueItem } from '@/components/common/IncidentQueueTable';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ConnectionStatus } from '@/types/ui';
import {
  incidentExamples,
  incidentStatuses,
  priorities,
  sidebarItems,
  unitSuggestions,
} from '../fixtures';

const visualStatuses = ['canceled', 'resolved', 'processing', 'assigned', 'pending'] as const;
const swatches = [
  { label: 'Primary', color: 'var(--primary)', hex: '#2563EB' },
  { label: 'Sidebar', color: 'var(--sidebar)', hex: '#475569' },
  { label: 'Text', color: 'var(--foreground)', hex: '#0F172A' },
  { label: 'Border', color: 'var(--border)', hex: '#E2E8F0' },
  { label: 'Surface', color: 'var(--card)', hex: '#FFFFFF' },
  { label: 'Critical', color: 'var(--critical-fg)', hex: '#DC2626' },
] as const;

export function ComponentLibrary() {
  const [activeNav, setActiveNav] = useState('overview');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [readOnlyOpen, setReadOnlyOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [lastSelection, setLastSelection] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentQueueItem | null>(null);
  const [dispatchReturnFocus, setDispatchReturnFocus] = useState<HTMLButtonElement | null>(null);

  const filteredIncidents = incidentExamples.filter((incident) => {
    const matchesSearch = `${incident.code} ${incident.title}`
      .toLocaleLowerCase('vi')
      .includes(search.trim().toLocaleLowerCase('vi'));
    return matchesSearch && (priorityFilter === 'ALL' || incident.priority === priorityFilter);
  });

  function previewDispatch(selection: DispatchSelection) {
    const unit = unitSuggestions.find((candidate) => candidate.id === selection.unitId);
    const message = `${selection.priority} · ${unit?.label ?? selection.unitId}`;
    setLastSelection(message);
    toast.success('Đã ghi nhận lựa chọn mẫu', {
      description: 'Đây là bản xem thử, chưa gửi lệnh điều phối.',
    });
  }

  function handleReasonSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) {
      setReasonError('Vui lòng nhập lý do.');
      return;
    }
    toast.info('Đã ghi nhận lý do mẫu', { description: reason.trim() });
    setReasonOpen(false);
    setReason('');
    setReasonError('');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-white focus:p-3"
      >
        Đến nội dung chính
      </a>
      <Sidebar items={sidebarItems} activeId={activeNav} onNavigate={setActiveNav} />
      <div className="min-w-0 flex-1">
        <Header
          connectionStatus={connectionStatus}
          notificationCount={3}
          onNotificationsClick={() =>
            toast.info('3 thông báo mẫu', { description: 'Bạn đang xem bộ giao diện SafeOps.' })
          }
          onUserClick={() =>
            toast.info('Trực ban A', { description: 'Tài khoản minh họa của bộ giao diện.' })
          }
        />
        <ConnectionBanner status={connectionStatus} />

        <main id="main-content" className="mx-auto flex max-w-[1248px] flex-col gap-6 p-4 lg:p-8">
          <section id="overview" className="scroll-mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium tracking-wide text-primary">
                SAFEOPS / 02-COMPONENTS
              </span>
              <a
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                href="https://www.figma.com/design/WQxeppTQRrMD9dYijJctmV/SafeOps-UI-UX?node-id=2-21"
                target="_blank"
                rel="noreferrer"
              >
                Xem thiết kế Figma
              </a>
            </div>
            <h1 className="text-2xl leading-8 font-bold">Thư viện giao diện SafeOps</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Màu sắc, trạng thái và các thành phần dùng chung cho trung tâm điều hành an ninh.
            </p>
          </section>

          <section className="library-panel" aria-labelledby="foundation-title">
            <h2 id="foundation-title" className="library-section-title">
              Nền tảng giao diện
            </h2>
            <p className="library-section-description">
              Inter · Màu xanh điều hành · Nền sáng và đường viền nhẹ.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {swatches.map((swatch) => (
                <div key={swatch.label}>
                  <div className="library-swatch" style={{ backgroundColor: swatch.color }} />
                  <p className="mt-2 text-xs font-medium">{swatch.label}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{swatch.hex}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="status" className="library-panel" aria-labelledby="status-title">
            <h2 id="status-title" className="library-section-title">
              Badge &amp; trạng thái
            </h2>
            <p className="library-section-description">
              9 kiểu badge trong Figma · 100 × 25 px · Bo góc tròn.
            </p>
            <div className="flex flex-wrap gap-3" aria-label="Badge Figma">
              {visualStatuses.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant.toUpperCase()}
                </Badge>
              ))}
              {priorities.map((priority) => (
                <div key={priority} data-testid={`figma-badge-${priority.toLowerCase()}`}>
                  <SeverityBadge priority={priority} />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-5">
              <h3 className="mb-3 text-sm font-medium">Trạng thái sự cố của hệ thống</h3>
              <div className="flex flex-wrap gap-3">
                {incidentStatuses.map((status) => (
                  <IncidentStatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
          </section>

          <section id="controls" className="library-panel" aria-labelledby="controls-title">
            <h2 id="controls-title" className="library-section-title">
              Form &amp; kết nối
            </h2>
            <p className="library-section-description">
              Thử nhập nội dung, chọn giá trị và đổi trạng thái kết nối mẫu.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="incident-search">Tìm sự cố mẫu</Label>
                <Input
                  id="incident-search"
                  placeholder="Tìm theo mã hoặc tiêu đề"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="connection-select">Trạng thái kết nối mẫu</Label>
                <Select
                  value={connectionStatus}
                  onValueChange={(value) => {
                    if (
                      value === 'connected' ||
                      value === 'reconnecting' ||
                      value === 'disconnected'
                    )
                      setConnectionStatus(value);
                  }}
                >
                  <SelectTrigger id="connection-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connected">Đã kết nối</SelectItem>
                    <SelectItem value="reconnecting">Đang kết nối lại</SelectItem>
                    <SelectItem value="disconnected">Mất kết nối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                onClick={() =>
                  toast.success('Thông báo đã hoạt động', {
                    description: 'Bộ component SafeOps đã sẵn sàng để dùng thử.',
                  })
                }
              >
                Hiện thông báo
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setPriorityFilter('ALL');
                }}
              >
                Đặt lại bộ lọc
              </Button>
              <Button variant="outline" disabled>
                Đang xử lý...
              </Button>
            </div>
          </section>

          <section id="dispatch" className="library-panel" aria-labelledby="dispatch-title">
            <h2 id="dispatch-title" className="library-section-title">
              Modal xác minh &amp; điều phối
            </h2>
            <p className="library-section-description">
              Modal 480 px · Mức độ nghiêm trọng · Danh sách lực lượng · Xác nhận thao tác.
            </p>
            <div className="flex flex-wrap gap-3">
              <DispatchDialog
                trigger={
                  <Button
                    onClick={() => {
                      setSelectedIncident(null);
                      setDispatchReturnFocus(null);
                    }}
                  >
                    Mở modal điều phối
                  </Button>
                }
                open={dispatchOpen}
                onOpenChange={setDispatchOpen}
                incidentCode={selectedIncident?.code ?? '#INC-001'}
                location={selectedIncident?.location ?? 'Tầng hầm B2'}
                initialPriority={selectedIncident?.priority}
                returnFocusTo={dispatchReturnFocus}
                units={unitSuggestions}
                allowedActions={selectedIncident?.allowedActions ?? ['DISPATCH', 'CANCEL']}
                onConfirm={previewDispatch}
                onRequestCancel={() => {
                  setDispatchOpen(false);
                  setReasonOpen(true);
                }}
              />
              <DispatchDialog
                trigger={<Button variant="outline">Xem modal chỉ đọc</Button>}
                open={readOnlyOpen}
                onOpenChange={setReadOnlyOpen}
                incidentCode="#INC-001"
                location="Tầng hầm B2"
                units={unitSuggestions}
                allowedActions={[]}
                onConfirm={previewDispatch}
              />
            </div>
            {lastSelection && (
              <p
                role="status"
                data-testid="dispatch-result"
                className="mt-4 rounded-lg bg-accent p-3 text-sm leading-6 text-accent-foreground"
              >
                Lựa chọn mẫu: {lastSelection}
              </p>
            )}
          </section>

          <section className="library-panel" aria-labelledby="table-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 id="table-title" className="library-section-title">
                  Bảng sự cố minh họa
                </h2>
                <p className="library-section-description">
                  Table theo thiết kế Figma · 4 hàng · Badge và thao tác điều phối.
                </p>
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger aria-label="Lọc mức ưu tiên" className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả mức ưu tiên</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <IncidentQueueTable
              incidents={filteredIncidents}
              renderStatus={() => <Badge variant="pending">PENDING</Badge>}
              onAction={(incident, trigger) => {
                setSelectedIncident(incident);
                setDispatchReturnFocus(trigger);
                setDispatchOpen(true);
              }}
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Dữ liệu minh họa để kiểm tra component, chưa kết nối hệ thống.
            </p>
          </section>

          <footer className="pb-2 text-xs leading-5 text-muted-foreground">
            SafeOps · Bộ giao diện dùng chung · Bản xem thử với dữ liệu mẫu.
          </footer>
        </main>
      </div>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do hủy / báo cáo giả</DialogTitle>
            <DialogDescription>
              Nhập lý do để thử hành động này. Bản xem thử chưa thay đổi dữ liệu thật.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleReasonSubmit}>
            <Label htmlFor="cancel-reason">Lý do bắt buộc</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
              aria-required="true"
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? 'reason-error' : undefined}
            />
            {reasonError && (
              <p id="reason-error" role="alert" className="text-sm text-destructive">
                {reasonError}
              </p>
            )}
            <Button type="submit">Xác nhận hủy (mẫu)</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
