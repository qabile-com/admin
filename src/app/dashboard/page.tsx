"use client";

import Link from "next/link";
import {
  // Activity as ActivityIcon,
  Ban,
  BookOpen,
  Map as MapIcon,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useOverview } from "@/hooks/use-overview";
import { humanize, userLabel } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const ready = useRequireAuth();
  const { data: overview, loading } = useOverview();

  if (!ready) return null;

  const statCards = [
    {
      label: "Total users",
      value: overview?.usersCount,
      icon: Users,
      href: "/dashboard/users",
    },
    {
      label: "Banned users",
      value: overview?.bannedUsersCount,
      icon: Ban,
      href: "/dashboard/users",
    },
    {
      label: "Admins",
      value: overview?.adminsCount,
      icon: ShieldCheck,
      href: "/dashboard/admins",
    },
    {
      label: "Courses",
      value: overview?.coursesCount,
      icon: BookOpen,
      href: "/dashboard/courses",
    },
    {
      label: "Roadmap steps",
      value: overview?.roadmapStepsCount,
      icon: MapIcon,
      href: "/dashboard/roadmap",
    },
    {
      label: "Forum posts",
      value: overview?.forumPostsCount,
      icon: MessageSquare,
      href: "/dashboard/forum",
    },
    {
      label: "Forum comments",
      value: overview?.forumCommentsCount,
      icon: MessageCircle,
      href: "/dashboard/forum",
    },
    // {
    //   label: "Recent activity",
    //   value: overview?.recentActivities?.length,
    //   icon: ActivityIcon,
    //   href: "/dashboard/activities",
    // },
  ];

  return (
    <AdminShell
      title={
        <>
          Manage the <span className="fire-text">Qabile</span> tribe
        </>
      }
      description="Members, course inventory, and operational health at a glance."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="h-full transition-colors group-hover:border-orange-300/30">
              <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {loading ? (
                    <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-[var(--glass-2)]" />
                  ) : (
                    <p className="mt-2 text-3xl font-black">
                      {(stat.value ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
                  <stat.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid gap-4">
        {/* Recent activity — hidden along with the Activities section.
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Link
              href="/dashboard/activities"
              className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-[var(--glass-2)]"
                  />
                ))}
              </div>
            ) : !overview?.recentActivities?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {overview.recentActivities.slice(0, 8).map((activity) => (
                  <li
                    key={activity.id}
                    className="rounded-lg border border-border bg-black/10 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="muted">
                        {humanize(activity.actionType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm">{activity.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        */}

        {/* Admin roster */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Admins</CardTitle>
            <Link
              href="/dashboard/admins"
              className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-[var(--glass-2)]"
                  />
                ))}
              </div>
            ) : !overview?.admins?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No admins found.
              </p>
            ) : (
              <ul className="space-y-1">
                {overview.admins.map((admin) => (
                  <li key={admin.id}>
                    <Link
                      href={`/dashboard/users/${admin.id}`}
                      className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-xs font-black text-orange-100">
                        {userLabel(admin, "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {userLabel(admin)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {admin.email || admin.phone || "—"}
                        </p>
                      </div>
                      <Badge variant="muted">{humanize(admin.role)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
