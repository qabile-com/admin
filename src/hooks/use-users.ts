"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchUsers,
  createUser,
  banUser,
  deleteUser,
} from "@/lib/api-services";
import type { AdminUser, PaginatedResponse } from "@/types/api-types";

interface UseUsersOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

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

  const toggleBan = async (
    userId: string,
    isBanned: boolean,
    reason?: string,
  ) => {
    await banUser(userId, { isBanned, reason });
    load();
  };

  const removeUser = async (userId: string) => {
    await deleteUser(userId);
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
    toggleBan,
    removeUser,
    refetch: load,
  };
}
