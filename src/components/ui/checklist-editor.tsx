"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted?: boolean;
}

/**
 * Add/edit/remove editor for a small ordered list of `{ id, text }` items —
 * used by both an episode's watch-along steps and a roadmap step's checklist.
 * Purely client-side until the caller submits the parent form; `isCompleted`
 * is preserved on edited items but not settable here (learners set it).
 */
export function ChecklistEditor({
  items,
  onChange,
  addLabel = "Add item",
  emptyHint = "No checklist items yet.",
  placeholder = (index: number) => `Item ${index + 1}`,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  addLabel?: string;
  emptyHint?: string;
  placeholder?: (index: number) => string;
}) {
  const addItem = () =>
    onChange([
      ...items,
      { id: `new-${Date.now()}-${items.length}`, text: "" },
    ]);

  const updateItem = (index: number, text: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, text } : item)));

  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">Checklist items</span>
        <Button type="button" size="sm" variant="secondary" onClick={addItem}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-border bg-black/10 p-3 text-xs text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={item.text}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={placeholder(index)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove item ${index + 1}`}
                onClick={() => removeItem(index)}
              >
                <X className="size-4 text-red-300" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
