import type { ComponentType, ReactNode } from "react";
import { IconCircle } from "@/components/ui/icon-circle";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  /** Defaults to "muted" (a plain not-found state); use "danger" for load errors. */
  iconTone?: "muted" | "danger";
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Card-level "nothing here" block: icon + title + description. */
export function EmptyState({
  icon: Icon,
  iconTone = "muted",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      {Icon && (
        <IconCircle size="size-11" tone={iconTone}>
          <Icon className="size-5" />
        </IconCircle>
      )}
      <div className="space-y-1">
        <p className="text-sm font-bold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Same idea, for the "no results" row inside an otherwise-populated `<Table>`. */
export function TableEmptyState({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  );
}
