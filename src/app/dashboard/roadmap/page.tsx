"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useRoadmaps } from "@/hooks/use-roadmaps";
import { RoadmapsTable } from "@/features/roadmap/roadmaps-table";

export default function RoadmapPage() {
  const ready = useRequireAuth();
  const roadmapsHook = useRoadmaps({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Roadmaps"
      description="Build learning paths. Click a roadmap to edit it and manage its steps."
    >
      <RoadmapsTable
        roadmaps={roadmapsHook.roadmaps}
        loading={roadmapsHook.loading}
        error={roadmapsHook.error}
        meta={roadmapsHook.meta}
        onSearch={roadmapsHook.setSearchQuery}
        onPageChange={roadmapsHook.setPage}
        onCreate={roadmapsHook.addRoadmap}
      />
    </AdminShell>
  );
}
