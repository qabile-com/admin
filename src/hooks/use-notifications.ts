"use client";

import { useState } from "react";
import {
  sendNotification,
  type SendNotificationInput,
} from "@/lib/api-services";
import type { NotificationDispatchResult } from "@/types/api-types";

/**
 * POST /api/v1/admin/notifications/send
 * Keeps the last dispatch result so the UI can report delivery counts.
 */
export function useNotifications() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<NotificationDispatchResult | null>(null);

  const send = async (payload: SendNotificationInput) => {
    setSending(true);
    setError(null);
    try {
      const response = await sendNotification(payload);
      setResult(response.data);
      return response.data;
    } catch (err) {
      const normalized =
        err instanceof Error ? err : new Error("Failed to send notification");
      setError(normalized);
      throw normalized;
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { send, sending, error, result, reset };
}
