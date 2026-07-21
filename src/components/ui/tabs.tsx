'use client';

import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('inline-flex rounded-lg border bg-black/20 p-1', className)}
      role="tablist"
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  active,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'h-9 rounded-md px-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground',
        active && 'bg-secondary text-foreground shadow-sm',
        className,
      )}
      role="tab"
      type="button"
      {...props}
    />
  );
}
