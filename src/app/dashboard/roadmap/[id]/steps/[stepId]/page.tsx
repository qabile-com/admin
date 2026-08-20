"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { StepDetail } from "@/features/roadmap/step-detail";

export default function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = use(params);
  const ready = useRequireAuth();
  const searchParams = useSearchParams();
  const defaultNum = Number(searchParams.get("num")) || 1;

  if (!ready) return null;

  return (
    <StepDetail
      key={`${id}:${stepId}`}
      roadmapId={id}
      stepId={stepId}
      defaultNum={defaultNum}
    />
  );
}
