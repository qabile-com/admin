"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchUsers, createUser, type ListParams } from "@/lib/api-services";
import { rememberEntities } from "@/lib/entity-cache";
import type { AdminUser, PaginatedResponse } from "@/types/api-types";

type UseUsersOptions = ListParams;

/**
 * Backs the Users list page: browse, search, create. Per-user actions
 * (ban/verify/XP/award/delete) live on /dashboard/users/[id] now and call
 * the api-services functions directly — there's no "refresh this list"
 * concern to route through a hook once you're on that page.
 */
export function useUsers(initialParams: UseUsersOptions = {}) {
  const [data, setData] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseUsersOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    // setLoading(true);
    cancelledRef.current = false;
    fetchUsers(params)
      .then((response: PaginatedResponse<AdminUser>) => {
        if (!cancelledRef.current) {
          setData(response.data);
          setMeta(response.meta);
          setError(null);
          rememberEntities("users", response.data);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      })
      .finally(() => {
        if (!cancelledRef.current) {
          setLoading(false);
        }
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

  const addUser = async (userData: Parameters<typeof createUser>[0]) => {
    await createUser(userData);
    load();
  };

  return {
    users: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addUser,
    refetch: load,
  };
}
