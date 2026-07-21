import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted' | 'danger';

const variants: Record<BadgeVariant, string> = {
  default: 'border-orange-300/25 bg-orange-400/10 text-orange-100',
  success: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100',
  warning: 'border-amber-300/25 bg-amber-400/10 text-amber-100',
  muted: 'border-white/10 bg-white/5 text-muted-foreground',
  danger: 'border-red-300/25 bg-red-400/10 text-red-100',
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
