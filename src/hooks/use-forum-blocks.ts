"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchForumBlocks } from "@/lib/api-services";
import type { ForumBlock, PaginatedResponse } from "@/types/api-types";

interface UseForumBlocksOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useForumBlocks(initialParams: UseForumBlocksOptions = {}) {
  const [data, setData] = useState<ForumBlock[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseForumBlocksOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchForumBlocks(params)
      .then((res: PaginatedResponse<ForumBlock>) => {
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
    blocks: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    refetch: load,
  };
}
