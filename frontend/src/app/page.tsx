'use client';

import * as React from 'react';
import { Flame, Radio, ShieldAlert, Users } from 'lucide-react';
import { ConnectionBanner } from '@/components/feedback/connection-banner';
import { Header } from '@/components/layout/header';
import { NavItemKey, Sidebar } from '@/components/layout/sidebar';
import { DispatchModal } from '@/components/incident/dispatch-modal';
import { IncidentRecord, IncidentTable } from '@/components/incident/incident-table';
import { IncidentSeverity } from '@/components/ui/badge';

const initialIncidents: IncidentRecord[] = [
  {
    id: 'inc-1',
    code: '#INC-001',
    title: 'Báo cháy & khói bất thường tầng hầm B2',
    location: 'Tòa nhà A — Tầng hầm B2 Khu đỗ xe',
    severity: 'CRITICAL',
    status: 'PENDING',
    reportedAt: '10:45 - 16/11/2026',
    reporter: 'Cảm biến IoT HazNode & Bảo vệ ca trực',
  },
  {
    id: 'inc-2',
    code: '#INC-002',
    title: 'Xâm nhập trái phép khu vực phòng máy chủ Server',
    location: 'Tầng 4 — Khu kỹ thuật bảo mật DC-01',
    severity: 'HIGH',
    status: 'ASSIGNED',
    reportedAt: '10:20 - 16/11/2026',
    reporter: 'Camera AI nhận diện xâm nhập',
  },
  {
    id: 'inc-3',
    code: '#INC-003',
    title: 'Mất tín hiệu camera an ninh hành lang B',
    location: 'Tầng 2 — Hành lang cánh Đông',
    severity: 'MEDIUM',
    status: 'PROCESSING',
    reportedAt: '09:55 - 16/11/2026',
    reporter: 'Hệ thống giám sát NVR',
  },
  {
    id: 'inc-4',
    code: '#INC-004',
    title: 'Phát hiện túi xách vô chủ tại sảnh chính',
    location: 'Sảnh chính Lobby Tầng 1',
    severity: 'LOW',
    status: 'RESOLVED',
    reportedAt: '09:15 - 16/11/2026',
    reporter: 'Lễ tân tiếp đón',
  },
];

export default function Home() {
  const [activeNav, setActiveNav] = React.useState<NavItemKey>('dashboard');
  const [showBanner, setShowBanner] = React.useState(true);
  const [incidents, setIncidents] = React.useState<IncidentRecord[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = React.useState<IncidentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleOpenDispatch = (incident: IncidentRecord) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleConfirmDispatch = (data: {
    incidentId: string;
    severity: IncidentSeverity;
    officerId: string;
  }) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === data.incidentId
          ? {
              ...item,
              severity: data.severity,
              status: 'ASSIGNED',
            }
          : item,
      ),
    );

    setSuccessMessage(
      `Đã xác minh và điều phối lực lượng cho sự cố ${selectedIncident?.code || ''}!`,
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRejectIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              status: 'CANCELED',
            }
          : item,
      ),
    );

    setSuccessMessage('Đã hủy và đánh dấu sự cố là báo cáo giả.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // KPI telemetry calculations
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const processingCount = incidents.filter(
    (i) => i.status === 'PROCESSING' || i.status === 'ASSIGNED',
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans dark:bg-zinc-950">
      {/* 1. Connection Banner from Figma */}
      <ConnectionBanner
        isVisible={showBanner}
        onClose={() => setShowBanner(false)}
        onRetry={() => {
          setShowBanner(false);
          setSuccessMessage('Đã kết nối lại kênh Socket.IO thành công!');
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />

      {/* 2. Header from Figma */}
      <Header
        title="Trung tâm điều hành an ninh SafeOps"
        isSocketConnected={!showBanner}
        unreadNotificationsCount={criticalCount}
        userName="Trực ban A"
        userRole="Operator Direct"
      />

      {/* Success alert message toast */}
      {successMessage && (
        <div className="sticky top-16 z-30 flex items-center justify-between bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-md animate-in slide-in-from-top-2">
          <span>✅ {successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-white hover:text-emerald-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* 3. Sidebar from Figma */}
        <Sidebar activeItem={activeNav} onSelect={setActiveNav} />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Section: Telemetry KPI Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Tổng sự cố trực chiến
                </span>
                <ShieldAlert className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
                  {totalIncidents}
                </span>
                <span className="text-xs text-emerald-600 font-medium">Hôm nay</span>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs dark:border-red-900/50 dark:bg-red-950/20">
              <div className="flex items-center justify-between text-red-600">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Khẩn cấp CRITICAL
                </span>
                <Flame className="h-4 w-4 text-red-600 animate-pulse" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
                <span className="text-xs text-red-700 font-medium">Cần xử lý ngay</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Đang điều phối</span>
                <Radio className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
                  {processingCount}
                </span>
                <span className="text-xs text-amber-600 font-medium">
                  Lực lượng ngoài hiện trường
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Nhân lực sẵn sàng
                </span>
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-zinc-50">8 / 10</span>
                <span className="text-xs text-emerald-600 font-medium">
                  Bảo vệ & Phản ứng nhanh
                </span>
              </div>
            </div>
          </section>

          {/* Section: Live Dispatch Table from Figma */}
          <section>
            <IncidentTable incidents={incidents} onDispatchClick={handleOpenDispatch} />
          </section>
        </main>
      </div>

      {/* 4. Dispatch Modal from Figma */}
      <DispatchModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        incident={selectedIncident}
        onConfirmDispatch={handleConfirmDispatch}
        onRejectIncident={handleRejectIncident}
      />
    </div>
  );
}
