'use client';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  Radio,
  Search,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import type { DashboardIncident } from '@/types/incidents';
import { downloadIncidentReport } from '@/services/incident-export.service';

const displayStatuses = {
  NEW: { variant: 'pending', label: 'PENDING' },
  CONFIRMED: { variant: 'pending', label: 'PENDING' },
  DISPATCHED: { variant: 'assigned', label: 'ASSIGNED' },
  IN_PROGRESS: { variant: 'processing', label: 'PROCESSING' },
  RESOLVED: { variant: 'resolved', label: 'RESOLVED' },
  CLOSED: { variant: 'resolved', label: 'CLOSED' },
  CANCELLED: { variant: 'canceled', label: 'CANCELED' },
} as const;

type IncidentFeedProps = {
  incidents: readonly DashboardIncident[];
  priority: string;
  onPriorityChange: (value: string) => void;
  onDetails: (incident: DashboardIncident, trigger: HTMLButtonElement) => void;
  onDispatch: (incident: DashboardIncident, trigger: HTMLButtonElement) => void;
  onReset: () => void;
};

export function IncidentFeed({
  incidents,
  priority,
  onPriorityChange,
  onDetails,
  onDispatch,
  onReset,
}: IncidentFeedProps) {
  return (
    <section
      className="dashboard-panel incident-feed"
      id="incident-feed"
      aria-labelledby="feed-title"
    >
      <div className="feed-header">
        <div>
          <h2 id="feed-title">
            <ClipboardList size={17} />
            Luồng sự cố &amp; điều phối trực tiếp<span className="feed-count">04</span>
          </h2>
          <p>Giám sát, xác minh và điều phối xử lý sự cố tập trung.</p>
        </div>
        <div className="feed-controls">
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger aria-label="Lọc mức độ sự cố" className="feed-priority-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả mức độ</SelectItem>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((value) => (
                <SelectItem value={value} key={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => downloadIncidentReport(incidents)}
            disabled={!incidents.length}
          >
            <Download size={14} />
            Xuất báo cáo
          </Button>
        </div>
      </div>
      <Table className="dashboard-feed-table" aria-label="Luồng sự cố điều hành">
        <colgroup>
          <col style={{ width: '11.3%' }} />
          <col style={{ width: '17.6%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '15.2%' }} />
          <col style={{ width: '12.9%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>MÃ SỰ CỐ</TableHead>
            <TableHead>NỘI DUNG SỰ CỐ</TableHead>
            <TableHead>MỨC ĐỘ</TableHead>
            <TableHead>VỊ TRÍ / KHU VỰC</TableHead>
            <TableHead>LỰC LƯỢNG</TableHead>
            <TableHead>TRẠNG THÁI</TableHead>
            <TableHead>THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length ? (
            incidents.map((incident) => {
              const visualStatus = displayStatuses[incident.status];
              return (
                <TableRow key={incident.id} data-priority={incident.priority}>
                  <TableCell>
                    <strong className="incident-code">#{incident.code}</strong>
                    <time>{incident.time}</time>
                    <small>{incident.date}</small>
                  </TableCell>
                  <TableCell>
                    <strong className="incident-title">{incident.title}</strong>
                    <small className="incident-source">
                      <Radio size={11} />
                      {incident.source}
                    </small>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge priority={incident.priority} />
                  </TableCell>
                  <TableCell>
                    <strong className="incident-location">{incident.location}</strong>
                    <small>{incident.area}</small>
                  </TableCell>
                  <TableCell>
                    {incident.unit ? (
                      <div className="incident-unit">
                        <span>
                          {incident.unit
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </span>
                        <div>
                          <strong>{incident.unit}</strong>
                          <small>{incident.unitName}</small>
                        </div>
                      </div>
                    ) : (
                      <span className="incident-unassigned">Chưa phân công</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={visualStatus.variant}
                      title={`Trạng thái API: ${incident.status}`}
                    >
                      {visualStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="incident-actions">
                      {incident.allowedActions.includes('DISPATCH') && (
                        <Button
                          size="sm"
                          className="incident-dispatch"
                          aria-label={`Điều phối ${incident.code}`}
                          onClick={(event) => onDispatch(incident, event.currentTarget)}
                        >
                          <Send size={11} />
                          {incident.status === 'CONFIRMED' ? 'Xác minh' : 'Điều phối'}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Xem chi tiết ${incident.code}`}
                        onClick={(event) => onDetails(incident, event.currentTarget)}
                      >
                        <Eye size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="dashboard-empty">
                  <Search size={24} />
                  <p>Không tìm thấy sự cố phù hợp.</p>
                  <Button variant="outline" onClick={onReset}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="feed-pagination">
        <p>
          Hiển thị <strong>{incidents.length ? `1–${incidents.length}` : '0'}</strong> trong{' '}
          <strong>{incidents.length}</strong> sự cố mẫu
        </p>
        <div>
          <Button variant="outline" size="icon" disabled aria-label="Trang trước">
            <ChevronLeft size={14} />
          </Button>
          <Button size="icon" aria-label="Trang 1" aria-current="page">
            1
          </Button>
          <Button variant="outline" size="icon" disabled aria-label="Trang sau">
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </section>
  );
}
