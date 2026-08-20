import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted' | 'danger';

const variants: Record<BadgeVariant, string> = {
  default: 'border-badge-default-border bg-badge-default-bg text-badge-default-text',
  success: 'border-badge-success-border bg-badge-success-bg text-badge-success-text',
  warning: 'border-badge-warning-border bg-badge-warning-bg text-badge-warning-text',
  muted: 'border-border bg-secondary text-muted-foreground',
  danger: 'border-badge-danger-border bg-badge-danger-bg text-badge-danger-text',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
