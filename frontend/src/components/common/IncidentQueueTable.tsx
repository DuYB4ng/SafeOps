'use client';

import type { ReactNode } from 'react';
import { IncidentStatusBadge } from '@/components/common/IncidentStatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IncidentPriority, IncidentStatus } from '@/types/enums';

export type IncidentQueueItem = {
  id: string;
  code: string;
  title: string;
  location: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  receivedAt: string;
  allowedActions: readonly string[];
};

type IncidentQueueTableProps = {
  incidents: readonly IncidentQueueItem[];
  onAction?: (incident: IncidentQueueItem, trigger: HTMLButtonElement) => void;
  renderStatus?: (incident: IncidentQueueItem) => ReactNode;
};

const timeOptions = { timeZone: 'Asia/Ho_Chi_Minh' } as const;
const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  ...timeOptions,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  ...timeOptions,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatReceivedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${timeFormatter.format(date)} - ${dateFormatter.format(date)}`;
}

export function IncidentQueueTable({ incidents, onAction, renderStatus }: IncidentQueueTableProps) {
  return (
    <div className="safeops-queue-table" data-testid="incident-queue-table" data-figma-node="25:43">
      <Table className="safeops-queue-grid" aria-label="Danh sách sự cố">
        <colgroup>
          <col className="queue-code-column" />
          <col className="queue-title-column" />
          <col className="queue-badge-column" />
          <col className="queue-badge-column" />
          <col className="queue-time-column" />
          <col />
        </colgroup>
        <TableHeader className="queue-accessible-header">
          <TableRow>
            <TableHead scope="col">Mã sự cố</TableHead>
            <TableHead scope="col">Tiêu đề</TableHead>
            <TableHead scope="col">Mức độ</TableHead>
            <TableHead scope="col">Trạng thái</TableHead>
            <TableHead scope="col">Thời gian tiếp nhận</TableHead>
            <TableHead scope="col">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length ? (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.code}</TableCell>
                <TableCell className="queue-title-cell" title={incident.title}>
                  {incident.title}
                </TableCell>
                <TableCell>
                  <SeverityBadge priority={incident.priority} />
                </TableCell>
                <TableCell>
                  {renderStatus ? (
                    renderStatus(incident)
                  ) : (
                    <IncidentStatusBadge status={incident.status} />
                  )}
                </TableCell>
                <TableCell>
                  <time dateTime={incident.receivedAt}>
                    {formatReceivedAt(incident.receivedAt)}
                  </time>
                </TableCell>
                <TableCell>
                  {onAction &&
                    (incident.allowedActions.includes('CONFIRM') ||
                      incident.allowedActions.includes('DISPATCH')) && (
                      <Button
                        type="button"
                        variant="link"
                        className="queue-action"
                        aria-label={`Xác minh & Giao việc cho ${incident.code}`}
                        onClick={(event) => onAction(incident, event.currentTarget)}
                      >
                        Xác minh &amp; Giao việc
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="queue-empty-row">
              <TableCell colSpan={6}>Không tìm thấy sự cố phù hợp.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
