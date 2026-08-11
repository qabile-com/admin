"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementsTable } from "@/features/achievements/achievements-table";

export default function AchievementsPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/");
    }
  }, [mounted, accessToken, router]);

  const achHook = useAchievements({ limit: 10, offset: 0 });

  if (!mounted) return null;

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
