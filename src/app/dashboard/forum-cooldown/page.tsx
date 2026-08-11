"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { ForumCooldownCard } from "@/features/forum-cooldown/forum-cooldown-card";

export default function ForumCooldownPage() {
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

  if (!mounted) return null;

  return (
    <AdminShell
      title="Forum Cooldown"
      description="Rate-limit how often members can publish posts."
    >
      <ForumCooldownCard />
    </AdminShell>
  );
}
