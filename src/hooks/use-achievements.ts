"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "@/lib/api-services";
import type { Achievement, PaginatedResponse } from "@/types/api-types";

interface UseAchievementsOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useAchievements(initialParams: UseAchievementsOptions = {}) {
  const [data, setData] = useState<Achievement[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseAchievementsOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchAchievements(params)
      .then((res: PaginatedResponse<Achievement>) => {
        if (!cancelledRef.current) {
          setData(res.data);
          setMeta(res.meta);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
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

  const addAchievement = async (
    data: Parameters<typeof createAchievement>[0],
  ) => {
    await createAchievement(data);
    load();
  };

  const editAchievement = async (
    id: string,
    data: Parameters<typeof updateAchievement>[1],
  ) => {
    await updateAchievement(id, data);
    load();
  };

  const removeAchievement = async (id: string) => {
    await deleteAchievement(id);
    load();
  };

  return {
    achievements: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addAchievement,
    editAchievement,
    removeAchievement,
    refetch: load,
  };
}
