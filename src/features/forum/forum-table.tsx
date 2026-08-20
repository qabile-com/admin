"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pin, PinOff, Trash2, ChevronRight, Heart } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableEmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
import { useForumBlocks } from "@/hooks/use-forum-blocks";
import { formatDateTime, shortId, userLabel } from "@/lib/utils";
import type { ForumPost } from "@/types/api-types";

interface ForumTableProps {
  posts: ForumPost[];
  postsLoading: boolean;
  postsError: Error | null;
  postsMeta: {
    totalItems: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
  onPostsSearch: (q: string) => void;
  onPostsPageChange: (page: number) => void;
  onTogglePin: (postId: string, isPinned: boolean) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
}

/**
 * Posts list (browse/search/pin/delete, click a row for comments + likes)
 * plus the Blocks tab, which stays flat here — no editing, no nesting.
 */
export function ForumTable({
  posts,
  postsLoading,
  postsError,
  postsMeta,
  onPostsSearch,
  onPostsPageChange,
  onTogglePin,
  onDeletePost,
}: ForumTableProps) {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "blocks">("posts");

  const blocksHook = useForumBlocks({ limit: 10, offset: 0 });

  const handlePostsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onPostsSearch(searchQuery);
  };

  const handleBlocksSearch = (e: React.FormEvent) => {
    e.preventDefault();
    blocksHook.setSearchQuery(searchQuery);
  };

  const handleDeletePost = (post: ForumPost) => {
    confirmDelete({
      entityLabel: "post",
      entityName: post.text.length > 60 ? `${post.text.slice(0, 60)}…` : post.text,
      description: (
        <>
          Permanently delete this post
          {post.comments.length > 0 &&
            ` and its ${post.comments.length} comment${post.comments.length === 1 ? "" : "s"}`}
          ? This cannot be undone.
        </>
      ),
      onConfirm: () => onDeletePost(post.id),
    });
  };

  const postsCurrentPage = postsMeta.offset / postsMeta.limit + 1;
  const blocksCurrentPage = blocksHook.meta.offset / blocksHook.meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <CardTitle>Forum Moderation</CardTitle>
        <TabsList>
          <TabsTrigger
            active={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            active={activeTab === "blocks"}
            onClick={() => setActiveTab("blocks")}
          >
            Blocks
          </TabsTrigger>
        </TabsList>
        <form
          onSubmit={
            activeTab === "posts" ? handlePostsSearch : handleBlocksSearch
          }
          className="flex max-w-lg gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forum..."
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        {activeTab === "posts" && (
          <>
            {postsError && <Alert className="mb-4">{postsError.message}</Alert>}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Pinned</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading posts...
                      </TableCell>
                    </TableRow>
                  ) : posts.length === 0 ? (
                    <TableEmptyState colSpan={7}>No posts found.</TableEmptyState>
                  ) : (
                    posts.map((post) => (
                      <TableRow
                        key={post.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/forum/${post.id}`)}
                      >
                        <TableCell>
                          <div className="line-clamp-1 font-bold">{post.text}</div>
                          <div className="text-xs text-muted-foreground">
                            {post.location ? `${post.location} · ` : ""}
                            {formatDateTime(post.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs" title={post.authorId}>
                          {shortId(post.authorId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Heart className="size-3 text-red-400" />
                            {post.likes}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.isPinned ? "warning" : "muted"}>
                            {post.isPinned ? "Pinned" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.comments.length}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={post.isPinned ? "Unpin post" : "Pin post"}
                              onClick={() => onTogglePin(post.id, !post.isPinned)}
                            >
                              {post.isPinned ? (
                                <PinOff className="size-4" />
                              ) : (
                                <Pin className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete post"
                              onClick={() => handleDeletePost(post)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {postsMeta.totalItems} total posts
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={postsCurrentPage <= 1}
                  onClick={() => onPostsPageChange(postsCurrentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-muted-foreground">
                  Page {postsCurrentPage} of {postsMeta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={postsCurrentPage >= postsMeta.totalPages}
                  onClick={() => onPostsPageChange(postsCurrentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === "blocks" && (
          <>
            {blocksHook.error && <Alert className="mb-4">{blocksHook.error.message}</Alert>}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blocker</TableHead>
                    <TableHead>Blocked User</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocksHook.loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading blocks...
                      </TableCell>
                    </TableRow>
                  ) : blocksHook.blocks.length === 0 ? (
                    <TableEmptyState colSpan={3}>No blocks found.</TableEmptyState>
                  ) : (
                    blocksHook.blocks.map((block) => (
                      <TableRow key={block.id}>
                        <TableCell>{userLabel(block.blocker)}</TableCell>
                        <TableCell>{userLabel(block.blockedUser)}</TableCell>
                        <TableCell>{formatDateTime(block.blockedAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {blocksHook.meta.totalItems} total blocks
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={blocksCurrentPage <= 1}
                  onClick={() => blocksHook.setPage(blocksCurrentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-muted-foreground">
                  Page {blocksCurrentPage} of {blocksHook.meta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={blocksCurrentPage >= blocksHook.meta.totalPages}
                  onClick={() => blocksHook.setPage(blocksCurrentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
