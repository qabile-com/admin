"use client";

import { useEffect, useState } from "react";
import { fetchForumPostLikes } from "@/lib/api-services";
import type { ForumLike } from "@/types/api-types";

export function useForumLikes(postId: string) {
  const [likes, setLikes] = useState<ForumLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchForumPostLikes(postId)
      .then((res) => {
        setLikes(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => setLoading(false));
  }, [postId]);

  return { likes, loading, error };
}
