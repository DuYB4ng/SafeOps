'use client';

import { Clock3, MapPin, ShieldCheck, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import type { MapIncident } from '@/types/map';
import { mapUnits } from '../fixtures';
import { mapStatusLabels } from '../presentation';

export function MapIncidentSummary({
  incident,
  onClose,
  onDetails,
  onDispatch,
}: {
  incident: MapIncident;
  onClose: () => void;
  onDetails: () => void;
  onDispatch: (trigger: HTMLButtonElement) => void;
}) {
  const status = mapStatusLabels[incident.status];
  return (
    <section className="operator-map-summary" aria-label={`Tóm tắt ${incident.code}`}>
      <header>
        <div>
          <SeverityBadge priority={incident.priority} />
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <Button variant="ghost" size="icon" aria-label="Đóng tóm tắt sự cố" onClick={onClose}>
          <X size={15} />
        </Button>
      </header>
      <div className="operator-map-summary-body">
        <div
          className="operator-map-incident-illustration"
          aria-label="Ảnh minh họa phòng kỹ thuật"
        >
          <svg viewBox="0 0 300 100" aria-hidden="true">
            <rect width="300" height="100" fill="#cbd5e1" />
            <path d="M0 100L65 50H235L300 100" fill="#94a3b8" />
            <rect x="112" y="10" width="77" height="76" rx="3" fill="#475569" />
            <path d="M119 25H181M119 34H181M119 44H181" stroke="#94a3b8" strokeWidth="3" />
            <path
              d="M149 57Q124 29 143 3M172 51Q189 24 176 1"
              stroke="#64748b"
              strokeWidth="9"
              opacity=".4"
              fill="none"
            />
          </svg>
          <span>Ảnh minh họa</span>
        </div>
        <small>#{incident.code}</small>
        <h2>{incident.title}</h2>
        <p>
          <MapPin size={13} />
          {incident.location}
        </p>
        <p>
          <Clock3 size={13} />
          Tiếp nhận{' '}
          {new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
          }).format(new Date(incident.receivedAt))}{' '}
          · Dữ liệu mẫu
        </p>
        <p>
          <UserRound size={13} />
          Người báo cáo: tài khoản minh họa
        </p>
        {incident.suggestions.length > 0 && (
          <div className="operator-map-suggestions">
            <strong>
              <ShieldCheck size={14} />
              Gợi ý lực lượng gần nhất
            </strong>
            {incident.suggestions.map((item) => (
              <span key={item.unitId}>
                • {mapUnits.find((unit) => unit.id === item.unitId)?.name}{' '}
                <small>({item.distanceLabel})</small>
              </span>
            ))}
            <em>Khoảng cách/gợi ý mẫu, chưa gọi API.</em>
          </div>
        )}
      </div>
      <footer>
        <Button variant="outline" onClick={onDetails}>
          Xem chi tiết
        </Button>
        {incident.allowedActions.includes('DISPATCH') && (
          <Button onClick={(event) => onDispatch(event.currentTarget)}>Xác minh & điều phối</Button>
        )}
      </footer>
    </section>
  );
}
