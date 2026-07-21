import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Flame,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    href: "/dashboard?tab=users",
    label: "Users",
    icon: Users,
    activeKey: "users",
  },
  {
    href: "/dashboard?tab=courses",
    label: "Courses",
    icon: BookOpen,
    activeKey: "courses",
  },
];

export function AdminShell({
  activeTab,
  children,
}: {
  activeTab: string;
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-black/20 p-4 backdrop-blur-xl lg:block">
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

          <nav className="mt-8 space-y-2">
            <Link
              href="/dashboard"
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LayoutDashboard className="size-4" />
              Overview
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  activeTab === item.activeKey &&
                    "bg-secondary text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border bg-black/20 p-4">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
              <ShieldCheck className="size-5" />
            </div>
            <p className="text-sm font-bold">Endpoint-ready</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Data access is isolated in repositories so the API handoff stays
              tidy.
            </p>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b bg-background/72 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/assets/phoenix_badge.webp"
                alt="Qabile phoenix badge"
                width={38}
                height={38}
                className="rounded-lg"
              />
              <span className="text-sm font-extrabold">Qabile Admin</span>
            </div>
            <div className="hidden max-w-md flex-1 items-center gap-2 lg:flex">
              <Search className="size-4 text-muted-foreground" />
              <Input
                aria-label="Search admin records"
                placeholder="Search users, courses, IDs..."
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout();
                  // Redirect is handled by auth context removal and dashboard protection,
                  // but we can also programmatically redirect:
                  window.location.href = "/";
                }}
              >
                <LogOut />
                Logout
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
                Manage the <span className="fire-text">Qabile</span> tribe
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review members, course inventory, publishing status, and
                operational health from one clean panel.
              </p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
