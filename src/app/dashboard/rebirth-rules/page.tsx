"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { RebirthRulesCard } from "@/features/rebirth-rules/rebirth-rules-card";

export default function RebirthRulesPage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <AdminShell
      title="Rebirth Rules"
      description="Configure the XP required for each prestige tier."
    >
      <RebirthRulesCard />
    </AdminShell>
  );
}
