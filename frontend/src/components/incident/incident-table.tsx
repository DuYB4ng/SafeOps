'use client';

import * as React from 'react';
import { ExternalLink, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IncidentStatus, SeverityBadge, StatusBadge } from '@/components/ui/badge';
import { IncidentData } from './dispatch-modal';
import { cn } from 'cn';

export interface IncidentRecord extends IncidentData {
  status: IncidentStatus;
  reporter: string;
}

interface IncidentTableProps {
  incidents: IncidentRecord[];
  onDispatchClick: (incident: IncidentRecord) => void;
  className?: string;
}

export function IncidentTable({ incidents, onDispatchClick, className }: IncidentTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSeverity, setFilterSeverity] = React.useState<string>('ALL');

  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
      return matchSearch && matchSeverity;
    });
  }, [incidents, searchTerm, filterSeverity]);

  return (
    <div
      data-slot="incident-table"
      className={cn(
        'rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
    >
      {/* Header controls: Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-[#0f172a] dark:text-zinc-50">
            Danh sách sự cố trực chiến
          </h2>
          <p className="text-xs text-[#64748b] dark:text-zinc-400">
            Cập nhật thời gian thực từ kênh Socket.IO trung tâm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Tìm kiếm sự cố, mã, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs dark:border-zinc-800 dark:bg-zinc-800">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1" />
            <select
              aria-label="Lọc theo mức độ nghiêm trọng"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-zinc-300"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60">
            <TableRow>
              <TableHead className="w-24 font-semibold">MÃ SỰ CỐ</TableHead>
              <TableHead className="font-semibold">TIÊU ĐỀ & VỊ TRÍ</TableHead>
              <TableHead className="w-28 text-center font-semibold">MỨC ĐỘ</TableHead>
              <TableHead className="w-32 text-center font-semibold">TRẠNG THÁI</TableHead>
              <TableHead className="w-40 font-semibold">THỜI GIAN</TableHead>
              <TableHead className="w-36 text-right font-semibold">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-slate-400">
                  Không có sự cố nào khớp với điều kiện lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow
                  key={incident.id}
                  className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                >
                  <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {incident.code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-zinc-100">
                      {incident.title}
                    </div>
                    <div className="text-[11px] text-slate-500">{incident.location}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <SeverityBadge severity={incident.severity} />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-zinc-400">
                    {incident.reportedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      onClick={() => onDispatchClick(incident)}
                      className="bg-[#2563eb] text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                      <span>Xác minh & Giao việc</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
