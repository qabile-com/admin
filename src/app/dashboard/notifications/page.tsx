"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SendNotificationCard } from "@/features/notifications/send-notification-card";
import { NotificationRulesCard } from "@/features/notifications/notification-rules-card";

export default function NotificationsPage() {
  const ready = useRequireAuth();

  if (!ready) return null;

  return (
    <AdminShell
      title="Notifications"
      description="Compose and send a push notification to members."
    >
      <div className="space-y-4">
        <SendNotificationCard />
        <NotificationRulesCard />
      </div>
    </AdminShell>
  );
}
