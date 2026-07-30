"use client";

import { useEffect, useState } from "react";
import { fetchSignupXpRule, updateSignupXpRule } from "@/lib/api-services";
import type { XpRule } from "@/types/api-types";

export function useXpRules() {
  const [data, setData] = useState<XpRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
    setLoading(true);
    fetchSignupXpRule()
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

  const updateRule = async (newData: { isActive: boolean; amount: number }) => {
    const updated = await updateSignupXpRule(newData);
    setData(updated);
    return updated;
  };

  return { rule: data, loading, error, refetch: load, updateRule };
}
