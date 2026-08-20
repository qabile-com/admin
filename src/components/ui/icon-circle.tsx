import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconCircleTone = "brand" | "muted" | "success" | "warning" | "danger";

const toneClasses: Record<IconCircleTone, string> = {
  brand: "bg-badge-default-bg text-badge-default-text",
  muted: "bg-secondary text-muted-foreground",
  success: "bg-badge-success-bg text-badge-success-text",
  warning: "bg-badge-warning-bg text-badge-warning-text",
  danger: "bg-badge-danger-bg text-badge-danger-text",
};

/**
 * The `flex size-N items-center justify-center rounded-full` avatar/icon-badge shape,
 * used for both initials avatars (tone="brand", text children) and icon badges
 * (any tone, a lucide icon child) — see the callers for each shape.
 */
export function IconCircle({
  tone = "muted",
  size = "size-11",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: IconCircleTone;
  size?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-black",
        size,
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
