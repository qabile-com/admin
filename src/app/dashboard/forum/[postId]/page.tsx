"use client";

import { use } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PostDetail } from "@/features/forum/post-detail";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const ready = useRequireAuth();

  if (!ready) return null;

  return <PostDetail postId={postId} />;
}
