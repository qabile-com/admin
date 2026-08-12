"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SendNotificationCard } from "@/features/notifications/send-notification-card";

export default function NotificationsPage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <AdminShell
      title="Notifications"
      description="Compose and send a push notification to members."
    >
      <SendNotificationCard />
    </AdminShell>
  );
}
