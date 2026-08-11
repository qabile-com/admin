"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBdUsers,
  assignBdUser,
  removeBdUser,
  fetchInvitedUsers,
} from "@/lib/api-services";
import type { BdUser, InvitedUser, PaginatedResponse } from "@/types/api-types";

interface UseBdUsersOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

interface UseBdUsersReturn {
  users: BdUser[];
  meta: {
    totalItems: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: Error | null;
  setSearchQuery: (q: string) => void;
  setPage: (page: number) => void;
  assignUser: (userId: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  refetch: () => void;
}

export function useBdUsers(
  initialParams: UseBdUsersOptions = {},
): UseBdUsersReturn {
  const [data, setData] = useState<BdUser[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseBdUsersOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchBdUsers(params)
      .then((response: PaginatedResponse<BdUser>) => {
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

  const assignUser = async (userId: string) => {
    await assignBdUser(userId);
    load();
  };

  const removeUser = async (userId: string) => {
    await removeBdUser(userId);
    load();
  };

  return {
    users: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    assignUser,
    removeUser,
    refetch: load,
  };
}

interface UseInvitedUsersOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

interface UseInvitedUsersReturn {
  users: InvitedUser[];
  meta: {
    totalItems: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: Error | null;
  setSearchQuery: (q: string) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useInvitedUsers(
  userId: string,
  initialParams: UseInvitedUsersOptions = {},
): UseInvitedUsersReturn {
  const [data, setData] = useState<InvitedUser[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseInvitedUsersOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    if (!userId) return;
    cancelledRef.current = false;
    setLoading(true);
    fetchInvitedUsers(userId, params)
      .then((response: PaginatedResponse<InvitedUser>) => {
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
  }, [userId, params]);

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
    users: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    refetch: load,
  };
}
