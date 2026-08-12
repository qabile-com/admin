"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ForumCooldownCard } from "@/features/forum-cooldown/forum-cooldown-card";

export default function ForumCooldownPage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <AdminShell
      title="Forum Cooldown"
      description="Rate-limit how often members can publish posts."
    >
      <ForumCooldownCard />
    </AdminShell>
  );
}
