"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useRoadmapSteps } from "@/hooks/use-roadmap-steps";
import { RoadmapTable } from "@/features/roadmap/roadmap-table";

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

  const roadmapHook = useRoadmapSteps({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell>
      <RoadmapTable
        steps={roadmapHook.steps}
        loading={roadmapHook.loading}
        error={roadmapHook.error}
        meta={roadmapHook.meta}
        onSearch={roadmapHook.setSearchQuery}
        onPageChange={roadmapHook.setPage}
        onCreate={roadmapHook.addStep}
        onUpdate={roadmapHook.editStep}
      />
    </AdminShell>
  );
}
