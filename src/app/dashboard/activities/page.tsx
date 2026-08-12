"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useActivities } from "@/hooks/use-activities";
import { ActivitiesTable } from "@/features/activities/activities-table";

export default function ActivitiesPage() {
  const ready = useRequireAuth();
  const activitiesHook = useActivities({ limit: 10, offset: 0 });

  if (!ready) return null;

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
