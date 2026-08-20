"use client";

import { useEffect, useState } from "react";
import { Gauge, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useNotificationRules } from "@/hooks/use-notification-rules";

/**
 * Controls how often medium/weak-priority pushes are actually delivered — the API returns
 * only the raw field names (no copy of its own), so the framing here ("1 in every N is
 * delivered") is our best honest description of a throttling rule, not API-provided text.
 */
export function NotificationRulesCard() {
  const { rule, loading, error, refetch, updateRule } = useNotificationRules();
  const confirm = useConfirm();
  const [mediumEveryCount, setMediumEveryCount] = useState(0);
  const [weakEveryCount, setWeakEveryCount] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setMediumEveryCount(rule.mediumEveryCount);
      setWeakEveryCount(rule.weakEveryCount);
    }
  }, [rule]);

  const hasChanges =
    !!rule &&
    (mediumEveryCount !== rule.mediumEveryCount ||
      weakEveryCount !== rule.weakEveryCount);

  const handleDiscard = () => {
    if (!rule) return;
    setMediumEveryCount(rule.mediumEveryCount);
    setWeakEveryCount(rule.weakEveryCount);
  };

  const requestSave = () => {
    if (!rule) return;
    confirm({
      title: "Update delivery rules",
      variant: "warning",
      confirmLabel: "Save changes",
      description: (
        <>
          Change delivery throttling to 1 in every{" "}
          <strong className="text-foreground">{mediumEveryCount}</strong> for
          medium priority and 1 in every{" "}
          <strong className="text-foreground">{weakEveryCount}</strong> for weak
          priority? This applies to every push sent from now on.
        </>
      ),
      onConfirm: async () => {
        await updateRule({ mediumEveryCount, weakEveryCount });
        setSavedAt(new Date().toLocaleTimeString());
      },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-11" />
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
            title="Couldn't load delivery rules"
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconCircle tone="brand" size="size-10" className="rounded-lg">
            <Gauge className="size-5" />
          </IconCircle>
          <div>
            <CardTitle>Delivery throttling</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How often lower-priority pushes actually reach a device
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-badge-default-border bg-badge-default-bg p-4 text-sm">
          Roughly 1 in every{" "}
          <strong className="text-foreground">{mediumEveryCount}</strong>{" "}
          medium-priority pushes and 1 in every{" "}
          <strong className="text-foreground">{weakEveryCount}</strong>{" "}
          weak-priority pushes is delivered.
          {hasChanges && (
            <span className="ml-2 text-xs font-bold text-accent">· unsaved</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-bold">Medium priority: every</span>
            <Input
              type="number"
              min={1}
              value={mediumEveryCount}
              onChange={(e) =>
                setMediumEveryCount(Math.max(1, Number(e.target.value)))
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Weak priority: every</span>
            <Input
              type="number"
              min={1}
              value={weakEveryCount}
              onChange={(e) =>
                setWeakEveryCount(Math.max(1, Number(e.target.value)))
              }
            />
          </label>
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
