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

export interface IncidentData {
  id: string;
  code: string;
  title: string;
  location: string;
  severity: IncidentSeverity;
  reportedAt: string;
}

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

interface Officer {
  id: string;
  name: string;
  team: string;
  distance: string;
  status: 'READY' | 'BUSY';
}

const nearbyOfficers: Officer[] = [
  {
    id: 'sec-01',
    name: 'Nguyễn Văn A',
    team: 'Đội phản ứng nhanh',
    distance: '350m',
    status: 'READY',
  },
  {
    id: 'sec-02',
    name: 'Trần Văn B',
    team: 'Bảo vệ ca trực Tòa nhà',
    distance: '1.2km',
    status: 'READY',
  },
  {
    id: 'sec-03',
    name: 'Lê Hoàng C',
    team: 'Tổ tuần tra cơ động số 3',
    distance: '2.5km',
    status: 'READY',
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
    }
  }, [incident]);

  if (!incident) return null;

  const severities: IncidentSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 text-blue-600">
            <Radio className="h-5 w-5 animate-pulse" />
            <DialogTitle className="text-base font-semibold text-[#0f172a] dark:text-zinc-50">
              Xác minh & Điều phối sự cố
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#64748b] dark:text-zinc-400">
            Mã sự cố:{' '}
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
              {incident.code}
            </span>{' '}
            —{' '}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              {incident.location}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Incident Title preview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="font-medium text-slate-900 dark:text-zinc-100">{incident.title}</div>
            <div className="mt-1 text-[11px] text-slate-500">
              Thời gian báo cáo: {incident.reportedAt}
            </div>
          </div>

          {/* Step 1: Confirm Severity */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-zinc-200">
              1. Xác nhận mức độ nghiêm trọng:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {severities.map((sev) => {
                const isSelected = selectedSeverity === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSelectedSeverity(sev)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg border p-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-950/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 dark:border-zinc-800',
                    )}
                  >
                    <SeverityBadge severity={sev} className="text-[11px]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Officer */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-zinc-200">
              2. Gợi ý lực lượng an ninh gần nhất (&lt; 5km):
            </label>
            <div className="space-y-1.5">
              {nearbyOfficers.map((officer) => {
                const isSelected = selectedOfficerId === officer.id;
                return (
                  <div
                    key={officer.id}
                    onClick={() => setSelectedOfficerId(officer.id)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'border-blue-500 bg-[#eff6ff] text-blue-900 shadow-xs dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-400 bg-white dark:bg-zinc-800',
                        )}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-semibold">{officer.name}</span>{' '}
                        <span className="text-[11px] text-slate-500">({officer.team})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-slate-600 dark:text-zinc-400">
                        Cách {officer.distance}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Sẵn sàng
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-row gap-2 justify-end sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            className="text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          >
            Hủy / Báo cáo giả
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-[#2563eb] text-xs font-semibold hover:bg-blue-700"
          >
            <Shield className="h-3.5 w-3.5" />
            Xác nhận & Điều phối ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
