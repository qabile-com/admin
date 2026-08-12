"use client";

import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The Save/Discard footer pattern first built for the XP-rules and
 * forum-cooldown settings cards, extracted so every edit page (course,
 * episode, roadmap, roadmap step, ...) shares one implementation.
 */
export function SaveDiscardBar({
  hasChanges,
  saving,
  savedAt,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
  savingLabel = "Saving...",
  className,
}: {
  hasChanges: boolean;
  saving: boolean;
  savedAt?: string | null;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
  savingLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4",
        className,
      )}
    >
      {savedAt && !hasChanges && (
        <span className="mr-auto text-xs text-muted-foreground">
          Saved at {savedAt}
        </span>
      )}
      <Button
        variant="secondary"
        onClick={onDiscard}
        disabled={!hasChanges || saving}
      >
        <RotateCcw className="size-4" />
        Discard
      </Button>
      <Button onClick={onSave} disabled={!hasChanges || saving}>
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {saving ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
