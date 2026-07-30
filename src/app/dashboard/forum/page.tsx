"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useForumPosts } from "@/hooks/use-forum-posts";
import { ForumTable } from "@/features/forum/forum-table";

export default function ForumPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/");
    }
  }, [mounted, accessToken, router]);

  const postsHook = useForumPosts({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell>
      <ForumTable
        posts={postsHook.posts}
        postsLoading={postsHook.loading}
        postsError={postsHook.error}
        postsMeta={postsHook.meta}
        onPostsSearch={postsHook.setSearchQuery}
        onPostsPageChange={postsHook.setPage}
        onTogglePin={postsHook.togglePin}
        onDeletePost={postsHook.removePost}
        onDeleteComment={postsHook.removeComment}
      />
    </AdminShell>
  );
}
