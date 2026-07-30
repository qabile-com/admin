"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Flame, TrendingUp, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useOverview } from "@/hooks/use-overview";

export default function DashboardOverviewPage() {
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

  const { data: overview, loading: overviewLoading } = useOverview();

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
    <AdminShell>
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
    </AdminShell>
  );
}
