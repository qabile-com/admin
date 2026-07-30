"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createAdmin, removeAdmin } from "@/lib/api-services";
import type {
  AdminEntry,
  PaginatedResponse,
  AdminOverview,
} from "@/types/api-types";
import { fetchOverview } from "@/lib/api-services";

interface UseAdminsOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useAdmins(initialParams: UseAdminsOptions = {}) {
  const [data, setData] = useState<AdminEntry[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseAdminsOptions>(initialParams);
  const cancelledRef = useRef(false);

  // Admins are returned as part of the overview, but there's a dedicated endpoint?
  // Swagger only shows overview returns admins list. There is no separate GET /api/v1/admin/admins.
  // We'll fetch overview and use its admins array. This is not paginated, but we can fake it.
  // Better: we create a separate fetch if available, but overview is what we have.
  // We'll just call fetchOverview and apply search/filter locally for now.
  const load = useCallback(async () => {
    cancelledRef.current = false;
    setLoading(true);
    try {
      const overview: AdminOverview = await fetchOverview();
      if (!cancelledRef.current) {
        let admins = overview.admins;
        // Apply search filter locally
        const q = params.q?.toLowerCase();
        if (q) {
          admins = admins.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.email?.toLowerCase().includes(q) ||
              a.phone?.includes(q),
          );
        }
        // Pagination
        const total = admins.length;
        const limit = params.limit || 10;
        const offset = params.offset || 0;
        const paginated = admins.slice(offset, offset + limit);
        setData(paginated);
        setMeta({
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          limit,
          offset,
        });
        setError(null);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
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

  const addAdmin = async (data: Parameters<typeof createAdmin>[0]) => {
    await createAdmin(data);
    load();
  };

  const removeAdmin = async (userId: string) => {
    await removeAdmin(userId);
    load();
  };

  return {
    admins: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addAdmin,
    removeAdmin,
    refetch: load,
  };
}
