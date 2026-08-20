"use client";

import { useState } from "react";
import { Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SwitchField } from "@/components/ui/switch";
import { useConfirm, useConfirmDelete } from "@/components/ui/confirm-dialog";
import { useRebirthRules } from "@/hooks/use-rebirth-rules";
import type { RebirthRule } from "@/types/api-types";

const EMPTY_FORM = { rebirthNumber: 1, requiredXp: 0, isActive: true };

export function RebirthRulesCard() {
  const {
    maxSummary,
    loading,
    error,
    refetch,
    sessionRules,
    upsertRule,
    removeRule,
  } = useRebirthRules();
  const confirm = useConfirm();
  const confirmDelete = useConfirmDelete();

  const [form, setForm] = useState(EMPTY_FORM);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const requestSave = () => {
    confirm({
      title: "Save rebirth tier",
      variant: "warning",
      confirmLabel: "Save tier",
      description: (
        <>
          Set rebirth{" "}
          <strong className="text-foreground">#{form.rebirthNumber}</strong> to
          require{" "}
          <strong className="text-foreground">
            {form.requiredXp.toLocaleString()} XP
          </strong>
          {form.isActive ? "" : ", and mark it inactive"}? This applies to every
          player targeting this tier immediately.
        </>
      ),
      onConfirm: async () => {
        await upsertRule(form);
        setSavedAt(new Date().toLocaleTimeString());
      },
    });
  };

  const handleDeleteRule = (rule: RebirthRule) => {
    confirmDelete({
      entityLabel: "rebirth tier",
      entityName: rule.title,
      onConfirm: () => removeRule(rule.id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconCircle tone="brand" size="size-10" className="rounded-lg">
              <Sparkles className="size-5" />
            </IconCircle>
            <div>
              <CardTitle>Rebirth tiers</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prestige resets available to players
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : error ? (
            <EmptyState
              icon={TriangleAlert}
              iconTone="danger"
              title="Couldn't load rebirth tiers"
              description={error.message}
              action={
                <Button size="sm" variant="secondary" onClick={refetch}>
                  Try again
                </Button>
              }
            />
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-border bg-black/10 p-4">
              <div>
                <p className="text-sm font-bold">Maximum allowed rebirths</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Derived from your configured tiers — not directly editable here.
                </p>
              </div>
              <p className="text-3xl font-black">
                {maxSummary?.maximumAllowedRebirth ?? 0}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configure a tier */}
      <Card>
        <CardHeader>
          <CardTitle>Configure a tier</CardTitle>
          <p className="text-xs text-muted-foreground">
            Create a new rebirth tier or update an existing one by its number.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">Rebirth number</span>
              <Input
                type="number"
                min={1}
                value={form.rebirthNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rebirthNumber: Math.max(1, Number(e.target.value)),
                  })
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Required XP</span>
              <Input
                type="number"
                min={0}
                value={form.requiredXp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    requiredXp: Math.max(0, Number(e.target.value)),
                  })
                }
              />
            </label>
          </div>
          <SwitchField
            label="Active"
            description="Inactive tiers stay hidden from players."
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          {savedAt && (
            <span className="mr-auto text-xs text-muted-foreground">
              Saved at {savedAt}
            </span>
          )}
          <Button variant="secondary" onClick={() => setForm(EMPTY_FORM)}>
            Reset
          </Button>
          <Button onClick={requestSave}>Save tier</Button>
        </div>
      </Card>

      {/* Session-tracked rules */}
      <Card>
        <CardHeader>
          <CardTitle>Rules changed this session</CardTitle>
          <p className="text-xs text-muted-foreground">
            The API doesn&apos;t yet expose a way to list all configured tiers, so
            only ones you create or edit here appear below. Reloading clears this
            list — it doesn&apos;t touch the saved data.
          </p>
        </CardHeader>
        <CardContent>
          {sessionRules.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing changed yet"
              description="Tiers you save above will show up here so you can review or delete them."
            />
          ) : (
            <ul className="space-y-2">
              {sessionRules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-black/10 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{rule.title}</span>
                      <Badge variant={rule.isActive ? "success" : "muted"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      #{rule.rebirthNumber} · {rule.requiredXp.toLocaleString()} XP
                      required
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${rule.title}`}
                    onClick={() => handleDeleteRule(rule)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
