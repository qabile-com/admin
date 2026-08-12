"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Pin, PinOff, Trash2, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirm, useConfirmDelete } from "@/components/ui/confirm-dialog";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import { useForumLikes } from "@/hooks/use-forum-likes";
import {
  deleteForumComment,
  deleteForumPost,
  fetchForumPosts,
  pinForumPost,
} from "@/lib/api-services";
import { formatDateTime, shortId, userLabel } from "@/lib/utils";
import type { ForumPost } from "@/types/api-types";

export function PostDetail({ postId }: { postId: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const confirmDelete = useConfirmDelete();

  const { entity, loading, notFound, error, setEntity } = useEntityDetail<ForumPost>(
    "forum-posts",
    postId,
    (params) => fetchForumPosts(params),
  );

  const [comments, setComments] = useState(entity?.comments ?? []);
  useEffect(() => {
    if (entity) setComments(entity.comments);
  }, [entity]);

  const { likes, loading: likesLoading, error: likesError } = useForumLikes(postId);

  const handleTogglePin = async () => {
    if (!entity) return;
    const updated = await pinForumPost(entity.id, !entity.isPinned);
    setEntity(updated);
  };

  const handleDeletePost = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "post",
      entityName: entity.text.length > 60 ? `${entity.text.slice(0, 60)}…` : entity.text,
      description: (
        <>
          Permanently delete this post
          {comments.length > 0 &&
            ` and its ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          ? This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        await deleteForumPost(entity.id);
        router.push("/dashboard/forum");
      },
    });
  };

  const handleDeleteComment = (commentId: string) => {
    confirm({
      title: "Delete comment",
      variant: "destructive",
      confirmLabel: "Delete",
      description: "Permanently delete this comment? This cannot be undone.",
      onConfirm: async () => {
        await deleteForumComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      },
    });
  };

  if (notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader backHref="/dashboard/forum" backLabel="Back to forum" title="Post not found" />
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Post not found</p>
              <p className="text-sm text-muted-foreground">
                It may have been deleted, or the link is out of date.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell
        header={
          <DetailPageHeader backHref="/dashboard/forum" backLabel="Back to forum" title="Couldn't load post" />
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <TriangleAlert className="size-6 text-red-300" />
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      header={
        <DetailPageHeader
          backHref="/dashboard/forum"
          backLabel="Back to forum"
          loading={loading}
          title={entity ? "Forum post" : ""}
          badges={
            entity && (
              <Badge variant={entity.isPinned ? "warning" : "muted"}>
                {entity.isPinned ? "Pinned" : "Not pinned"}
              </Badge>
            )
          }
          actions={
            entity && (
              <>
                <Button variant="secondary" size="sm" onClick={handleTogglePin}>
                  {entity.isPinned ? (
                    <PinOff className="size-4" />
                  ) : (
                    <Pin className="size-4" />
                  )}
                  {entity.isPinned ? "Unpin" : "Pin"}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeletePost}>
                  <Trash2 className="size-4" />
                  Delete post
                </Button>
              </>
            )
          }
        />
      }
    >
      {loading || !entity ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-56 animate-pulse rounded-xl bg-[var(--glass-2)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap text-sm">{entity.text}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono" title={entity.authorId}>
                  Author: {shortId(entity.authorId)}
                </span>
                <span>{formatDateTime(entity.createdAt)}</span>
                {entity.location && <span>{entity.location}</span>}
                <span className="flex items-center gap-1">
                  <Heart className="size-3 text-red-400" />
                  {entity.likes}
                </span>
              </div>
              {entity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entity.tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No comments.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-border bg-black/10 p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p>{comment.text}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            by{" "}
                            <span className="font-mono" title={comment.authorId}>
                              {shortId(comment.authorId)}
                            </span>{" "}
                            · {formatDateTime(comment.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete comment"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="size-4 text-red-300" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Likes */}
            <Card>
              <CardHeader>
                <CardTitle>Likes ({entity.likes})</CardTitle>
              </CardHeader>
              <CardContent>
                {likesLoading ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--glass-2)]" />
                    ))}
                  </div>
                ) : likesError ? (
                  <p className="py-6 text-center text-sm text-red-300">{likesError.message}</p>
                ) : likes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No likes yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {likes.map((like) => (
                      <div
                        key={like.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-black/10 p-2.5 text-sm"
                      >
                        <span className="font-bold">{userLabel(like.user)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(like.likedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
