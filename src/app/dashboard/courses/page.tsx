"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";
import { CoursesTable } from "@/features/courses/courses-table";

export default function CoursesPage() {
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

  const coursesHook = useCourses({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell>
      <CoursesTable
        courses={coursesHook.courses}
        loading={coursesHook.loading}
        error={coursesHook.error}
        meta={coursesHook.meta}
        onSearch={coursesHook.setSearchQuery}
        onPageChange={coursesHook.setPage}
        onCreate={coursesHook.addCourse}
        onDelete={coursesHook.removeCourse}
        onUpdate={coursesHook.editCourse}
        onReorder={coursesHook.reorder}
      />
    </AdminShell>
  );
}
