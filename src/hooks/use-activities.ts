"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchActivities } from "@/lib/api-services";
import type { Activity, PaginatedResponse } from "@/types/api-types";

interface UseActivitiesOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useActivities(initialParams: UseActivitiesOptions = {}) {
  const [data, setData] = useState<Activity[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseActivitiesOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchActivities(params)
      .then((res: PaginatedResponse<Activity>) => {
        if (!cancelledRef.current) {
          setData(res.data);
          setMeta(res.meta);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current)
          setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
  }, [params]);

  useEffect(() => {
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  const setSearchQuery = (q: string) =>
    setParams((prev) => ({ ...prev, q, offset: 0 }));
  const setPage = (page: number) =>
    setParams((prev) => ({ ...prev, offset: (page - 1) * (prev.limit || 10) }));

  return {
    activities: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    refetch: load,
  };
}
