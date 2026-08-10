"use client";

import { Fragment, useState } from "react";
import { Search, Pin, PinOff, Trash2, ChevronDown, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Dialog } from "@/components/ui/dialog";
import { useForumLikes } from "@/hooks/use-forum-likes";
import { useForumBlocks } from "@/hooks/use-forum-blocks";
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
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function ForumTable({
  posts,
  postsLoading,
  postsError,
  postsMeta,
  onPostsSearch,
  onPostsPageChange,
  onTogglePin,
  onDeletePost,
  onDeleteComment,
}: ForumTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "blocks">("posts");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [likesDialogPostId, setLikesDialogPostId] = useState<string | null>(
    null,
  );

  const blocksHook = useForumBlocks({ limit: 10, offset: 0 });

  const handlePostsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onPostsSearch(searchQuery);
  };

  const handleBlocksSearch = (e: React.FormEvent) => {
    e.preventDefault();
    blocksHook.setSearchQuery(searchQuery);
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
            {postsError && (
              <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                {postsError.message}
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Pinned</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
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
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No posts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => {
                      const isExpanded = expandedPostId === post.id;
                      return (
                        <Fragment key={post.id}>
                          <TableRow
                            className="cursor-pointer"
                            onClick={() =>
                              setExpandedPostId(isExpanded ? null : post.id)
                            }
                          >
                            <TableCell>
                              <div className="font-bold line-clamp-1">
                                {post.text}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {post.location} ·{" "}
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>{post.authorId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Heart className="size-3 text-red-400" />
                                {post.likes}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={post.isPinned ? "warning" : "muted"}
                              >
                                {post.isPinned ? "Pinned" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>{post.comments.length}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={
                                    post.isPinned ? "Unpin post" : "Pin post"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin(post.id, !post.isPinned);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletePostId(post.id);
                                  }}
                                >
                                  <Trash2 className="size-4 text-red-300" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Expand post"
                                className={isExpanded ? "rotate-180" : ""}
                              >
                                <ChevronDown className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="hover:bg-transparent">
                              <TableCell
                                colSpan={7}
                                className="bg-black/20 p-4"
                              >
                                <div className="space-y-3">
                                  {/* Likes section */}
                                  <div>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() =>
                                        setLikesDialogPostId(post.id)
                                      }
                                    >
                                      <Heart className="size-4 mr-1" /> View
                                      likes ({post.likes})
                                    </Button>
                                  </div>
                                  {/* Comments */}
                                  <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                                      Comments ({post.comments.length})
                                    </p>
                                    {post.comments.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">
                                        No comments.
                                      </p>
                                    ) : (
                                      post.comments.map((comment) => (
                                        <div
                                          key={comment.id}
                                          className="flex items-center justify-between rounded border bg-black/10 p-2 mb-2"
                                        >
                                          <div>
                                            <p className="text-sm">
                                              {comment.text}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              by {comment.authorId} ·{" "}
                                              {new Date(
                                                comment.createdAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              setDeleteCommentId(comment.id)
                                            }
                                          >
                                            <Trash2 className="size-4 text-red-300" />
                                          </Button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
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
            {blocksHook.error && (
              <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                {blocksHook.error.message}
              </div>
            )}
            <div className="overflow-x-auto">
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
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No blocks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    blocksHook.blocks.map((block) => (
                      <TableRow key={block.id}>
                        <TableCell>{block.blocker.displayName}</TableCell>
                        <TableCell>{block.blockedUser.displayName}</TableCell>
                        <TableCell>
                          {new Date(block.blockedAt).toLocaleDateString()}
                        </TableCell>
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

      {/* Delete Post Dialog */}
      <DeleteConfirmationDialog
        open={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={async () => {
          if (deletePostId) {
            await onDeletePost(deletePostId);
            setDeletePostId(null);
          }
        }}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />

      {/* Delete Comment Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={async () => {
          if (deleteCommentId) {
            await onDeleteComment(deleteCommentId);
            setDeleteCommentId(null);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
      />

      {/* Likes Dialog */}
      <LikesDialog
        postId={likesDialogPostId}
        onClose={() => setLikesDialogPostId(null)}
      />
    </Card>
  );
}

// ─── Reusable Delete Dialog ──────────────────────
function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Header>{title}</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">{message}</p>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, delete"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

// ─── Likes Dialog ────────────────────────────────
function LikesDialog({
  postId,
  onClose,
}: {
  postId: string | null;
  onClose: () => void;
}) {
  const { likes, loading, error } = useForumLikes(postId);
  if (!postId) return null;

  return (
    <Dialog open={!!postId} onOpenChange={onClose}>
      <Dialog.Header>Post Likes</Dialog.Header>
      <Dialog.Body>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading likes...</p>
        ) : error ? (
          <p className="text-sm text-red-300">{error.message}</p>
        ) : likes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No likes yet.</p>
        ) : (
          <div className="space-y-2">
            {likes.map((like) => (
              <div
                key={like.id}
                className="flex items-center justify-between rounded border bg-black/10 p-2"
              >
                <span className="font-bold">{like.user.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(like.likedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
