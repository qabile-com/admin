import type { HTMLAttributes } from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "warning" | "success" | "info";

const variantConfig: Record<AlertVariant, { classes: string; icon: typeof Info }> = {
  error: {
    classes: "border-badge-danger-border bg-badge-danger-bg text-badge-danger-text",
    icon: XCircle,
  },
  warning: {
    classes: "border-badge-warning-border bg-badge-warning-bg text-badge-warning-text",
    icon: TriangleAlert,
  },
  success: {
    classes: "border-badge-success-border bg-badge-success-bg text-badge-success-text",
    icon: CheckCircle2,
  },
  info: {
    classes: "border-badge-default-border bg-badge-default-bg text-badge-default-text",
    icon: Info,
  },
};

/** Replaces the hand-typed `rounded-lg border ... p-3 text-sm ...` inline message boxes. */
export function Alert({
  variant = "error",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  const { classes, icon: Icon } = variantConfig[variant];
  return (
    <div
      className={cn("flex items-start gap-2 rounded-lg border p-3 text-sm", classes, className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
