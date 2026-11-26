import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { Slot } from 'radix-ui';

const badgeVariants = cva(
  'group/badge inline-flex h-[var(--badge-height)] w-[var(--badge-width)] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 text-xs leading-4 font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        canceled: 'bg-[var(--canceled-bg)] text-[var(--canceled-fg)]',
        resolved: 'bg-[var(--resolved-bg)] text-[var(--resolved-fg)]',
        processing: 'bg-[var(--processing-bg)] text-[var(--processing-fg)]',
        assigned: 'bg-[var(--assigned-bg)] text-[var(--assigned-fg)]',
        pending: 'bg-[var(--pending-bg)] text-[var(--pending-fg)]',
        low: 'bg-[var(--low-bg)] text-[var(--low-fg)]',
        medium: 'bg-[var(--medium-bg)] text-[var(--medium-fg)]',
        high: 'bg-[var(--high-bg)] text-[var(--high-fg)]',
        critical: 'bg-[var(--critical-bg)] text-[var(--critical-fg)]',
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
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
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
