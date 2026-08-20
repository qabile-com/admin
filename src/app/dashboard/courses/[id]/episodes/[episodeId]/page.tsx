"use client";

import { use } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { EpisodeDetail } from "@/features/courses/episode-detail";

export default function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id, episodeId } = use(params);
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <EpisodeDetail
      key={`${id}:${episodeId}`}
      courseId={id}
      episodeId={episodeId}
    />
  );
}
