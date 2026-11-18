'use client';

import * as React from 'react';
import { CheckCircle2, MapPin, Radio, Shield } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IncidentSeverity, SeverityBadge } from '@/components/ui/badge';
import { IncidentData, Officer } from '../types/incident.types';

export type { IncidentData };

interface DispatchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  incident: IncidentData | null;
  onConfirmDispatch: (data: {
    incidentId: string;
    severity: IncidentSeverity;
    officerId: string;
  }) => void;
  onRejectIncident: (incidentId: string) => void;
}

const nearbyOfficers: Officer[] = [
  {
    id: 'sec-01',
    name: 'Nguyễn Văn A',
    team: 'Đội phản ứng nhanh',
    distance: '150m (Khoảng 2 phút)',
    status: 'READY',
  },
  {
    id: 'sec-02',
    name: 'Trần Thị B',
    team: 'Tổ tuần tra sảnh',
    distance: '350m (Khoảng 4 phút)',
    status: 'READY',
  },
  {
    id: 'sec-03',
    name: 'Lê Văn C',
    team: 'Bảo vệ tầng hầm',
    distance: '600m (Khoảng 8 phút)',
    status: 'BUSY',
  },
];

export function DispatchModal({
  isOpen,
  onOpenChange,
  incident,
  onConfirmDispatch,
  onRejectIncident,
}: DispatchModalProps) {
  const [selectedSeverity, setSelectedSeverity] = React.useState<IncidentSeverity>('HIGH');
  const [selectedOfficerId, setSelectedOfficerId] = React.useState<string>('sec-01');

  React.useEffect(() => {
    if (incident) {
      setSelectedSeverity(incident.severity);
      setSelectedOfficerId('sec-01');
    }
  }, [incident]);

  if (!incident) return null;

  const handleConfirm = () => {
    onConfirmDispatch({
      incidentId: incident.id,
      severity: selectedSeverity,
      officerId: selectedOfficerId,
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    onRejectIncident(incident.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <DialogTitle className="text-lg font-bold">Thẩm định & Điều phối Sự cố</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Xác minh mức độ nghiêm trọng và điều động lực lượng an ninh gần nhất đến hiện trường.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Thông tin sự cố */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {incident.code}
              </span>
              <SeverityBadge severity={incident.severity} />
            </div>
            <div className="font-medium text-foreground">{incident.title}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{incident.location}</span>
            </div>
          </div>

          {/* Chọn điều chỉnh mức độ nghiêm trọng */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Xác định lại mức độ (Severity)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer',
                    selectedSeverity === sev
                      ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  )}
                >
                  <SeverityBadge severity={sev} />
                </button>
              ))}
            </div>
          </div>

          {/* Đề xuất lực lượng phản ứng gần nhất */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Đề xuất lực lượng phản ứng gần nhất</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Sắp xếp theo khoảng cách)
              </span>
            </label>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {nearbyOfficers.map((officer) => {
                const isSelected = selectedOfficerId === officer.id;
                const isBusy = officer.status === 'BUSY';

                return (
                  <div
                    key={officer.id}
                    onClick={() => !isBusy && setSelectedOfficerId(officer.id)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-2.5 text-sm transition-all',
                      isBusy
                        ? 'opacity-50 cursor-not-allowed bg-muted/20'
                        : 'cursor-pointer hover:bg-muted/50',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'rounded-full p-1.5',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                          {officer.name}
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{officer.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground">{officer.distance}</div>
                      <div
                        className={cn(
                          'text-[10px] font-semibold',
                          isBusy ? 'text-amber-500' : 'text-emerald-500',
                        )}
                      >
                        {isBusy ? 'Đang bận' : 'Sẵn sàng'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 border-t pt-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleReject}
            className="cursor-pointer"
          >
            Báo cáo sai / Hủy sự cố
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="cursor-pointer font-medium"
            >
              Xác nhận & Điều động
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
