import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const badgeVariants = cva(
  'group/badge inline-flex items-center justify-center gap-1 overflow-hidden rounded-full border text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost:
          'border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',

        // Figma SafeOps Severities (Strict 100x25px spec)
        critical:
          'border-[#fecaca] bg-[#fee2e2] text-[#dc2626] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
        high: 'border-[#fde68a] bg-[#ffedd5] text-[#d97706] dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400',
        medium:
          'border-[#fef08a] bg-[#fef9c3] text-[#ca8a04] dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-400',
        low: 'border-[#e2e8f0] bg-[#f1f5f9] text-[#475569] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',

        // Figma SafeOps Statuses (Strict 100x25px spec)
        pending:
          'border-[#fde68a] bg-[#fef3c7] text-[#d97706] dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400',
        assigned:
          'border-[#bfdbfe] bg-[#dbeafe] text-[#2563eb] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
        processing:
          'border-[#c7d2fe] bg-[#e0e7ff] text-[#4f46e5] dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400',
        resolved:
          'border-[#bbf7d0] bg-[#dcfce7] text-[#16a34a] dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400',
        canceled:
          'border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

// Domain helpers matching SafeOps SRS & Figma (Strict 100px x 25px)
export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'PENDING' | 'ASSIGNED' | 'PROCESSING' | 'RESOLVED' | 'CANCELED';

const FIGMA_BADGE_BASE =
  'h-[25px] w-[100px] min-w-[100px] max-w-[100px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-bold uppercase tracking-[0.3px] leading-none whitespace-nowrap select-none';

export function SeverityBadge({
  severity,
  className,
}: {
  severity: IncidentSeverity;
  className?: string;
}) {
  const map: Record<IncidentSeverity, VariantProps<typeof badgeVariants>['variant']> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };
  return (
    <Badge variant={map[severity]} className={cn(FIGMA_BADGE_BASE, className)}>
      {severity}
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: IncidentStatus; className?: string }) {
  const map: Record<IncidentStatus, VariantProps<typeof badgeVariants>['variant']> = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    PROCESSING: 'processing',
    RESOLVED: 'resolved',
    CANCELED: 'canceled',
  };

  const labels: Record<IncidentStatus, string> = {
    PENDING: 'CHỜ DUYỆT',
    ASSIGNED: 'ĐÃ PHÂN CÔNG',
    PROCESSING: 'ĐANG XỬ LÝ',
    RESOLVED: 'ĐÃ XỬ LÝ',
    CANCELED: 'ĐÃ HỦY',
  };

  return (
    <Badge variant={map[status]} className={cn(FIGMA_BADGE_BASE, className)}>
      {labels[status]}
    </Badge>
  );
}

export { Badge, badgeVariants };
