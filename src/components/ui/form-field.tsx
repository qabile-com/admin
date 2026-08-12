import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard label + control + optional hint/error wrapper for form fields.
 * Replaces the `<label className="space-y-2"><span className="text-sm
 * font-bold">...</span>...</label>` block that used to be hand-typed at every
 * call site across the create/edit dialogs.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between">
        <span className="text-sm font-bold">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
