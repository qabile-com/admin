"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useRoadmaps } from "@/hooks/use-roadmaps";
import { RoadmapsTable } from "@/features/roadmap/roadmaps-table";

export default function RoadmapPage() {
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

  const roadmapsHook = useRoadmaps({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell
      title="Roadmaps"
      description="Build learning paths and manage the steps inside them."
    >
      <RoadmapsTable
        roadmaps={roadmapsHook.roadmaps}
        loading={roadmapsHook.loading}
        error={roadmapsHook.error}
        meta={roadmapsHook.meta}
        onSearch={roadmapsHook.setSearchQuery}
        onPageChange={roadmapsHook.setPage}
        onCreate={roadmapsHook.addRoadmap}
        onUpdate={roadmapsHook.editRoadmap}
        onDelete={roadmapsHook.removeRoadmap}
      />
    </AdminShell>
  );
}
