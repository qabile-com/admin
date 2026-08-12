"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCourses } from "@/hooks/use-courses";
import { CoursesTable } from "@/features/courses/courses-table";

export default function CoursesPage() {
  const ready = useRequireAuth();
  const coursesHook = useCourses({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Courses"
      description="Publish courses. Click a row to manage its episodes and comments."
    >
      <CoursesTable
        courses={coursesHook.courses}
        loading={coursesHook.loading}
        error={coursesHook.error}
        meta={coursesHook.meta}
        onSearch={coursesHook.setSearchQuery}
        onPageChange={coursesHook.setPage}
        onCreate={coursesHook.addCourse}
        onReorder={coursesHook.reorder}
      />
    </AdminShell>
  );
}
