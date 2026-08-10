"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForumCooldown } from "@/hooks/use-forum-cooldown";

export function ForumCooldownCard() {
  const { rule, loading, error, updateRule } = useForumCooldown();
  const [hours, setHours] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (rule) {
      setHours(rule.hours);
      setIsActive(rule.isActive);
    }
  }, [rule]);

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await updateRule({ isActive, hours });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6 text-muted-foreground">Loading forum cooldown rule...</div>;
  if (error) return <div className="p-6 text-red-300">{error.message}</div>;
  if (!rule) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Post Cooldown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">Status:</span>
            <Badge variant={isActive ? "success" : "muted"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-bold">Active</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="ml-2 h-5 w-5"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Cooldown (hours)</span>
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              min={0}
            />
          </label>
          {saveError && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {saveError}
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="animate-spin size-4 mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
