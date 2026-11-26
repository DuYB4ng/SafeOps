'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  LayoutDashboard,
  ListFilter,
  Map,
  MapPin,
  Menu,
  Search,
  Send,
  Shield,
  Siren,
  UsersRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar, type SidebarItem } from '@/components/layout/Sidebar';
import { ConnectionBadge } from '@/components/layout/ConnectionBadge';
import { DispatchDialog, type DispatchSelection } from '@/components/common/DispatchDialog';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { IncidentStatusBadge } from '@/components/common/IncidentStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { mapCategories, mapIncidents, mapUnits } from '../fixtures';
import { mapStatusLabels, mapUnitLabels } from '../presentation';
import { useOperatorMap } from '../hooks/useOperatorMap';
import { MapIncidentSummary } from './MapIncidentSummary';

const LeafletCanvas = dynamic(() => import('./LeafletCanvas'), {
  ssr: false,
  loading: () => (
    <div className="operator-map-loading">
      <Map size={30} />
      <span>Đang tải bản đồ Leaflet...</span>
    </div>
  ),
});
const navItems: readonly SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  { id: 'map', label: 'Bản đồ trực tuyến', href: '/map', icon: <Map size={16} /> },
  {
    id: 'dispatch',
    label: 'Điều phối lực lượng',
    href: '/dashboard#incident-feed',
    icon: <Send size={16} />,
  },
  { id: 'units', label: 'Đơn vị & đội phản ứng', href: '#units', icon: <UsersRound size={16} /> },
  {
    id: 'statistics',
    label: 'Phân tích & báo cáo',
    href: '/dashboard#statistics',
    icon: <BarChart3 size={16} />,
  },
];

export function OperatorMapScreen() {
  const state = useOperatorMap();
  const [navOpen, setNavOpen] = useState(false);
  const [alarmOpen, setAlarmOpen] = useState(true);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchTrigger, setDispatchTrigger] = useState<HTMLButtonElement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const selectedUnit = mapUnits.find((item) => item.id === unitId);
  const onUnitSelect = useCallback((id: string) => setUnitId(id), []);
  useKeyboardShortcut('Escape', () => setNavOpen(false));
  useKeyboardShortcut('k', () => searchInput.current?.focus(), {
    ctrlOrMeta: true,
    preventDefault: true,
  });

  function previewDispatch(selection: DispatchSelection) {
    toast.success('Đã ghi nhận lựa chọn điều phối mẫu', {
      description: `${state.selected?.code} · ${selection.priority} · ${mapUnits.find((unit) => unit.id === selection.unitId)?.name}. Chưa gửi lệnh thật.`,
    });
  }
  const dispatchUnits = (state.selected?.suggestions ?? []).flatMap((item) => {
    const unit = mapUnits.find((candidate) => candidate.id === item.unitId);
    return unit
      ? [
          {
            id: unit.id,
            label: `${unit.name} — ${item.distanceLabel} — ${mapUnitLabels[unit.status]}`,
            status: unit.status,
          },
        ]
      : [];
  });

  return (
    <div
      className="operator-map-screen"
      data-mobile-view={state.mobileView}
      data-nav-open={navOpen}
    >
      <a className="operator-map-skip" href="#operator-map-canvas">
        Đến bản đồ
      </a>
      <button
        className="operator-map-nav-backdrop"
        type="button"
        aria-label="Đóng điều hướng"
        onClick={() => setNavOpen(false)}
      />
      <Sidebar
        className="operator-map-sidebar"
        variant="dashboard"
        activeId="map"
        items={navItems}
        onNavigate={(id) => {
          setNavOpen(false);
          if (id === 'units') {
            state.setTab('units');
            state.setMobileView('list');
            return false;
          }
        }}
        header={
          <>
            <Link href="/dashboard" className="operator-map-brand">
              <Shield size={25} />
              <span>
                SafeOps<small>SECURITY OPERATIONS</small>
              </span>
            </Link>
            <div className="operator-map-operator">
              <span>TB</span>
              <div>
                <strong>Trực ban SOC</strong>
                <small>OPERATOR · Ca trực A</small>
              </div>
              <i />
            </div>
          </>
        }
        footer={
          <div className="operator-map-sidebar-footer">
            <Button
              onClick={() =>
                toast.info('SOS · Giao diện mẫu', {
                  description: 'Chưa phát thông báo khẩn cấp vì chưa kết nối hệ thống.',
                })
              }
            >
              <Siren size={16} />
              Thông báo khẩn cấp
            </Button>
            <button type="button" onClick={() => setHelpOpen(true)}>
              <CircleHelp size={12} />
              Trợ giúp & phím tắt
            </button>
            <small>SafeOps v0.1.0 · Dữ liệu mẫu</small>
          </div>
        }
      />
      <div className="operator-map-mobile-header">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mở điều hướng"
          onClick={() => setNavOpen((current) => !current)}
        >
          <Menu size={19} />
        </Button>
        <span>
          <Map size={16} />
          Bản đồ điều hành
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => state.setMobileView(state.mobileView === 'map' ? 'list' : 'map')}
        >
          {state.mobileView === 'map' ? `Danh sách (${state.incidents.length})` : 'Xem bản đồ'}
        </Button>
      </div>
      <section className="operator-map-list-panel" aria-label="Danh sách điều hành">
        <header>
          <div>
            <h1>Giám sát sự cố</h1>
            <ConnectionBadge status="disconnected" />
          </div>
          <div className="operator-map-search">
            <Search size={14} />
            <Input
              ref={searchInput}
              aria-label="Tìm sự cố hoặc lực lượng"
              value={state.search}
              onChange={(event) => state.updateFilter('search', event.target.value)}
              placeholder="Tìm mã số, tòa nhà, vị trí..."
            />
          </div>
          <div className="operator-map-list-tabs">
            <button
              type="button"
              aria-pressed={state.tab === 'incidents'}
              onClick={() => state.setTab('incidents')}
            >
              <Activity size={13} />
              Sự cố ({state.incidents.length})
            </button>
            <button
              type="button"
              aria-pressed={state.tab === 'units'}
              onClick={() => state.setTab('units')}
            >
              <UsersRound size={13} />
              Lực lượng ({state.units.length})
            </button>
          </div>
        </header>
        <div className="operator-map-list-scroll">
          {state.tab === 'incidents' ? (
            state.pageItems.length ? (
              state.pageItems.map((incident) => (
                <article
                  className="operator-map-incident-card"
                  data-active={state.selected?.id === incident.id}
                  key={incident.id}
                >
                  <button
                    type="button"
                    className="operator-map-card-select"
                    aria-label={`Định vị ${incident.code}`}
                    onClick={() => state.selectIncident(incident.id)}
                  >
                    <div>
                      <strong>#{incident.code}</strong>
                      <span>
                        <SeverityBadge priority={incident.priority} />
                        <Badge variant={mapStatusLabels[incident.status].variant}>
                          {mapStatusLabels[incident.status].label}
                        </Badge>
                      </span>
                    </div>
                    <h2>{incident.title}</h2>
                    <p>
                      <MapPin size={11} />
                      {incident.location}
                    </p>
                    <small>
                      <Clock3 size={10} />
                      {new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23',
                      }).format(new Date(incident.receivedAt))}{' '}
                      · Dữ liệu mẫu
                    </small>
                  </button>
                  {state.selected?.id === incident.id && (
                    <footer>
                      <span>
                        <MapPin size={11} />
                        Đang ghim trên bản đồ
                      </span>
                      <Button variant="link" size="sm" onClick={() => setDetailOpen(true)}>
                        Xem chi tiết
                      </Button>
                    </footer>
                  )}
                </article>
              ))
            ) : (
              <div className="operator-map-empty">
                <Search size={24} />
                <p>Không tìm thấy sự cố phù hợp.</p>
                <Button variant="outline" onClick={state.resetFilters}>
                  Đặt lại bộ lọc
                </Button>
              </div>
            )
          ) : state.units.length ? (
            state.units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                className="operator-map-unit-card"
                onClick={() => setUnitId(unit.id)}
              >
                <span className="operator-map-unit-avatar" data-status={unit.status}>
                  <Shield size={18} />
                </span>
                <div>
                  <strong>{unit.name}</strong>
                  <p>{unit.assignment}</p>
                  <small>
                    {unit.code} · {mapUnitLabels[unit.status]}
                  </small>
                </div>
              </button>
            ))
          ) : (
            <div className="operator-map-empty">
              <p>Không tìm thấy lực lượng phù hợp.</p>
            </div>
          )}
        </div>
        <footer>
          <span>
            {state.tab === 'incidents'
              ? `${state.incidents.length} sự cố · Trang ${state.page}/${state.pageCount}`
              : `${state.units.length} lực lượng · Vị trí mẫu`}
          </span>
          {state.tab === 'incidents' && (
            <div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Trang sự cố trước"
                disabled={state.page === 1}
                onClick={() => state.setPage((page) => page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Trang sự cố sau"
                disabled={state.page === state.pageCount}
                onClick={() => state.setPage((page) => page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </footer>
      </section>
      <main
        className="operator-map-stage"
        id="operator-map-canvas"
        data-summary-open={Boolean(state.selected)}
      >
        <LeafletCanvas
          incidents={state.incidents}
          units={state.units}
          showUnits={state.showUnits}
          selectedId={state.selected?.id ?? null}
          onSelect={state.selectIncident}
          onUnitSelect={onUnitSelect}
        />
        <div className="operator-map-toolbar">
          <span>
            <ListFilter size={15} />
            BỘ LỌC
          </span>
          <Select
            value={state.priority}
            onValueChange={(value) => state.updateFilter('priority', value)}
          >
            <SelectTrigger aria-label="Lọc ưu tiên bản đồ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Mọi mức độ</SelectItem>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={state.category}
            onValueChange={(value) => state.updateFilter('category', value)}
          >
            <SelectTrigger aria-label="Lọc loại sự cố bản đồ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Mọi loại sự cố</SelectItem>
              {mapCategories.map((item) => (
                <SelectItem value={item.code} key={item.code}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={state.status}
            onValueChange={(value) => state.updateFilter('status', value)}
          >
            <SelectTrigger aria-label="Lọc trạng thái bản đồ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Mọi trạng thái</SelectItem>
              {Object.entries(mapStatusLabels).map(([value, item]) => (
                <SelectItem key={value} value={value}>
                  {value} · {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={state.radius}
            onValueChange={(value) => state.updateFilter('radius', value)}
          >
            <SelectTrigger aria-label="Bán kính quanh tâm khu vực">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toàn khu vực</SelectItem>
              <SelectItem value="500">Trong 500m</SelectItem>
              <SelectItem value="1000">Trong 1km</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Đặt lại bộ lọc bản đồ"
            onClick={state.resetFilters}
          >
            <X size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={state.showUnits}
            onClick={() => state.setShowUnits((current) => !current)}
          >
            <UsersRound size={13} />
            Lực lượng
          </Button>
        </div>
        {alarmOpen && !state.selected && (
          <div className="operator-map-alarm">
            <Flame size={21} />
            <div>
              <strong>Cảnh báo ưu tiên · Dữ liệu mẫu</strong>
              <p>{mapIncidents[0].title}</p>
              <Button
                size="sm"
                onClick={() => {
                  state.resetFilters();
                  state.selectIncident('map-8921');
                }}
              >
                Định vị sự cố
              </Button>
            </div>
            <button
              type="button"
              aria-label="Đóng cảnh báo mẫu"
              onClick={() => setAlarmOpen(false)}
            >
              <X size={13} />
            </button>
          </div>
        )}
        {state.selected && (
          <MapIncidentSummary
            incident={state.selected}
            onClose={() => state.selectIncident(null)}
            onDetails={() => setDetailOpen(true)}
            onDispatch={(trigger) => {
              setDispatchTrigger(trigger);
              setDispatchOpen(true);
            }}
          />
        )}
        <div className="operator-map-legend">
          <strong>CHÚ GIẢI BẢN ĐỒ</strong>
          <div>
            <span>
              <i className="priority-critical" />
              CRITICAL
            </span>
            <span>
              <i className="priority-high" />
              HIGH
            </span>
            <span>
              <i className="priority-medium" />
              MEDIUM
            </span>
            <span>
              <i className="priority-low" />
              LOW
            </span>
            <span>
              <Shield size={11} />
              Lực lượng
            </span>
          </div>
        </div>
        <div className="operator-map-statusbar">
          <span>
            <MapPin size={11} />
            TP.HCM · Khuôn viên mẫu
          </span>
          <span>Chưa kết nối API / Socket.IO</span>
        </div>
      </main>
      {state.selected && (
        <DispatchDialog
          key={state.selected.id}
          open={dispatchOpen}
          onOpenChange={setDispatchOpen}
          incidentCode={`#${state.selected.code}`}
          location={state.selected.location}
          initialPriority={state.selected.priority}
          units={dispatchUnits}
          allowedActions={state.selected.allowedActions}
          returnFocusTo={dispatchTrigger}
          onConfirm={previewDispatch}
          onRequestCancel={() => {
            setDispatchOpen(false);
            setReason('');
            setReasonError('');
            setReasonOpen(true);
          }}
        />
      )}
      <Dialog open={detailOpen && Boolean(state.selected)} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết #{state.selected?.code}</DialogTitle>
            <DialogDescription>Thông tin sự cố mẫu dành cho điều phối viên.</DialogDescription>
          </DialogHeader>
          {state.selected && (
            <div className="operator-map-detail">
              <h3>{state.selected.title}</h3>
              <div>
                <SeverityBadge priority={state.selected.priority} />
                <IncidentStatusBadge status={state.selected.status} />
              </div>
              <p>{state.selected.description}</p>
              <dl>
                <dt>Vị trí</dt>
                <dd>{state.selected.location}</dd>
                <dt>Tọa độ</dt>
                <dd>
                  {state.selected.latitude.toFixed(5)}, {state.selected.longitude.toFixed(5)}
                </dd>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selectedUnit)}
        onOpenChange={(open) => {
          if (!open) setUnitId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUnit?.name}</DialogTitle>
            <DialogDescription>{selectedUnit?.code} · Thông tin lực lượng mẫu</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedUnit && mapUnitLabels[selectedUnit.status]} · {selectedUnit?.assignment}
          </p>
        </DialogContent>
      </Dialog>
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do hủy / báo cáo giả</DialogTitle>
            <DialogDescription>Thao tác mẫu chưa thay đổi dữ liệu sự cố.</DialogDescription>
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
            <Label htmlFor="map-cancel-reason">Lý do bắt buộc</Label>
            <Textarea
              id="map-cancel-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
              aria-required="true"
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? 'map-reason-error' : undefined}
            />
            {reasonError && (
              <p className="text-sm text-destructive" role="alert" id="map-reason-error">
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
            <DialogTitle>Bản đồ điều hành OPERATOR</DialogTitle>
            <DialogDescription>Leaflet tương tác với sự cố và lực lượng mẫu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm leading-6">
            <p>
              Chọn card hoặc marker để xem tóm tắt. Bấm cụm để phóng to và tách marker. Ctrl/⌘ + K
              để tìm kiếm.
            </p>
            <p>
              Nền chiến thuật/tối giản là sơ đồ cục bộ; nền đường phố dùng OpenStreetMap và cần
              mạng. Gợi ý điều phối là fixture, chưa có kết nối API.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
