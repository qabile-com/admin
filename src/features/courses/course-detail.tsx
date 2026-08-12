"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  BookPlus,
  ChevronRight,
  MoveDown,
  MoveUp,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { SwitchField } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm, useConfirmDelete } from "@/components/ui/confirm-dialog";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import {
  deleteCourse,
  deleteEpisodesBatch,
  fetchCourses,
  fetchEpisodes,
  reorderEpisodes,
  updateCourse,
  type CourseInput,
} from "@/lib/api-services";
import { cn, formatDuration } from "@/lib/utils";
import type { AdminCourse, Episode } from "@/types/api-types";

function toFormState(course: AdminCourse): CourseInput {
  return {
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    category: course.category,
    categories: course.categories,
    gradient: course.gradient,
    imageUrl: course.imageUrl,
    durationSeconds: course.durationSeconds,
    views: course.views,
    sortOrder: course.sortOrder,
    xpPrice: course.xpPrice,
    xp: course.xp,
    level: course.level,
    noTrackRequired: course.noTrackRequired,
  };
}

export function CourseDetail({ id }: { id: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const confirmDelete = useConfirmDelete();

  const { entity, loading, notFound, error, setEntity } =
    useEntityDetail<AdminCourse>("courses", id, (params) => fetchCourses(params));

  const [form, setForm] = useState<CourseInput | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const episodesCancelledRef = useRef(false);

  useEffect(() => {
    if (entity) setForm(toFormState(entity));
  }, [entity]);

  const loadEpisodes = useCallback(() => {
    episodesCancelledRef.current = false;
    setLoadingEpisodes(true);
    fetchEpisodes(id, { limit: 100 })
      .then((res) => {
        if (!episodesCancelledRef.current) setEpisodes(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!episodesCancelledRef.current) setLoadingEpisodes(false);
      });
  }, [id]);

  useEffect(() => {
    loadEpisodes();
    return () => {
      episodesCancelledRef.current = true;
    };
  }, [loadEpisodes]);

  const hasChanges =
    !!entity && !!form && JSON.stringify(form) !== JSON.stringify(toFormState(entity));

  const handleDiscard = () => {
    if (entity) setForm(toFormState(entity));
    setSaveError("");
  };

  const handleSave = async () => {
    if (!entity || !form) return;
    setSaveError("");
    setSaving(true);
    try {
      const updated = await updateCourse(entity.id, form);
      setEntity(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save the course",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "course",
      entityName: entity.title,
      requireTypedConfirmation: entity.title,
      description: (
        <>
          Permanently delete <strong className="text-foreground">{entity.title}</strong>?
          This also deletes its {episodes.length} episode
          {episodes.length === 1 ? "" : "s"} and all of their comments. This
          cannot be undone.
        </>
      ),
      onConfirm: async () => {
        await deleteCourse(entity.id);
        router.push("/dashboard/courses");
      },
    });
  };

  const moveEpisode = async (episode: Episode, direction: "up" | "down") => {
    const sorted = [...episodes].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((e) => e.id === episode.id);
    if (idx === -1) return;
    const otherIdx = direction === "up" ? idx - 1 : idx + 1;
    if (otherIdx < 0 || otherIdx >= sorted.length) return;
    const other = sorted[otherIdx];
    await reorderEpisodes(id, [
      { id: episode.id, sortOrder: other.sortOrder },
      { id: other.id, sortOrder: episode.sortOrder },
    ]);
    loadEpisodes();
  };

  const toggleSelected = (episodeId: string) =>
    setSelectedIds((prev) =>
      prev.includes(episodeId)
        ? prev.filter((eid) => eid !== episodeId)
        : [...prev, episodeId],
    );

  const handleBatchDelete = () => {
    confirm({
      title: "Delete episodes",
      variant: "destructive",
      confirmLabel: `Delete ${selectedIds.length}`,
      description: (
        <>
          Permanently delete{" "}
          <strong className="text-foreground">
            {selectedIds.length} episode{selectedIds.length === 1 ? "" : "s"}
          </strong>
          ? This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        await deleteEpisodesBatch(id, selectedIds);
        setSelectedIds([]);
        loadEpisodes();
      },
    });
  };

  if (notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref="/dashboard/courses"
            backLabel="Back to courses"
            title="Course not found"
          />
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <BookOpen className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Course not found</p>
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
          <DetailPageHeader
            backHref="/dashboard/courses"
            backLabel="Back to courses"
            title="Couldn't load course"
          />
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
          backHref="/dashboard/courses"
          backLabel="Back to courses"
          loading={loading}
          title={entity?.title ?? ""}
          badges={
            entity && (
              <>
                <Badge>{entity.category}</Badge>
                {entity.noTrackRequired && <Badge variant="muted">No-track</Badge>}
              </>
            )
          }
          actions={
            entity && (
              <Button variant="destructive" size="sm" onClick={handleDeleteCourse}>
                <Trash2 className="size-4" />
                Delete course
              </Button>
            )
          }
        />
      }
    >
      {loading || !entity || !form ? (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-40 animate-pulse rounded-xl bg-[var(--glass-2)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveError && (
                <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                  {saveError}
                </div>
              )}
              <FormField label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                    value={form.category}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Categories" hint="Comma separated">
                  <Input
                    value={(form.categories ?? []).join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categories: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </FormField>
                <FormField label="Level">
                  <Input
                    value={form.level ?? ""}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Image URL">
                <Input
                  value={form.imageUrl ?? ""}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FormField label="Duration (s)">
                  <Input
                    type="number"
                    value={form.durationSeconds}
                    onChange={(e) =>
                      setForm({ ...form, durationSeconds: Number(e.target.value) })
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
                <FormField label="Sort Order">
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="XP Price">
                  <Input
                    type="number"
                    value={form.xpPrice}
                    onChange={(e) => setForm({ ...form, xpPrice: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="XP">
                  <Input
                    type="number"
                    value={form.xp}
                    onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
                  />
                </FormField>
              </div>
              <SwitchField
                label="No tracking required"
                description="Learners can watch this course without progress tracking or completion gating."
                checked={Boolean(form.noTrackRequired)}
                onCheckedChange={(v) => setForm({ ...form, noTrackRequired: v })}
              />
            </CardContent>
            <SaveDiscardBar
              hasChanges={hasChanges}
              saving={saving}
              savedAt={savedAt}
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          </Card>

          {/* Episodes */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Episodes</CardTitle>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {selectedIds.length} selected
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedIds([])}>
                      Clear
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                      <Trash2 className="size-4" />
                      Delete selected
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/courses/${id}/episodes/new`)}
                >
                  <BookPlus className="size-4" />
                  Add episode
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEpisodes ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--glass-2)]" />
                  ))}
                </div>
              ) : episodes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No episodes yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/5">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <TableHead className="w-10">Order</TableHead>
                        <TableHead>Episode</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...episodes]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((ep) => (
                          <TableRow
                            key={ep.id}
                            className={cn(
                              "cursor-pointer",
                              selectedIds.includes(ep.id) && "bg-orange-400/[0.06]",
                            )}
                            onClick={() =>
                              router.push(`/dashboard/courses/${id}/episodes/${ep.id}`)
                            }
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(ep.id)}
                                onChange={() => toggleSelected(ep.id)}
                                aria-label={`Select ${ep.title}`}
                                className="size-4 accent-[var(--color-primary)]"
                              />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold">{ep.sortOrder}</span>
                                <div className="flex flex-col">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => moveEpisode(ep, "up")}
                                  >
                                    <MoveUp className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => moveEpisode(ep, "down")}
                                  >
                                    <MoveDown className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 font-bold">
                                {ep.title}
                                {ep.mediaType === "audio" && (
                                  <Badge variant="muted">Audio</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatDuration(ep.durationSeconds)}</TableCell>
                            <TableCell>{ep.xp}</TableCell>
                            <TableCell>
                              <ChevronRight className="size-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
