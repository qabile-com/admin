"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchXpRule, updateXpRule } from "@/lib/api-services";
import type { XpRule, XpRuleKind } from "@/types/api-types";

/**
 * One hook per rule kind — the signup and referral endpoints share a shape.
 * `useXpRules("signup")` / `useXpRules("referral")`
 */
export function useXpRules(kind: XpRuleKind = "signup") {
  const [data, setData] = useState<XpRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchXpRule(kind)
      .then((rule) => {
        setData(rule);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => setLoading(false));
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRule = async (newData: { isActive: boolean; amount: number }) => {
    const updated = await updateXpRule(kind, newData);
    setData(updated);
    return updated;
  };

  return { rule: data, loading, error, refetch: load, updateRule };
}
