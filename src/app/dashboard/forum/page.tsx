"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useForumPosts } from "@/hooks/use-forum-posts";
import { ForumTable } from "@/features/forum/forum-table";

export default function ForumPage() {
  const ready = useRequireAuth();
  const postsHook = useForumPosts({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Forum"
      description="Moderate posts and blocks. Click a post for comments and likes."
    >
      <ForumTable
        posts={postsHook.posts}
        postsLoading={postsHook.loading}
        postsError={postsHook.error}
        postsMeta={postsHook.meta}
        onPostsSearch={postsHook.setSearchQuery}
        onPostsPageChange={postsHook.setPage}
        onTogglePin={postsHook.togglePin}
        onDeletePost={postsHook.removePost}
      />
    </AdminShell>
  );
}
