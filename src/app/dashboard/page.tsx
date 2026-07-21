"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Flame, TrendingUp, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useOverview } from "@/hooks/use-overview";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { UsersTable } from "@/features/users/users-table";
import { CoursesTable } from "@/features/courses/courses-table";

export function DashboardContent() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);

  // Derive the active tab directly from the URL query string
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "courses" ? "courses" : "users";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/");
    }
  }, [mounted, accessToken, router]);

  const { data: overview, loading: overviewLoading } = useOverview();
  const usersHook = useUsers({ limit: 10, offset: 0 });
  const coursesHook = useCourses({ limit: 10, offset: 0 });

  // Change tab by updating the URL (this is used by the in‑page tab buttons)
  const switchTab = (tab: "users" | "courses") => {
    router.replace(`/dashboard?tab=${tab}`);
  };

  if (!mounted) return null;

  const statCards = [
    { label: "Total users", value: overview?.usersCount ?? "...", icon: Users },
    { label: "Admins", value: overview?.adminsCount ?? "...", icon: Flame },
    {
      label: "Courses",
      value: overview?.coursesCount ?? "...",
      icon: BookOpen,
    },
    {
      label: "Forum posts",
      value: overview?.forumPostsCount ?? "...",
      icon: TrendingUp,
    },
  ];

  return (
    <AdminShell activeTab={activeTab}>
      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-black">
                  {overviewLoading ? "..." : stat.value}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
                <stat.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Tab switcher */}
      <section className="mt-6">
        <TabsList>
          <TabsTrigger
            active={activeTab === "users"}
            onClick={() => switchTab("users")}
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            active={activeTab === "courses"}
            onClick={() => switchTab("courses")}
          >
            Courses
          </TabsTrigger>
        </TabsList>
      </section>

      <section className="mt-4">
        {activeTab === "users" ? (
          <UsersTable
            users={usersHook.users}
            loading={usersHook.loading}
            error={usersHook.error}
            meta={usersHook.meta}
            onSearch={usersHook.setSearchQuery}
            onPageChange={usersHook.setPage}
            onBan={usersHook.toggleBan}
            onDelete={usersHook.removeUser}
            onCreate={usersHook.addUser}
          />
        ) : (
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
        )}
      </section>
    </AdminShell>
  );
}
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground">Loading dashboard...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
