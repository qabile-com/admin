"use client";

import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import {
  BookPlus,
  ChevronDown,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle,
  XCircle,
  Search,
  LinkIcon,
} from "lucide-react";
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
import { Dialog } from "@/components/ui/dialog";
import {
  fetchEpisodes,
  fetchEpisodeComments,
  moderateComment,
  deleteComment,
  deleteEpisode,
  updateEpisode,
  reorderEpisodes,
  createEpisode,
} from "@/lib/api-services";
import type { AdminCourse, Episode, EpisodeComment } from "@/types/api-types";

// ─── Props ─────────────────────────────
interface CoursesTableProps {
  courses: AdminCourse[];
  loading: boolean;
  error: Error | null;
  meta: {
    totalItems: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
  onSearch: (q: string) => void;
  onPageChange: (page: number) => void;
  onCreate: (data: Partial<AdminCourse>) => Promise<void>;
  onDelete: (courseId: string) => Promise<void>;
  onUpdate: (courseId: string, data: Partial<AdminCourse>) => Promise<void>;
  onReorder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
}

export function CoursesTable({
  courses,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onDelete,
  onUpdate,
  onReorder,
}: CoursesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editDialog, setEditDialog] = useState<AdminCourse | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<AdminCourse | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.offset / meta.limit + 1;

  const handleMove = (course: AdminCourse, direction: "up" | "down") => {
    const index = courses.findIndex((c) => c.id === course.id);
    if (index === -1) return;
    const otherIndex = direction === "up" ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= courses.length) return;
    const other = courses[otherIndex];
    onReorder([
      { id: course.id, sortOrder: other.sortOrder },
      { id: other.id, sortOrder: course.sortOrder },
    ]);
  };

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Courses</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <BookPlus className="mr-1 size-4" /> New course
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-lg">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error.message}
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border border-white/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Order</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>XP Price</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Views</TableHead>
                <TableHead className="w-20">Actions</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading courses...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => {
                  const isOpen = openCourseId === course.id;
                  // Use durationSeconds if available, fallback to duration
                  const durationSec =
                    course.durationSeconds ?? course.duration ?? 0;
                  return (
                    <Fragment key={course.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-white/[0.035]"
                        onClick={() =>
                          setOpenCourseId(isOpen ? null : course.id)
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold">
                              {course.sortOrder}
                            </span>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-5 sm:w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMove(course, "up");
                                }}
                              >
                                <MoveUp className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-5 sm:w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMove(course, "down");
                                }}
                              >
                                <MoveDown className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">{course.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {course.subtitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{course.category}</Badge>
                        </TableCell>
                        <TableCell>{course.level || "—"}</TableCell>
                        <TableCell>{course.xpPrice ?? course.xp}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {Math.floor(durationSec / 60)}m
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {course.views.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit course"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDialog(course);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete course"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog(course);
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
                            aria-label={`Expand ${course.title}`}
                            className={isOpen ? "rotate-180" : ""}
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={9} className="bg-black/20 p-4">
                            <CourseDetailPanel courseId={course.id} />
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

        <div className="mt-4 flex flex-col items-center justify-between gap-2 text-sm sm:flex-row">
          <span className="text-muted-foreground">
            {meta.totalItems} total courses
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {currentPage} of {meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= meta.totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      <CreateCourseDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
      <EditCourseDialog
        key={editDialog?.id}
        course={editDialog}
        onClose={() => setEditDialog(null)}
        onUpdate={onUpdate}
      />
      <DeleteCourseDialog
        course={deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={onDelete}
      />
    </Card>
  );
}

// ─── Course Detail Panel (episodes & comments) ─────────────
function CourseDetailPanel({ courseId }: { courseId: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [deleteEpisodeDialog, setDeleteEpisodeDialog] =
    useState<Episode | null>(null);
  const cancelledRef = useRef(false);

  const loadEpisodes = useCallback(() => {
    setLoadingEpisodes(true);
    cancelledRef.current = false;
    fetchEpisodes(courseId, { limit: 50 })
      .then((res) => {
        if (!cancelledRef.current) {
          setEpisodes(res.data);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelledRef.current) {
          setLoadingEpisodes(false);
        }
      });
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEpisodes();
    return () => {
      cancelledRef.current = true;
    };
  }, [loadEpisodes]);

  const handleReorderEpisodes = async (
    items: { id: string; sortOrder: number }[],
  ) => {
    await reorderEpisodes(courseId, items);
    loadEpisodes();
  };

  const moveEpisode = (episode: Episode, direction: "up" | "down") => {
    const sorted = [...episodes].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((e) => e.id === episode.id);
    if (idx === -1) return;
    const otherIdx = direction === "up" ? idx - 1 : idx + 1;
    if (otherIdx < 0 || otherIdx >= sorted.length) return;
    const other = sorted[otherIdx];
    handleReorderEpisodes([
      { id: episode.id, sortOrder: other.sortOrder },
      { id: other.id, sortOrder: episode.sortOrder },
    ]);
  };

  const handleEpisodeCreated = () => {
    setShowAddEpisode(false);
    loadEpisodes();
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    await deleteEpisode(courseId, episodeId);
    setDeleteEpisodeDialog(null);
    loadEpisodes();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Episodes
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAddEpisode(true)}
          >
            <BookPlus className="mr-1 size-4" /> Add episode
          </Button>
        </div>
        {loadingEpisodes ? (
          <p className="py-4 text-sm text-muted-foreground">
            Loading episodes...
          </p>
        ) : episodes.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No episodes yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {episodes
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((ep) => (
                <EpisodeRow
                  key={ep.id}
                  episode={ep}
                  onMove={moveEpisode}
                  onUpdate={async (data) => {
                    await updateEpisode(courseId, ep.id, data);
                    loadEpisodes();
                  }}
                  onDelete={() => setDeleteEpisodeDialog(ep)}
                />
              ))}
          </div>
        )}
      </div>
      <AddEpisodeDialog
        courseId={courseId}
        open={showAddEpisode}
        onOpenChange={setShowAddEpisode}
        onCreated={handleEpisodeCreated}
      />
      <DeleteEpisodeDialog
        episode={deleteEpisodeDialog}
        onClose={() => setDeleteEpisodeDialog(null)}
        onConfirm={handleDeleteEpisode}
      />
    </div>
  );
}

function EpisodeRow({
  episode,
  onMove,
  onUpdate,
  onDelete,
}: {
  episode: Episode;
  onMove: (ep: Episode, dir: "up" | "down") => void;
  onUpdate: (data: Partial<Episode>) => Promise<void>;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const durationSec = episode.durationSeconds ?? episode.time ?? 0;

  return (
    <div className="rounded-lg border bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-bold">{episode.title}</p>
          <p className="text-xs text-muted-foreground">
            {Math.floor(durationSec / 60)}m · {episode.xp} XP · Order:{" "}
            {episode.sortOrder}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(episode, "up")}
          >
            <MoveUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(episode, "down")}
          >
            <MoveDown className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowEdit(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete session"
            onClick={onDelete}
          >
            <Trash2 className="size-4 text-red-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowComments(!showComments)}
          >
            <LinkIcon className="size-4" />
          </Button>
        </div>
      </div>
      {showComments && (
        <CommentsSection courseId={episode.courseId} episodeId={episode.id} />
      )}
      <EditEpisodeDialog
        episode={episode}
        open={showEdit}
        onOpenChange={setShowEdit}
        onUpdate={onUpdate}
      />
    </div>
  );
}

function DeleteEpisodeDialog({
  episode,
  onClose,
  onConfirm,
}: {
  episode: Episode | null;
  onClose: () => void;
  onConfirm: (episodeId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!episode) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(episode.id);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!episode} onOpenChange={onClose}>
      <Dialog.Header>Delete Session</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{episode.title}</strong>? This
          action cannot be undone.
        </p>
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

function CommentsSection({
  courseId,
  episodeId,
}: {
  courseId: string;
  episodeId: string;
}) {
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchEpisodeComments(courseId, episodeId)
      .then((res) => {
        if (!cancelled) {
          setComments(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, episodeId]);

  const handleModerate = async (
    commentId: string,
    status: "approved" | "rejected" | "pending",
    reason?: string,
  ) => {
    try {
      await moderateComment(courseId, episodeId, commentId, {
        moderationStatus: status,
        reason,
      });
      const res = await fetchEpisodeComments(courseId, episodeId);
      setComments(res.data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(courseId, episodeId, commentId);
      const res = await fetchEpisodeComments(courseId, episodeId);
      setComments(res.data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <p className="py-2 text-sm text-muted-foreground">Loading comments...</p>
    );
  if (error) return <p className="py-2 text-sm text-red-300">{error}</p>;
  if (comments.length === 0)
    return <p className="py-2 text-sm text-muted-foreground">No comments.</p>;

  return (
    <div className="mt-2 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="rounded border bg-black/10 p-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold">
              {c.authorDisplayName || c.authorName}
            </span>
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
          </div>
          <p className="mt-1">{c.text}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {c.moderationStatus !== "approved" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleModerate(c.id, "approved")}
              >
                <CheckCircle className="size-3 mr-1" /> Approve
              </Button>
            )}
            {c.moderationStatus !== "rejected" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  handleModerate(c.id, "rejected", "Inappropriate")
                }
              >
                <XCircle className="size-3 mr-1" /> Reject
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(c.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Create Course Dialog (updated fields) ──────────
function CreateCourseDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<AdminCourse>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    categories: "",
    gradient: "linear-gradient(135deg,#ffb347,#cc7a08)",
    imageUrl: "",
    durationSeconds: "0",
    views: "0",
    sortOrder: "1",
    xpPrice: "0",
    xp: "0",
    level: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        category: form.category,
        categories: form.categories.split(",").map((s) => s.trim()),
        gradient: form.gradient,
        imageUrl: form.imageUrl,
        durationSeconds: Number(form.durationSeconds),
        views: Number(form.views),
        sortOrder: Number(form.sortOrder),
        xpPrice: Number(form.xpPrice),
        xp: Number(form.xp),
        level: form.level || undefined,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>New Course</Dialog.Header>
      <Dialog.Body>
        <form
          id="create-course-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Subtitle</span>
            <Input
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Description</span>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Category</span>
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">
              Categories (comma separated)
            </span>
            <Input
              value={form.categories}
              onChange={(e) => handleChange("categories", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Image URL</span>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Level</span>
            <Input
              value={form.level}
              onChange={(e) => handleChange("level", e.target.value)}
              placeholder="e.g. مبتدی, متوسط, پیشرفته"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">Duration (seconds)</span>
              <Input
                type="number"
                value={form.durationSeconds}
                onChange={(e) =>
                  handleChange("durationSeconds", e.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Views</span>
              <Input
                type="number"
                value={form.views}
                onChange={(e) => handleChange("views", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Prefer to leave empty.
              </p>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Sort Order</span>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP Price</span>
              <Input
                type="number"
                value={form.xpPrice}
                onChange={(e) => handleChange("xpPrice", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP</span>
              <Input
                type="number"
                value={form.xp}
                onChange={(e) => handleChange("xp", e.target.value)}
              />
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-course-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

// ─── Edit Course Dialog (updated fields) ──────────
function EditCourseDialog({
  course,
  onClose,
  onUpdate,
}: {
  course: AdminCourse | null;
  onClose: () => void;
  onUpdate: (courseId: string, data: Partial<AdminCourse>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<AdminCourse>>(
    course
      ? {
          title: course.title,
          subtitle: course.subtitle,
          description: course.description,
          category: course.category,
          categories: course.categories,
          gradient: course.gradient,
          imageUrl: course.imageUrl,
          durationSeconds: course.durationSeconds ?? course.duration,
          views: course.views,
          sortOrder: course.sortOrder,
          xpPrice: course.xpPrice,
          xp: course.xp,
          level: course.level,
        }
      : {},
  );
  const [submitting, setSubmitting] = useState(false);

  if (!course) return null;

  const handleChange = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate(course.id, form);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!course} onOpenChange={onClose}>
      <Dialog.Header>Edit Course</Dialog.Header>
      <Dialog.Body>
        <form
          id="edit-course-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={(form.title as string) || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Subtitle</span>
            <Input
              value={(form.subtitle as string) || ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Description</span>
            <Input
              value={(form.description as string) || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Category</span>
            <Input
              value={(form.category as string) || ""}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">
              Categories (comma separated)
            </span>
            <Input
              value={
                Array.isArray(form.categories) ? form.categories.join(",") : ""
              }
              onChange={(e) =>
                handleChange(
                  "categories",
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Image URL</span>
            <Input
              value={(form.imageUrl as string) || ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Level</span>
            <Input
              value={(form.level as string) || ""}
              onChange={(e) => handleChange("level", e.target.value)}
              placeholder="e.g. مبتدی, متوسط, پیشرفته"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">Duration (s)</span>
              <Input
                type="number"
                value={form.durationSeconds || 0}
                onChange={(e) =>
                  handleChange("durationSeconds", Number(e.target.value))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Views</span>
              <Input
                type="number"
                value={form.views || 0}
                onChange={(e) => handleChange("views", Number(e.target.value))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Sort Order</span>
              <Input
                type="number"
                value={form.sortOrder || 1}
                onChange={(e) =>
                  handleChange("sortOrder", Number(e.target.value))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP Price</span>
              <Input
                type="number"
                value={form.xpPrice || 0}
                onChange={(e) =>
                  handleChange("xpPrice", Number(e.target.value))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP</span>
              <Input
                type="number"
                value={form.xp || 0}
                onChange={(e) => handleChange("xp", Number(e.target.value))}
              />
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-course-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function DeleteCourseDialog({
  course,
  onClose,
  onConfirm,
}: {
  course: AdminCourse | null;
  onClose: () => void;
  onConfirm: (courseId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!course) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(course.id);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!course} onOpenChange={onClose}>
      <Dialog.Header>Delete Course</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{course.title}</strong>? This
          action cannot be undone.
        </p>
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

function AddEpisodeDialog({
  courseId,
  open,
  onOpenChange,
  onCreated,
}: {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    imageUrl: "",
    videoUrl: "",
    durationSeconds: "0",
    xp: "0",
    sortOrder: "1",
    views: "0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createEpisode(courseId, {
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        durationSeconds: Number(form.durationSeconds),
        xp: Number(form.xp),
        sortOrder: Number(form.sortOrder),
        views: Number(form.views) || 0,
      });
      onCreated();
      setForm({
        title: "",
        subtitle: "",
        description: "",
        category: "",
        imageUrl: "",
        videoUrl: "",
        durationSeconds: "0",
        xp: "0",
        sortOrder: "1",
        views: "0",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create episode";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>
        Add Episode
      </Dialog.Header>
      <Dialog.Body>
        <form
          id="add-episode-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Subtitle</span>
            <Input
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Description</span>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Category</span>
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Image URL</span>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Video URL</span>
            <Input
              value={form.videoUrl}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-bold">Duration (s)</span>
              <Input
                type="number"
                value={form.durationSeconds}
                onChange={(e) =>
                  handleChange("durationSeconds", e.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP</span>
              <Input
                type="number"
                value={form.xp}
                onChange={(e) => handleChange("xp", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Sort Order</span>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Views</span>
              <Input
                type="number"
                value={form.views}
                onChange={(e) => handleChange("views", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Start at 0 usually.
              </p>
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-episode-form" disabled={submitting}>
            {submitting ? "Adding..." : "Add Episode"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function EditEpisodeDialog({
  episode,
  open,
  onOpenChange,
  onUpdate,
}: {
  episode: Episode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: Partial<Episode>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: episode.title,
    subtitle: episode.subtitle || "",
    description: episode.description || "",
    category: episode.category || "",
    imageUrl: episode.imageUrl || episode.coverUrl || "",
    videoUrl: episode.videoUrl || "",
    durationSeconds: String(episode.durationSeconds ?? episode.time ?? 0),
    xp: String(episode.xp || 0),
    sortOrder: String(episode.sortOrder || 0),
    views: String(episode.views || 0),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync form when episode prop changes (dialog opened for different episode)
  useEffect(() => {
    setForm({
      title: episode.title,
      subtitle: episode.subtitle || "",
      description: episode.description || "",
      category: episode.category || "",
      imageUrl: episode.imageUrl || episode.coverUrl || "",
      videoUrl: episode.videoUrl || "",
      durationSeconds: String(episode.durationSeconds ?? episode.time ?? 0),
      xp: String(episode.xp || 0),
      sortOrder: String(episode.sortOrder || 0),
      views: String(episode.views || 0),
    });
    setError("");
  }, [episode]);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onUpdate({
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        durationSeconds: Number(form.durationSeconds),
        xp: Number(form.xp),
        sortOrder: Number(form.sortOrder),
        views: Number(form.views) || 0,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update episode");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>
        Edit Episode
      </Dialog.Header>
      <Dialog.Body>
        <form
          id="edit-episode-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Subtitle</span>
            <Input
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Description</span>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Category</span>
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Image / Cover URL</span>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Video URL</span>
            <Input
              value={form.videoUrl}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-bold">Duration (s)</span>
              <Input
                type="number"
                value={form.durationSeconds}
                onChange={(e) =>
                  handleChange("durationSeconds", e.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP</span>
              <Input
                type="number"
                value={form.xp}
                onChange={(e) => handleChange("xp", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Sort Order</span>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Views</span>
              <Input
                type="number"
                value={form.views}
                onChange={(e) => handleChange("views", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Usually updated automatically.
              </p>
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="edit-episode-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
