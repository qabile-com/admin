"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, UserPlus, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useXpRules } from "@/hooks/use-xp-rules";
import { cn } from "@/lib/utils";
import type { XpRuleKind } from "@/types/api-types";

/** Renders both XP reward rules the API exposes. */
export function XpRulesCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <XpRuleCard
        kind="signup"
        icon={UserPlus}
        heading="Signup reward"
        blurb="XP granted when a new member completes signup"
        effect={(amount) => `New members receive ${amount} XP on signup.`}
      />
      <XpRuleCard
        kind="referral"
        icon={Users}
        heading="Referral reward"
        blurb="XP granted when a referral code is redeemed"
        effect={(amount) =>
          `Referrers receive ${amount} XP per successful invite.`
        }
      />
    </div>
  );
}

function XpRuleCard({
  kind,
  icon: Icon,
  heading,
  blurb,
  effect,
}: {
  kind: XpRuleKind;
  icon: typeof Zap;
  heading: string;
  blurb: string;
  effect: (amount: number) => string;
}) {
  const { rule, loading, error, refetch, updateRule } = useXpRules(kind);
  const confirm = useConfirm();
  const [amount, setAmount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setAmount(rule.amount);
      setIsActive(rule.isActive);
    }
  }, [rule]);

  const hasChanges =
    !!rule && (amount !== rule.amount || isActive !== rule.isActive);

  const handleDiscard = () => {
    if (!rule) return;
    setAmount(rule.amount);
    setIsActive(rule.isActive);
  };

  const requestSave = () => {
    if (!rule) return;

    let description: React.ReactNode;
    if (rule.isActive !== isActive) {
      description = isActive ? (
        <>
          Turn the {heading.toLowerCase()} <strong className="text-foreground">on</strong>{" "}
          at {amount} XP?
        </>
      ) : (
        <>
          Turn the {heading.toLowerCase()}{" "}
          <strong className="text-foreground">off</strong>? No XP will be
          granted until it&apos;s re-enabled.
        </>
      );
    } else {
      description = (
        <>
          Change the {heading.toLowerCase()} from{" "}
          <strong className="text-foreground">{rule.amount} XP</strong> to{" "}
          <strong className="text-foreground">{amount} XP</strong>? This
          applies to every future event immediately.
        </>
      );
    }

    confirm({
      title: `Update ${heading.toLowerCase()}`,
      description,
      variant: "warning",
      confirmLabel: "Save changes",
      onConfirm: async () => {
        await updateRule({ isActive, amount });
        setSavedAt(new Date().toLocaleTimeString());
      },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded-md bg-[var(--glass-2)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-11 animate-pulse rounded-lg bg-[var(--glass-2)]" />
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
            <p className="text-sm font-bold">Couldn&apos;t load {heading}</p>
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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle>{heading}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>
            </div>
          </div>
          <Badge variant={isActive ? "success" : "muted"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <div
          className={cn(
            "rounded-xl border p-4 text-sm",
            isActive
              ? "border-orange-300/25 bg-orange-400/[0.07]"
              : "border-border bg-black/10 text-muted-foreground",
          )}
        >
          {isActive ? effect(amount) : "This reward is off — no XP is granted."}
          {hasChanges && (
            <span className="ml-2 text-xs font-bold text-accent">
              · unsaved
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-black/10 p-4">
          <div>
            <p className="text-sm font-bold">Enable reward</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Rule code: <span className="font-mono">{rule.code}</span>
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            aria-label={`Enable ${heading}`}
          />
        </div>

        <div
          className={cn(
            "space-y-2 transition-opacity",
            !isActive && "pointer-events-none opacity-50",
          )}
        >
          <label className="text-sm font-bold" htmlFor={`xp-amount-${kind}`}>
            XP amount
          </label>
          <div className="relative max-w-xs">
            <Input
              id={`xp-amount-${kind}`}
              type="number"
              min={0}
              value={amount}
              disabled={!isActive}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
              XP
            </span>
          </div>
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
