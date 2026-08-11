"use client";

import { useState, useEffect } from "react";
import { Loader2, RotateCcw, Save, TimerOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useForumCooldown } from "@/hooks/use-forum-cooldown";
import { cn, formatDuration, getErrorMessage } from "@/lib/utils";

/** Quick-pick windows, in seconds. */
const PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "5m", seconds: 300 },
  { label: "1h", seconds: 3600 },
  { label: "6h", seconds: 21600 },
  { label: "12h", seconds: 43200 },
  { label: "24h", seconds: 86400 },
];

export function ForumCooldownCard() {
  const { rule, loading, error, refetch, updateRule } = useForumCooldown();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setSeconds(rule.seconds);
      setIsActive(rule.isActive);
    }
  }, [rule]);

  const hasChanges =
    !!rule && (seconds !== rule.seconds || isActive !== rule.isActive);

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await updateRule({ isActive, seconds });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!rule) return;
    setSeconds(rule.seconds);
    setIsActive(rule.isActive);
    setSaveError("");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded-md bg-[var(--glass-2)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-11 animate-pulse rounded-lg bg-[var(--glass-2)]" />
          <div className="h-9 w-2/3 animate-pulse rounded-lg bg-[var(--glass-2)]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-red-400/10">
            <TriangleAlert className="size-5 text-red-300" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">Couldn&apos;t load the cooldown</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={refetch}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!rule) return null;

  const effectSentence = isActive
    ? seconds > 0
      ? `Users can publish one post every ${formatDuration(seconds)}.`
      : "Cooldown is on, but the window is 0 — users can post freely."
    : "No cooldown. Users can post as often as they like.";

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
              <TimerOff className="size-5" />
            </div>
            <div>
              <CardTitle>Forum post cooldown</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rate-limit how often members can publish
              </p>
            </div>
          </div>
          <Badge variant={isActive ? "success" : "muted"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Live effect summary */}
        <div
          className={cn(
            "rounded-xl border p-4 text-sm",
            isActive
              ? "border-orange-300/25 bg-orange-400/[0.07]"
              : "border-border bg-black/10 text-muted-foreground",
          )}
        >
          {effectSentence}
          {hasChanges && (
            <span className="ml-2 text-xs font-bold text-accent">
              · unsaved
            </span>
          )}
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-black/10 p-4">
          <div>
            <p className="text-sm font-bold">Enable cooldown</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Block new posts until the window elapses
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            aria-label="Enable cooldown"
          />
        </div>

        {/* Duration */}
        <div
          className={cn(
            "space-y-3 transition-opacity",
            !isActive && "pointer-events-none opacity-50",
          )}
        >
          <label className="text-sm font-bold" htmlFor="cooldown-seconds">
            Cooldown window
          </label>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                type="button"
                disabled={!isActive}
                onClick={() => setSeconds(preset.seconds)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                  seconds === preset.seconds
                    ? "border-orange-300/40 bg-orange-400/15 text-orange-100"
                    : "border-border bg-black/20 text-muted-foreground hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <Input
              id="cooldown-seconds"
              type="number"
              min={0}
              value={seconds}
              disabled={!isActive}
              onChange={(e) => setSeconds(Math.max(0, Number(e.target.value)))}
              className="pr-20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
              seconds
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Stored in seconds — {formatDuration(seconds)}
          </p>
        </div>

        {saveError && (
          <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {saveError}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">
        {savedAt && !hasChanges && (
          <span className="mr-auto text-xs text-muted-foreground">
            Saved at {savedAt}
          </span>
        )}
        <Button
          variant="secondary"
          onClick={handleDiscard}
          disabled={!hasChanges || saving}
        >
          <RotateCcw className="size-4" />
          Discard
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
