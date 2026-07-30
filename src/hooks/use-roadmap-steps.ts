"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchRoadmapSteps,
  createRoadmapStep,
  updateRoadmapStep,
} from "@/lib/api-services";
import type { RoadmapStep, PaginatedResponse } from "@/types/api-types";

interface UseRoadmapOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useRoadmapSteps(initialParams: UseRoadmapOptions = {}) {
  const [data, setData] = useState<RoadmapStep[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseRoadmapOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchRoadmapSteps(params)
      .then((res: PaginatedResponse<RoadmapStep>) => {
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

  const addStep = async (data: Parameters<typeof createRoadmapStep>[0]) => {
    await createRoadmapStep(data);
    load();
  };

  const editStep = async (
    id: string,
    data: Parameters<typeof updateRoadmapStep>[1],
  ) => {
    await updateRoadmapStep(id, data);
    load();
  };

  return {
    steps: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addStep,
    editStep,
    refetch: load,
  };
}
