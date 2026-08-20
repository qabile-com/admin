"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPushDeliveryRules,
  updatePushDeliveryRules,
} from "@/lib/api-services";
import type { PushDeliveryRules } from "@/types/api-types";

/** Controls how often medium/weak-priority pushes are actually delivered (1-in-N throttling). */
export function useNotificationRules() {
  const [data, setData] = useState<PushDeliveryRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchPushDeliveryRules()
      .then((rules) => {
        setData(rules);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateRule = async (newData: PushDeliveryRules) => {
    const updated = await updatePushDeliveryRules(newData);
    setData(updated);
    return updated;
  };

  return { rule: data, loading, error, refetch: load, updateRule };
}
