"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteRebirthRule,
  fetchRebirthRulesSummary,
  upsertRebirthRule,
} from "@/lib/api-services";
import type { RebirthMaxSummary, RebirthRule, UpsertRebirthRuleInput } from "@/types/api-types";

/**
 * GET /admin/rebirth-rules only returns the derived maximum-allowed-rebirth count — the
 * API has no endpoint that lists individually configured tiers. `sessionRules` is therefore
 * NOT a cache of server truth: it only holds tiers this hook has itself created, updated, or
 * seen deleted since the page was opened, so they can be reviewed/edited/removed in the same
 * visit. It intentionally does not persist across reloads.
 */
export function useRebirthRules() {
  const [maxSummary, setMaxSummary] = useState<RebirthMaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionRules, setSessionRules] = useState<RebirthRule[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    fetchRebirthRulesSummary()
      .then((summary) => {
        setMaxSummary(summary);
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

  const upsertRule = async (input: UpsertRebirthRuleInput) => {
    const rule = await upsertRebirthRule(input);
    setSessionRules((prev) => [
      rule,
      ...prev.filter((r) => r.rebirthNumber !== rule.rebirthNumber),
    ]);
    load();
    return rule;
  };

  const removeRule = async (id: string) => {
    await deleteRebirthRule(id);
    setSessionRules((prev) => prev.filter((r) => r.id !== id));
    load();
  };

  return {
    maxSummary,
    loading,
    error,
    refetch: load,
    sessionRules,
    upsertRule,
    removeRule,
  };
}
