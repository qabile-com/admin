"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { SendNotificationCard } from "@/features/notifications/send-notification-card";

export default function NotificationsPage() {
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
      title="Notifications"
      description="Compose and send a push notification to members."
    >
      <SendNotificationCard />
    </AdminShell>
  );
}
