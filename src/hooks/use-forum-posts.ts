"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchForumPosts, pinForumPost, deleteForumPost } from "@/lib/api-services";
import { rememberEntities } from "@/lib/entity-cache";
import type { ForumPost, PaginatedResponse } from "@/types/api-types";

interface UseForumOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

/**
 * Backs the Forum posts list: browse, search, pin, delete. Comment
 * moderation and likes both live on /dashboard/forum/[postId] now, which
 * calls deleteForumComment directly — comments never render on the list.
 */
export function useForumPosts(initialParams: UseForumOptions = {}) {
  const [data, setData] = useState<ForumPost[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseForumOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    fetchForumPosts(params)
      .then((res: PaginatedResponse<ForumPost>) => {
        if (!cancelledRef.current) {
          setData(res.data);
          setMeta(res.meta);
          setError(null);
          rememberEntities("forum-posts", res.data);
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

  const togglePin = async (postId: string, isPinned: boolean) => {
    await pinForumPost(postId, isPinned);
    load();
  };

  const removePost = async (postId: string) => {
    await deleteForumPost(postId);
    load();
  };

  return {
    posts: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    togglePin,
    removePost,
    refetch: load,
  };
}
