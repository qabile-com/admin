"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementsTable } from "@/features/achievements/achievements-table";

export default function AchievementsPage() {
  const ready = useRequireAuth();
  const achHook = useAchievements({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Achievements"
      description="Define badges and the triggers that award them."
    >
      <AchievementsTable
        achievements={achHook.achievements}
        loading={achHook.loading}
        error={achHook.error}
        meta={achHook.meta}
        onSearch={achHook.setSearchQuery}
        onPageChange={achHook.setPage}
        onCreate={achHook.addAchievement}
        onUpdate={achHook.editAchievement}
        onDelete={achHook.removeAchievement}
      />
    </AdminShell>
  );
}
