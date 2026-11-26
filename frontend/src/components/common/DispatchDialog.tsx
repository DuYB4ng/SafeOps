'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import type { IncidentPriority, UnitStatus } from '@/types/enums';

export type UnitSuggestion = {
  id: string;
  label: string;
  status: UnitStatus;
};

export type DispatchSelection = { priority: IncidentPriority; unitId: string };

type DispatchDialogProps = {
  trigger?: React.ReactElement;
  returnFocusTo?: HTMLElement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentCode: string;
  location: string;
  initialPriority?: IncidentPriority;
  units: readonly UnitSuggestion[];
  allowedActions: readonly string[];
  onConfirm: (selection: DispatchSelection) => void | Promise<void>;
  onRequestCancel?: () => void;
};

const priorities: readonly IncidentPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function DispatchForm({
  units,
  initialPriority = 'HIGH',
  allowedActions,
  onConfirm,
  onOpenChange,
  onRequestCancel,
}: Omit<DispatchDialogProps, 'open' | 'incidentCode' | 'location'>) {
  const id = useId();
  const [priority, setPriority] = useState<IncidentPriority>(initialPriority);
  const [unitId, setUnitId] = useState(units.find((unit) => unit.status === 'AVAILABLE')?.id ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const selectedUnit = units.find((unit) => unit.id === unitId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allowedActions.includes('DISPATCH') || pending) return;
    if (!selectedUnit || selectedUnit.status !== 'AVAILABLE') {
      setError('Vui lòng chọn một lực lượng sẵn sàng.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await onConfirm({ priority, unitId });
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="min-w-0">
        <p className="dispatch-label mb-2.5">1. Xác nhận mức độ nghiêm trọng:</p>
        <RadioGroup
          disabled={pending}
          value={priority}
          onValueChange={(value) => {
            if (priorities.includes(value as IncidentPriority))
              setPriority(value as IncidentPriority);
          }}
          aria-label="Mức độ nghiêm trọng"
          className="grid grid-cols-4 gap-2"
        >
          {priorities.map((value) => (
            <label key={value} className="priority-option relative cursor-pointer">
              <RadioGroupItem value={value} id={`${id}-${value}`} className="peer sr-only" />
              <SeverityBadge
                priority={value}
                className="w-full peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-data-[state=checked]:outline-2 peer-data-[state=checked]:outline-offset-2 peer-data-[state=checked]:outline-primary"
              />
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="min-w-0">
        <p className="dispatch-label mb-2.5">2. Gợi ý lực lượng an ninh gần nhất (&lt; 5km):</p>
        {units.length > 0 ? (
          <RadioGroup
            disabled={pending}
            value={unitId}
            onValueChange={setUnitId}
            aria-label="Lực lượng điều phối"
            className="gap-2.5"
          >
            {units.map((unit) => (
              <label
                key={unit.id}
                className="unit-option"
                data-selected={unit.id === unitId}
                data-disabled={unit.status !== 'AVAILABLE'}
              >
                <RadioGroupItem
                  className="size-3"
                  value={unit.id}
                  disabled={unit.status !== 'AVAILABLE'}
                />
                <span>{unit.label}</span>
              </label>
            ))}
          </RadioGroup>
        ) : (
          <p className="rounded-lg border border-border p-3 text-center text-[13px] text-muted-foreground">
            Chưa có lực lượng được đề xuất.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {allowedActions.includes('DISPATCH') && (
          <Button type="submit" disabled={pending || selectedUnit?.status !== 'AVAILABLE'}>
            {pending ? 'Đang gửi...' : 'Xác nhận & Điều phối ngay'}
          </Button>
        )}
        {allowedActions.includes('CANCEL') && onRequestCancel ? (
          <Button type="button" variant="secondary" disabled={pending} onClick={onRequestCancel}>
            Hủy / Báo cáo giả
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        )}
      </div>
    </form>
  );
}

export function DispatchDialog(props: DispatchDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger && <DialogTrigger asChild>{props.trigger}</DialogTrigger>}
      <DialogContent
        className="safeops-dispatch-dialog"
        showCloseButton={false}
        data-figma-node="25:78"
        onCloseAutoFocus={(event) => {
          if (props.returnFocusTo?.isConnected) {
            event.preventDefault();
            props.returnFocusTo.focus();
          }
        }}
      >
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg leading-[22px] font-semibold">
            Xác minh &amp; Điều phối sự cố
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-4">
            Mã sự cố: {props.incidentCode} — Vị trí: {props.location}
          </DialogDescription>
        </DialogHeader>
        <DispatchForm {...props} />
      </DialogContent>
    </Dialog>
  );
}
