"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Search, TriangleAlert, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchUsers } from "@/lib/api-services";
import { cn, getErrorMessage, userLabel } from "@/lib/utils";
import type { AdminUser } from "@/types/api-types";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

/**
 * Pick a user from /admin/users instead of making the admin paste a raw UUID.
 * Debounces the query so typing doesn't fire a request per keystroke.
 */
export function UserPickerDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Select a user",
  confirmLabel = "Confirm",
  /** Ids already in the target set — shown as disabled with a badge. */
  excludeIds = [],
  excludeLabel = "Already added",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => Promise<void>;
  title?: string;
  confirmLabel?: string;
  excludeIds?: string[];
  excludeLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const requestIdRef = useRef(0);

  // Reset everything each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDebouncedQuery("");
    setSelected(null);
    setSubmitError("");
    setLoadError("");
  }, [open]);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Load results. requestId guards against a slow earlier response landing last.
  useEffect(() => {
    if (!open) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setLoadError("");

    fetchUsers({
      limit: PAGE_SIZE,
      offset: 0,
      q: debouncedQuery || undefined,
    })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setResults(res.data);
        setTotalItems(res.meta.totalItems);
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setLoadError(getErrorMessage(err, "Failed to load users"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [open, debouncedQuery]);

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      await onConfirm(selected.id);
      onOpenChange(false);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, "Failed to assign the user"));
    } finally {
      setSubmitting(false);
    }
  };

  const hiddenCount = Math.max(0, totalItems - results.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>{title}</Dialog.Header>

      <Dialog.Body>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, email, phone..."
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="max-h-[45vh] min-h-[12rem] overflow-y-auto rounded-lg border border-border bg-black/10">
            {loading && results.length === 0 ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-[var(--glass-2)]"
                  />
                ))}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <TriangleAlert className="size-5 text-red-300" />
                <p className="text-sm text-red-100">{loadError}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  <UserRound className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold">No users found</p>
                <p className="text-sm text-muted-foreground">
                  {debouncedQuery
                    ? `Nothing matched "${debouncedQuery}".`
                    : "No users to show."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((user) => {
                  const isExcluded = excludeIds.includes(user.id);
                  const isSelected = selected?.id === user.id;
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        disabled={isExcluded}
                        onClick={() => setSelected(user)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          isExcluded
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-white/[0.04]",
                          isSelected && "bg-orange-400/[0.10]",
                        )}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-xs font-black text-orange-100">
                          {userLabel(user, "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {userLabel(user)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.username
                              ? `@${user.username}`
                              : user.email || user.id}
                          </p>
                        </div>
                        {isExcluded ? (
                          <Badge variant="muted">{excludeLabel}</Badge>
                        ) : !user.isActive ? (
                          <Badge variant="danger">Banned</Badge>
                        ) : null}
                        {isSelected && (
                          <Check className="size-4 shrink-0 text-orange-200" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hiddenCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {results.length} of {totalItems}. Refine your search to
              narrow it down.
            </p>
          )}
        </div>
      </Dialog.Body>

      <Dialog.Footer>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {selected && (
            <span className="mr-auto truncate text-xs text-muted-foreground">
              Selected:{" "}
              <strong className="text-foreground">{userLabel(selected)}</strong>
            </span>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || submitting}>
            {submitting ? "Working..." : confirmLabel}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
