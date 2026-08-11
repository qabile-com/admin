"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  type ListParams,
  type RoadmapInput,
} from "@/lib/api-services";
import type { Roadmap, PaginatedResponse } from "@/types/api-types";

export function useRoadmaps(initialParams: ListParams = {}) {
  const [data, setData] = useState<Roadmap[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ListParams>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchRoadmaps(params)
      .then((response: PaginatedResponse<Roadmap>) => {
        if (cancelledRef.current) return;
        setData(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (cancelledRef.current) return;
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

  const addRoadmap = async (input: RoadmapInput) => {
    await createRoadmap(input);
    load();
  };

  const editRoadmap = async (id: string, input: Partial<RoadmapInput>) => {
    await updateRoadmap(id, input);
    load();
  };

  const removeRoadmap = async (id: string) => {
    await deleteRoadmap(id);
    load();
  };

  return {
    roadmaps: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addRoadmap,
    editRoadmap,
    removeRoadmap,
    refetch: load,
  };
}
