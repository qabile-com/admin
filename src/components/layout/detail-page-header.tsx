import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Full-block header for a `/dashboard/{resource}/[id]` detail page: a back
 * link, the entity's title (or a skeleton while it loads), optional status
 * badges next to the title, an optional description line, and an optional
 * actions row (e.g. Delete). Pass this as `<AdminShell header={...}>` — it
 * replaces AdminShell's default eyebrow/title block rather than nesting
 * inside it, since a back-link + badges can't validly live inside an `<h1>`.
 */
export function DetailPageHeader({
  backHref,
  backLabel,
  loading = false,
  title,
  badges,
  description,
  actions,
}: {
  backHref: string;
  backLabel: string;
  loading?: boolean;
  title: ReactNode;
  badges?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div className="min-w-0">
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {backLabel}
        </Link>
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-black tracking-normal sm:text-3xl">
          {loading ? (
            <span className="h-8 w-56 animate-pulse rounded-md bg-[var(--glass-2)]" />
          ) : (
            <span className="truncate">{title}</span>
          )}
          {!loading && badges}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && !loading && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
