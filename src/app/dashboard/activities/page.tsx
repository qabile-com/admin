"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { ActivitiesTable } from "@/features/activities/activities-table";

export default function ActivitiesPage() {
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

  const activitiesHook = useActivities({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell
      title="Activities"
      description="Recent admin and system activity."
    >
      <ActivitiesTable
        activities={activitiesHook.activities}
        loading={activitiesHook.loading}
        error={activitiesHook.error}
        meta={activitiesHook.meta}
        onSearch={activitiesHook.setSearchQuery}
        onPageChange={activitiesHook.setPage}
      />
    </AdminShell>
  );
}
