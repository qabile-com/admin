"use client";

import { use } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { RoadmapDetail } from "@/features/roadmap/roadmap-detail";

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ready = useRequireAuth();

  if (!ready) return null;

  return <RoadmapDetail key={id} id={id} />;
}
