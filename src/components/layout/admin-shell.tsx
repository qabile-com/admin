"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Flame,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  Award,
  Map,
  MessageSquare,
  // Activity,
  Zap,
  Menu,
  X,
  Timer,
  UsersRound,
  // BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, humanize, userLabel } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  activeKey: string;
};

/** Primary, day-to-day screens. */
const navItems: NavItem[] = [
  { href: "/dashboard/users", label: "Users", icon: Users, activeKey: "users" },
  {
    href: "/dashboard/bd-users",
    label: "BD Users",
    icon: UsersRound,
    activeKey: "bd-users",
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: BookOpen,
    activeKey: "courses",
  },
  // {
  //   href: "/dashboard/notifications",
  //   label: "Notifications",
  //   icon: BellRing,
  //   activeKey: "notifications",
  // },
  {
    href: "/dashboard/forum-cooldown",
    label: "Forum Cooldown",
    icon: Timer,
    activeKey: "forum-cooldown",
  },
];

/**
 * Screens backed by admin endpoints that exist but aren't part of the daily
 * workflow. Grouped separately so the primary nav stays short.
 */
const secondaryNavItems: NavItem[] = [
  {
    href: "/dashboard/roadmap",
    label: "Roadmaps",
    icon: Map,
    activeKey: "roadmap",
  },
  {
    href: "/dashboard/achievements",
    label: "Achievements",
    icon: Award,
    activeKey: "achievements",
  },
  {
    href: "/dashboard/xp-rules",
    label: "XP Rules",
    icon: Zap,
    activeKey: "xp-rules",
  },
  {
    href: "/dashboard/forum",
    label: "Forum",
    icon: MessageSquare,
    activeKey: "forum",
  },
  {
    href: "/dashboard/admins",
    label: "Admins",
    icon: ShieldCheck,
    activeKey: "admins",
  },
  // {
  //   href: "/dashboard/activities",
  //   label: "Activities",
  //   icon: Activity,
  //   activeKey: "activities",
  // },
];

const allNavItems = [...navItems, ...secondaryNavItems];

const navLinkClass =
  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

export function AdminShell({
  children,
  title,
  description,
  actions,
}: {
  children: React.ReactNode;
  /** Page heading. Falls back to the generic workspace headline. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Optional buttons rendered beside the page heading. */
  actions?: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeKey =
    allNavItems.find((item) => pathname.startsWith(item.href))?.activeKey || "";

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <div className="min-h-dvh">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-black/20 p-4 backdrop-blur-xl lg:flex lg:flex-col overflow-y-auto">
        <div className="flex h-full flex-col">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-2 py-3"
          >
            <Image
              src="/assets/phoenix_badge.webp"
              alt="Qabile phoenix badge"
              width={44}
              height={44}
              className="rounded-lg"
              priority
            />
            <div>
              <p className="text-sm font-extrabold">Qabile Admin</p>
              <p className="text-xs text-muted-foreground">
                Phoenix operations
              </p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                navLinkClass,
                pathname === "/dashboard" && "bg-secondary text-foreground",
              )}
            >
              <LayoutDashboard className="size-4" />
              Overview
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  navLinkClass,
                  activeKey === item.activeKey &&
                    "bg-secondary text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}

            <p className="px-3 pb-1 pt-5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Configuration
            </p>
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  navLinkClass,
                  activeKey === item.activeKey &&
                    "bg-secondary text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {user && (
            <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-black/20 p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-xs font-black text-orange-100">
                {userLabel(user, "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{userLabel(user)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {humanize(user.role)}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-out menu */}
          <div className="absolute inset-y-0 left-0 w-72 bg-card border-r p-4 flex flex-col overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <Image
                  src="/assets/phoenix_badge.webp"
                  alt="Qabile phoenix badge"
                  width={38}
                  height={38}
                  className="rounded-lg"
                />
                <span className="text-sm font-extrabold">Qabile Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick("/dashboard")}
                className={cn(
                  navLinkClass,
                  "w-full",
                  pathname === "/dashboard" && "bg-secondary text-foreground",
                )}
              >
                <LayoutDashboard className="size-4" />
                Overview
              </button>
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    navLinkClass,
                    "w-full",
                    activeKey === item.activeKey &&
                      "bg-secondary text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}

              <p className="px-3 pb-1 pt-5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                Configuration
              </p>
              {secondaryNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    navLinkClass,
                    "w-full",
                    activeKey === item.activeKey &&
                      "bg-secondary text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b bg-background/72 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Hamburger button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/phoenix_badge.webp"
                  alt="Qabile phoenix badge"
                  width={38}
                  height={38}
                  className="rounded-lg hidden lg:block"
                />
                <span className="text-sm font-extrabold lg:hidden">
                  Qabile Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold leading-tight">
                    {userLabel(user)}
                  </p>
                  <p className="text-xs leading-tight text-muted-foreground">
                    {humanize(user.role)}
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-bold text-orange-100">
                <Flame className="size-3.5" />
                Admin workspace
              </div>
              <h1 className="text-2xl font-black tracking-normal sm:text-3xl">
                {title ?? (
                  <>
                    Manage the <span className="fire-text">Qabile</span> tribe
                  </>
                )}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {description ??
                  "Review members, course inventory, publishing status, and operational health from one clean panel."}
              </p>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
