"use client";

import { useEffect, useState } from "react";
import { fetchForumPostCooldownRule, updateForumPostCooldownRule } from "@/lib/api-services";
import type { ForumPostCooldownRule } from "@/types/api-types";

export function useForumCooldown() {
  const [data, setData] = useState<ForumPostCooldownRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const updateRule = async (newData: { isActive: boolean; hours: number }) => {
    const updated = await updateForumPostCooldownRule(newData);
    setData(updated);
    return updated;
  };

  return { rule: data, loading, error, refetch: load, updateRule };
}
