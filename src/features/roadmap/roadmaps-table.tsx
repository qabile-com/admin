"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  GripVertical,
  Map as MapIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SwitchField } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createRoadmapStep,
  deleteRoadmapStep,
  fetchRoadmapSteps,
  updateRoadmapStep,
  type RoadmapInput,
  type RoadmapStepInput,
} from "@/lib/api-services";
import { getErrorMessage, humanize } from "@/lib/utils";
import type {
  Roadmap,
  RoadmapStep,
  RoadmapStepItem,
  RoadmapStepType,
} from "@/types/api-types";

interface RoadmapsTableProps {
  roadmaps: Roadmap[];
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
  onCreate: (data: RoadmapInput) => Promise<void>;
  onUpdate: (id: string, data: Partial<RoadmapInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function RoadmapsTable({
  roadmaps,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onUpdate,
  onDelete,
}: RoadmapsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openRoadmapId, setOpenRoadmapId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editDialog, setEditDialog] = useState<Roadmap | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Roadmap | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.limit ? meta.offset / meta.limit + 1 : 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Roadmaps</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Expand a roadmap to manage its steps
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            New roadmap
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmaps..."
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
                <TableHead className="w-14">Order</TableHead>
                <TableHead>Roadmap</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead className="w-20">Actions</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading roadmaps...
                  </TableCell>
                </TableRow>
              ) : roadmaps.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                      <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
                        <MapIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">No roadmaps yet</p>
                        <p className="text-sm text-muted-foreground">
                          Create a roadmap, then add steps to it.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowCreate(true)}
                      >
                        New roadmap
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roadmaps.map((roadmap) => {
                  const isOpen = openRoadmapId === roadmap.id;
                  return (
                    <Fragment key={roadmap.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() =>
                          setOpenRoadmapId(isOpen ? null : roadmap.id)
                        }
                      >
                        <TableCell className="text-xs font-bold">
                          {roadmap.sortOrder}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">{roadmap.title}</div>
                          {roadmap.slug && (
                            <div className="font-mono text-xs text-muted-foreground">
                              {roadmap.slug}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden max-w-sm truncate text-muted-foreground md:table-cell">
                          {roadmap.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={roadmap.isActive ? "success" : "muted"}
                          >
                            {roadmap.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{roadmap.totalSteps}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${roadmap.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDialog(roadmap);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${roadmap.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog(roadmap);
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
                            aria-label={`Expand steps for ${roadmap.title}`}
                            className={isOpen ? "rotate-180" : ""}
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={7} className="bg-black/20 p-4">
                            <RoadmapStepsPanel roadmapId={roadmap.id} />
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
            {meta.totalItems} total roadmaps
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
              Page {currentPage} of {meta.totalPages || 1}
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

      <RoadmapDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
      <RoadmapDialog
        key={editDialog?.id}
        roadmap={editDialog}
        open={!!editDialog}
        onOpenChange={(open) => !open && setEditDialog(null)}
        onSubmit={async (data) => {
          if (editDialog) await onUpdate(editDialog.id, data);
        }}
      />
      <DeleteRoadmapDialog
        roadmap={deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={onDelete}
      />
    </Card>
  );
}

// ─── Steps panel (nested under a roadmap) ──────────────────
function RoadmapStepsPanel({ roadmapId }: { roadmapId: string }) {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editStep, setEditStep] = useState<RoadmapStep | null>(null);
  const [deleteStep, setDeleteStep] = useState<RoadmapStep | null>(null);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    cancelledRef.current = false;
    setLoading(true);
    fetchRoadmapSteps(roadmapId, { limit: 100 })
      .then((res) => {
        if (cancelledRef.current) return;
        setSteps([...res.data].sort((a, b) => a.num - b.num));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelledRef.current) return;
        setError(getErrorMessage(err, "Failed to load steps"));
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
  }, [roadmapId]);

  useEffect(() => {
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  const nextNum = steps.length
    ? Math.max(...steps.map((s) => s.num)) + 1
    : 1;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Steps
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="size-4" />
            Add step
          </Button>
        </div>

        {loading ? (
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-[var(--glass-2)]"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-4 text-sm text-red-300">{error}</p>
        ) : steps.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No steps yet. Add the first one to start this roadmap.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="rounded-lg border bg-black/20 p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold">
                        #{step.num}
                      </span>
                      <p className="font-bold">{step.title}</p>
                      <Badge
                        variant={
                          step.type === "lesson" ? "default" : "warning"
                        }
                      >
                        {humanize(step.type)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.category || "Uncategorized"} · {step.xpReward} XP ·{" "}
                      {step.steps?.length ?? 0} item
                      {(step.steps?.length ?? 0) === 1 ? "" : "s"}
                    </p>
                    {step.introText && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {step.introText}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit step ${step.title}`}
                      onClick={() => setEditStep(step)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete step ${step.title}`}
                      onClick={() => setDeleteStep(step)}
                    >
                      <Trash2 className="size-4 text-red-300" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RoadmapStepDialog
        roadmapId={roadmapId}
        defaultNum={nextNum}
        open={showCreate}
        onOpenChange={setShowCreate}
        onSaved={load}
      />
      <RoadmapStepDialog
        key={editStep?.id}
        roadmapId={roadmapId}
        step={editStep}
        open={!!editStep}
        onOpenChange={(open) => !open && setEditStep(null)}
        onSaved={load}
      />
      <DeleteStepDialog
        roadmapId={roadmapId}
        step={deleteStep}
        onClose={() => setDeleteStep(null)}
        onDeleted={load}
      />
    </div>
  );
}

// ─── Roadmap create/edit dialog ────────────────────────────
function RoadmapDialog({
  roadmap,
  open,
  onOpenChange,
  onSubmit,
}: {
  roadmap?: Roadmap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoadmapInput) => Promise<void>;
}) {
  const isEdit = !!roadmap;
  const [title, setTitle] = useState(roadmap?.title ?? "");
  const [slug, setSlug] = useState(roadmap?.slug ?? "");
  const [description, setDescription] = useState(roadmap?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(roadmap?.sortOrder ?? 1));
  const [isActive, setIsActive] = useState(roadmap?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        slug: slug || null,
        description: description || null,
        isActive,
        sortOrder: Number(sortOrder),
      });
      onOpenChange(false);
      if (!isEdit) {
        setTitle("");
        setSlug("");
        setDescription("");
        setSortOrder("1");
        setIsActive(true);
      }
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to save the roadmap"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>
        {isEdit ? "Edit roadmap" : "New roadmap"}
      </Dialog.Header>
      <Dialog.Body>
        <form id="roadmap-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Slug</span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. getting-started"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Description</span>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Sort order</span>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </label>
          <SwitchField
            label="Active"
            description="Inactive roadmaps stay hidden from learners."
            checked={isActive}
            onCheckedChange={setIsActive}
          />
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
          <Button type="submit" form="roadmap-form" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function DeleteRoadmapDialog({
  roadmap,
  onClose,
  onConfirm,
}: {
  roadmap: Roadmap | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!roadmap) return null;

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(roadmap.id);
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to delete the roadmap"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!roadmap} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>Delete roadmap</Dialog.Header>
      <Dialog.Body>
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-400/10">
            <TriangleAlert className="size-4 text-red-300" />
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              Delete <strong>{roadmap.title}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This removes the roadmap and its {roadmap.totalSteps} step
              {roadmap.totalSteps === 1 ? "" : "s"}. This cannot be undone.
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
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

// ─── Step create/edit dialog ───────────────────────────────
function RoadmapStepDialog({
  roadmapId,
  step,
  defaultNum = 1,
  open,
  onOpenChange,
  onSaved,
}: {
  roadmapId: string;
  step?: RoadmapStep | null;
  defaultNum?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const isEdit = !!step;
  const [num, setNum] = useState(String(step?.num ?? defaultNum));
  const [title, setTitle] = useState(step?.title ?? "");
  const [category, setCategory] = useState(step?.category ?? "");
  const [type, setType] = useState<RoadmapStepType>(step?.type ?? "lesson");
  const [introText, setIntroText] = useState(step?.introText ?? "");
  const [contentText, setContentText] = useState(step?.contentText ?? "");
  const [xpReward, setXpReward] = useState(String(step?.xpReward ?? 0));
  const [items, setItems] = useState<RoadmapStepItem[]>(step?.steps ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setNum(String(step?.num ?? defaultNum));
    setTitle(step?.title ?? "");
    setCategory(step?.category ?? "");
    setType(step?.type ?? "lesson");
    setIntroText(step?.introText ?? "");
    setContentText(step?.contentText ?? "");
    setXpReward(String(step?.xpReward ?? 0));
    setItems(step?.steps ?? []);
    setError("");
  }, [open, step, defaultNum]);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: `new-${prev.length + 1}-${prev.length}`, text: "" },
    ]);

  const updateItem = (index: number, text: string) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text } : item)),
    );

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload: RoadmapStepInput = {
      roadmapId,
      num: Number(num),
      title,
      category,
      type,
      introText,
      contentText: contentText || null,
      steps: items.filter((item) => item.text.trim()),
      xpReward: Number(xpReward),
    };

    try {
      if (isEdit && step) {
        await updateRoadmapStep(roadmapId, step.id, payload);
      } else {
        await createRoadmapStep(roadmapId, payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save the step"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>
        {isEdit ? "Edit step" : "New step"}
      </Dialog.Header>
      <Dialog.Body>
        <form
          id="roadmap-step-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-bold">Number</span>
              <Input
                type="number"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Type</span>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as RoadmapStepType)}
              >
                <option value="lesson">Lesson</option>
                <option value="exercise">Exercise</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP reward</span>
              <Input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Category</span>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Intro text</span>
            <Textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={3}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Content text</span>
            <Textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={6}
            />
          </label>

          {/* Checklist items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Checklist items</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={addItem}
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="rounded-lg border border-border bg-black/10 p-3 text-xs text-muted-foreground">
                No checklist items. Learners will just see the content text.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={item.text}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() => removeItem(index)}
                    >
                      <X className="size-4 text-red-300" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
          <Button type="submit" form="roadmap-step-form" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function DeleteStepDialog({
  roadmapId,
  step,
  onClose,
  onDeleted,
}: {
  roadmapId: string;
  step: RoadmapStep | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!step) return null;

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await deleteRoadmapStep(roadmapId, step.id);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to delete the step"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!step} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>Delete step</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">
          Delete step #{step.num} <strong>{step.title}</strong>? This cannot be
          undone.
        </p>
        {error && (
          <div className="mt-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
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
