"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clapperboard, Trash2, TriangleAlert, XCircle } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistEditor, type ChecklistItem } from "@/components/ui/checklist-editor";
import { useConfirm, useConfirmDelete } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SwitchField } from "@/components/ui/switch";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  createEpisode,
  deleteComment,
  deleteEpisode,
  fetchEpisodeComments,
  fetchEpisodes,
  moderateComment,
  updateEpisode,
  type EpisodeInput,
} from "@/lib/api-services";
import { formatDateTime, getErrorMessage, userLabel } from "@/lib/utils";
import type { Episode, EpisodeComment, EpisodeMediaType } from "@/types/api-types";

const EMPTY_FORM: EpisodeInput = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  imageUrl: "",
  videoUrl: "",
  mediaType: "video",
  durationSeconds: 0,
  xp: 0,
  level: "",
  sortOrder: 1,
  views: 0,
  steps: [],
  noTrackRequired: false,
};

function toFormState(episode: Episode): EpisodeInput {
  return {
    title: episode.title,
    subtitle: episode.subtitle ?? "",
    description: episode.description ?? "",
    category: episode.category ?? "",
    imageUrl: episode.imageUrl ?? episode.coverUrl ?? "",
    videoUrl: episode.videoUrl ?? "",
    mediaType: episode.mediaType ?? "video",
    durationSeconds: episode.durationSeconds,
    xp: episode.xp,
    level: episode.level ?? "",
    sortOrder: episode.sortOrder,
    views: episode.views,
    steps: episode.steps,
    noTrackRequired: episode.noTrackRequired,
  };
}

export function EpisodeDetail({
  courseId,
  episodeId,
}: {
  courseId: string;
  episodeId: string;
}) {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const isCreate = episodeId === "new";

  const { entity, loading, notFound, error, setEntity } = useEntityDetail<Episode>(
    `episodes:${courseId}`,
    isCreate ? null : episodeId,
    (params) => fetchEpisodes(courseId, params),
  );

  const { form, setForm, hasChanges, discard } = useEntityForm(entity, toFormState, {
    emptyForm: EMPTY_FORM,
    isCreate,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleDiscard = () => {
    discard();
    setSaveError("");
  };

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      if (isCreate) {
        const created = await createEpisode(courseId, form);
        router.push(`/dashboard/courses/${courseId}/episodes/${created.id}`);
      } else if (entity) {
        const updated = await updateEpisode(courseId, entity.id, form);
        setEntity(updated);
        setSavedAt(new Date().toLocaleTimeString());
      }
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, "Failed to save the episode"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEpisode = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "episode",
      entityName: entity.title,
      onConfirm: async () => {
        await deleteEpisode(courseId, entity.id);
        router.push(`/dashboard/courses/${courseId}`);
      },
    });
  };

  if (!isCreate && notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref={`/dashboard/courses/${courseId}`}
            backLabel="Back to course"
            title="Episode not found"
          />
        }
      >
        <Card>
          <CardContent>
            <EmptyState
              icon={Clapperboard}
              title="Episode not found"
              description="It may have been deleted, or the link is out of date."
            />
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  if (!isCreate && error) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref={`/dashboard/courses/${courseId}`}
            backLabel="Back to course"
            title="Couldn't load episode"
          />
        }
      >
        <Card>
          <CardContent>
            <EmptyState
              icon={TriangleAlert}
              iconTone="danger"
              title="Couldn't load episode"
              description={error.message}
            />
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  const stillLoading = !isCreate && (loading || !entity);

  return (
    <AdminShell
      header={
        <DetailPageHeader
          backHref={`/dashboard/courses/${courseId}`}
          backLabel="Back to course"
          loading={stillLoading}
          title={isCreate ? "New episode" : (entity?.title ?? "")}
          badges={
            !isCreate &&
            entity && (
              <>
                {entity.mediaType === "audio" && <Badge variant="muted">Audio</Badge>}
                {entity.noTrackRequired && <Badge variant="muted">No-track</Badge>}
              </>
            )
          }
          actions={
            !isCreate &&
            entity && (
              <Button variant="destructive" size="sm" onClick={handleDeleteEpisode}>
                <Trash2 className="size-4" />
                Delete episode
              </Button>
            )
          }
        />
      }
    >
      {stillLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Episode details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveError && <Alert>{saveError}</Alert>}
              <FormField label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Subtitle">
                  <Input
                    value={form.subtitle ?? ""}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </FormField>
                <FormField label="Category">
                  <Input
                    value={form.category ?? ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Description">
                <Input
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <FormField label="Image / Cover URL">
                <Input
                  value={form.imageUrl ?? ""}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Media URL">
                  <Input
                    value={form.videoUrl ?? ""}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                </FormField>
                <FormField label="Media type">
                  <Select
                    value={form.mediaType}
                    onChange={(e) =>
                      setForm({ ...form, mediaType: e.target.value as EpisodeMediaType })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <FormField label="Duration (s)">
                  <Input
                    type="number"
                    value={form.durationSeconds}
                    onChange={(e) =>
                      setForm({ ...form, durationSeconds: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="XP">
                  <Input
                    type="number"
                    value={form.xp}
                    onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Sort Order">
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Views">
                  <Input
                    type="number"
                    value={form.views}
                    onChange={(e) => setForm({ ...form, views: Number(e.target.value) })}
                  />
                </FormField>
              </div>

              <ChecklistEditor
                items={(form.steps ?? []) as ChecklistItem[]}
                onChange={(items) =>
                  setForm({
                    ...form,
                    steps: items.map((it) => ({
                      id: it.id,
                      text: it.text,
                      isCompleted: it.isCompleted ?? false,
                    })),
                  })
                }
                addLabel="Add step"
                emptyHint="No watch-along steps yet."
                placeholder={(i) => `Step ${i + 1}`}
              />

              <SwitchField
                label="No tracking required"
                description="Learners can play this episode without progress tracking or completion gating."
                checked={Boolean(form.noTrackRequired)}
                onCheckedChange={(v) => setForm({ ...form, noTrackRequired: v })}
              />
            </CardContent>
            <SaveDiscardBar
              hasChanges={hasChanges}
              saving={saving}
              savedAt={savedAt}
              saveLabel={isCreate ? "Create episode" : "Save changes"}
              savingLabel={isCreate ? "Creating..." : "Saving..."}
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          </Card>

          {!isCreate && entity && (
            <CommentsCard courseId={courseId} episodeId={entity.id} />
          )}
        </div>
      )}
    </AdminShell>
  );
}

function CommentsCard({
  courseId,
  episodeId,
}: {
  courseId: string;
  episodeId: string;
}) {
  const confirm = useConfirm();
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchEpisodeComments(courseId, episodeId)
      .then((res) => {
        setComments(res.data);
        setError("");
      })
      .catch((err: unknown) => setError(getErrorMessage(err, "Failed to load comments")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [courseId, episodeId]);

  const handleApprove = async (commentId: string) => {
    await moderateComment(courseId, episodeId, commentId, {
      moderationStatus: "approved",
    });
    load();
  };

  const handleReject = (comment: EpisodeComment) => {
    confirm({
      title: "Reject comment",
      description: (
        <>
          Reject this comment from{" "}
          <strong className="text-foreground">
            {userLabel({
              displayName: comment.authorDisplayName,
              firstName: comment.authorFirstName,
              lastName: comment.authorLastName,
            })}
          </strong>
          ? It stays hidden until re-approved.
        </>
      ),
      onConfirm: async () => {
        await moderateComment(courseId, episodeId, comment.id, {
          moderationStatus: "rejected",
          reason: "Inappropriate",
        });
        load();
      },
    });
  };

  const handleDelete = (comment: EpisodeComment) => {
    confirm({
      title: "Delete comment",
      variant: "destructive",
      confirmLabel: "Delete",
      description: "Permanently delete this comment? This cannot be undone.",
      onConfirm: async () => {
        await deleteComment(courseId, episodeId, comment.id);
        load();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : comments.length === 0 ? (
          <EmptyState title="No comments yet." className="py-8" />
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-black/10 p-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold">
                    {userLabel({
                      displayName: c.authorDisplayName,
                      firstName: c.authorFirstName,
                      lastName: c.authorLastName,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        c.moderationStatus === "approved"
                          ? "success"
                          : c.moderationStatus === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {c.moderationStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="mt-1">{c.text}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.moderationStatus !== "approved" && (
                    <Button size="sm" variant="secondary" onClick={() => handleApprove(c.id)}>
                      <CheckCircle className="mr-1 size-3" /> Approve
                    </Button>
                  )}
                  {c.moderationStatus !== "rejected" && (
                    <Button size="sm" variant="secondary" onClick={() => handleReject(c)}>
                      <XCircle className="mr-1 size-3" /> Reject
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(c)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
