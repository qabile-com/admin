"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchForumPostCooldownRule,
  updateForumPostCooldownRule,
} from "@/lib/api-services";
import type { ForumPostCooldownRule } from "@/types/api-types";

/** The API stores the cooldown window in SECONDS. */
export function useForumCooldown() {
  const [data, setData] = useState<ForumPostCooldownRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchForumPostCooldownRule()
      .then((rule) => {
        setData(rule);
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

  const updateRule = async (newData: {
    isActive: boolean;
    seconds: number;
  }) => {
    const updated = await updateForumPostCooldownRule(newData);
    setData(updated);
    return updated;
  };

  return { rule: data, loading, error, refetch: load, updateRule };
}
