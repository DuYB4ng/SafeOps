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
import { SeverityBadge, StatusBadge } from '@/components/ui/badge';
import { IncidentRecord } from '../types/incident.types';
import { cn } from 'cn';

export type { IncidentRecord };

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
      className={cn('rounded-xl border border-border bg-card p-4 shadow-xs', className)}
    >
      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã, tên hoặc vị trí sự cố..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Mức độ:</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <Button
                key={sev}
                variant={filterSeverity === sev ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSeverity(sev)}
                className="h-7 text-[11px] px-2.5 font-medium cursor-pointer"
              >
                {sev === 'ALL' ? 'Tất cả' : sev}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu sự cố */}
      <div className="relative overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <TableHead className="w-[100px]">Mã sự cố</TableHead>
              <TableHead className="min-w-[220px]">Tiêu đề sự cố</TableHead>
              <TableHead className="min-w-[180px]">Vị trí phát sinh</TableHead>
              <TableHead className="w-[120px] text-center">Mức độ</TableHead>
              <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
              <TableHead className="w-[150px]">Thời gian báo cáo</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  Không tìm thấy sự cố nào phù hợp với bộ lọc hiện tại.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="transition-colors hover:bg-muted/30 group">
                  <TableCell className="font-mono font-semibold text-foreground">
                    {incident.code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{incident.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Báo bởi: {incident.reporter}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{incident.location}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <SeverityBadge severity={incident.severity} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusBadge status={incident.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[11px]">
                    {incident.reportedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDispatchClick(incident)}
                      className="h-7 text-[11px] gap-1 cursor-pointer font-medium hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <span>Điều phối</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Hiển thị <strong>{filteredIncidents.length}</strong> trên tổng số{' '}
          <strong>{incidents.length}</strong> sự cố
        </div>
      </div>
    </div>
  );
}
