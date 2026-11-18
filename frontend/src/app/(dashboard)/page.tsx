'use client';

import * as React from 'react';
import { StatsCards } from '@/features/dashboard';
import { DispatchModal, IncidentRecord, IncidentTable } from '@/features/incidents';
import { IncidentSeverity } from '@/types';

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
    reporter: 'Nhân viên lễ tân',
  },
];

export default function DashboardHomePage() {
  const [incidents, setIncidents] = React.useState<IncidentRecord[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = React.useState<IncidentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
          ? { ...item, severity: data.severity, status: 'ASSIGNED' as const }
          : item,
      ),
    );
  };

  const handleRejectIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId ? { ...item, status: 'CANCELED' as const } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* 4 Thẻ KPI Chỉ huy Tác chiến */}
      <StatsCards
        criticalCount={
          incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length
        }
        totalPending={incidents.filter((i) => i.status === 'PENDING').length}
      />

      {/* Bảng sự cố tác chiến trung tâm */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Bảng Giám sát & Điều phối Sự cố Thời gian thực
            </h2>
            <p className="text-xs text-muted-foreground">
              Dữ liệu được đồng bộ trực tiếp từ các cảm biến IoT và camera an ninh G-Tel
            </p>
          </div>
        </div>

        <IncidentTable incidents={incidents} onDispatchClick={handleOpenDispatch} />
      </div>

      {/* Modal điều phối lực lượng */}
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
