"use client";

import { useState, useEffect } from "react";
import { TimerOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useForumCooldown } from "@/hooks/use-forum-cooldown";
import { cn, formatDuration } from "@/lib/utils";

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
  const confirm = useConfirm();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setSeconds(rule.seconds);
      setIsActive(rule.isActive);
    }
  }, [rule]);

  const hasChanges =
    !!rule && (seconds !== rule.seconds || isActive !== rule.isActive);

  const handleDiscard = () => {
    if (!rule) return;
    setSeconds(rule.seconds);
    setIsActive(rule.isActive);
  };

  const requestSave = () => {
    if (!rule) return;

    let description: React.ReactNode;
    if (rule.isActive !== isActive) {
      description = isActive ? (
        <>
          Turn the cooldown <strong className="text-foreground">on</strong> at{" "}
          {formatDuration(seconds)}? Members won&apos;t be able to post again
          within that window.
        </>
      ) : (
        <>
          Turn the cooldown <strong className="text-foreground">off</strong>?
          Members will be able to post as often as they like.
        </>
      );
    } else {
      description = (
        <>
          Change the cooldown window from{" "}
          <strong className="text-foreground">
            {formatDuration(rule.seconds)}
          </strong>{" "}
          to{" "}
          <strong className="text-foreground">{formatDuration(seconds)}</strong>
          ? This applies to every member immediately.
        </>
      );
    }

    confirm({
      title: "Update forum cooldown",
      description,
      variant: "warning",
      confirmLabel: "Save changes",
      onConfirm: async () => {
        await updateRule({ isActive, seconds });
        setSavedAt(new Date().toLocaleTimeString());
      },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-11" />
          <Skeleton className="h-9 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={TriangleAlert}
            iconTone="danger"
            title="Couldn't load the cooldown"
            description={error.message}
            action={
              <Button size="sm" variant="secondary" onClick={refetch}>
                Try again
              </Button>
            }
          />
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
            <IconCircle tone="brand" size="size-10" className="rounded-lg">
              <TimerOff className="size-5" />
            </IconCircle>
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
                    ? "border-badge-default-border bg-badge-default-bg text-badge-default-text"
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
      </CardContent>

      <SaveDiscardBar
        hasChanges={hasChanges}
        saving={false}
        savedAt={savedAt}
        onSave={requestSave}
        onDiscard={handleDiscard}
      />
    </Card>
  );
}
