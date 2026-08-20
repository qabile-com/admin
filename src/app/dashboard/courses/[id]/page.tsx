"use client";

import { use } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { CourseDetail } from "@/features/courses/course-detail";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ready = useRequireAuth();

  if (!ready) return null;

  return <CourseDetail key={id} id={id} />;
}
