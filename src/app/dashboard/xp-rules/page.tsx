"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { XpRulesCard } from "@/features/xp-rules/xp-rules-card";

export default function XpRulesPage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <AdminShell
      title="XP Rules"
      description="Tune the XP granted for signup and referrals."
    >
      <XpRulesCard />
    </AdminShell>
  );
}
