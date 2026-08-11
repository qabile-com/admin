"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { XpRulesCard } from "@/features/xp-rules/xp-rules-card";

export default function XpRulesPage() {
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
      title="XP Rules"
      description="Tune the XP granted for signup and referrals."
    >
      <XpRulesCard />
    </AdminShell>
  );
}
