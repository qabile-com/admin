"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
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
import { getErrorMessage, humanize } from "@/lib/utils";
import type { Achievement } from "@/types/api-types";

interface AchievementsTableProps {
  achievements: Achievement[];
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
  onCreate: (data: Partial<Achievement>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Achievement>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AchievementsTable({
  achievements,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onUpdate,
  onDelete,
}: AchievementsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editDialog, setEditDialog] = useState<Achievement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.offset / meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>Achievements</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 size-4" /> New achievement
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search achievements..."
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading achievements...
                  </TableCell>
                </TableRow>
              ) : achievements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No achievements found.
                  </TableCell>
                </TableRow>
              ) : (
                achievements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-bold">{a.title}</TableCell>
                    <TableCell>{a.slug}</TableCell>
                    <TableCell title={a.triggerType}>
                      {humanize(a.triggerType)}
                    </TableCell>
                    <TableCell>{a.threshold}</TableCell>
                    <TableCell>
                      <Badge variant={a.isActive ? "success" : "muted"}>
                        {a.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit achievement"
                          onClick={() => setEditDialog(a)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete achievement"
                          onClick={() => setDeleteId(a.id)}
                        >
                          <Trash2 className="size-4 text-red-300" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {meta.totalItems} total achievements
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-muted-foreground">
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

      {/* Create Dialog */}
      <CreateAchievementDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />

      {/* Edit Dialog */}
      <EditAchievementDialog
        achievement={editDialog}
        onClose={() => setEditDialog(null)}
        onUpdate={onUpdate}
      />

      {/* Delete Dialog */}
      <DeleteAchievementDialog
        id={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </Card>
  );
}

// ─── Dialogs ──────────────────────────────────────────

function CreateAchievementDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Achievement>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    imageUrl: "",
    triggerType: "eligible_activity_count",
    isRepeatable: true,
    isShareable: true,
    isActive: true,
    threshold: "1",
    xpEarned: "0",
    config: "{}",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let config: Record<string, unknown> = {};
    if (form.config.trim()) {
      try {
        config = JSON.parse(form.config);
      } catch {
        setError("Config must be valid JSON.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        slug: form.slug,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || null,
        triggerType: form.triggerType,
        isRepeatable: form.isRepeatable,
        isShareable: form.isShareable,
        isActive: form.isActive,
        threshold: Number(form.threshold),
        xpEarned: Number(form.xpEarned),
        config,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create the achievement"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>New Achievement</Dialog.Header>
      <Dialog.Body>
        <form
          id="create-ach-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <label className="space-y-2">
            <span className="text-sm font-bold">Slug</span>
            <Input
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
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
            <span className="text-sm font-bold">Image URL</span>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Trigger Type</span>
            <Input
              value={form.triggerType}
              onChange={(e) => handleChange("triggerType", e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">Threshold</span>
              <Input
                type="number"
                value={form.threshold}
                onChange={(e) => handleChange("threshold", e.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP earned</span>
              <Input
                type="number"
                value={form.xpEarned}
                onChange={(e) => handleChange("xpEarned", e.target.value)}
                required
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-bold">Config (JSON)</span>
            <Input
              value={form.config}
              onChange={(e) => handleChange("config", e.target.value)}
              placeholder="{}"
            />
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRepeatable}
                onChange={(e) => handleChange("isRepeatable", e.target.checked)}
              />
              <span className="text-sm">Repeatable</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isShareable}
                onChange={(e) => handleChange("isShareable", e.target.checked)}
              />
              <span className="text-sm">Shareable</span>
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-ach-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function EditAchievementDialog({
  achievement,
  onClose,
  onUpdate,
}: {
  achievement: Achievement | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Achievement>) => Promise<void>;
}) {
  // Lazily seeded from the prop. The parent remounts this via `key`, so the
  // initializer re-runs whenever a different achievement is opened.
  const [form, setForm] = useState<Partial<Achievement>>(() =>
    achievement
      ? {
          slug: achievement.slug,
          title: achievement.title,
          description: achievement.description,
          imageUrl: achievement.imageUrl,
          triggerType: achievement.triggerType,
          isRepeatable: achievement.isRepeatable,
          isShareable: achievement.isShareable,
          isActive: achievement.isActive,
          threshold: achievement.threshold,
          xpEarned: achievement.xpEarned,
          config: achievement.config,
        }
      : {},
  );
  const [submitting, setSubmitting] = useState(false);

  if (!achievement) return null;

  const handleChange = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate(achievement.id, form);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <Dialog.Header>Edit Achievement</Dialog.Header>
      <Dialog.Body>
        <form id="edit-ach-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-bold">Slug</span>
            <Input
              value={(form.slug as string) || ""}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Title</span>
            <Input
              value={(form.title as string) || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              required
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
            <span className="text-sm font-bold">Image URL</span>
            <Input
              value={(form.imageUrl as string) || ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Trigger Type</span>
            <Input
              value={(form.triggerType as string) || ""}
              onChange={(e) => handleChange("triggerType", e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">Threshold</span>
              <Input
                type="number"
                value={form.threshold ?? 0}
                onChange={(e) =>
                  handleChange("threshold", Number(e.target.value))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">XP earned</span>
              <Input
                type="number"
                value={form.xpEarned ?? 0}
                onChange={(e) =>
                  handleChange("xpEarned", Number(e.target.value))
                }
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-bold">Config (JSON)</span>
            <Input
              value={JSON.stringify(form.config || {})}
              onChange={(e) => {
                try {
                  handleChange("config", JSON.parse(e.target.value));
                } catch {}
              }}
            />
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive as boolean}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRepeatable as boolean}
                onChange={(e) => handleChange("isRepeatable", e.target.checked)}
              />
              <span className="text-sm">Repeatable</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isShareable as boolean}
                onChange={(e) => handleChange("isShareable", e.target.checked)}
              />
              <span className="text-sm">Shareable</span>
            </label>
          </div>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-ach-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function DeleteAchievementDialog({
  id,
  onClose,
  onConfirm,
}: {
  id: string | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!id) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(id);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!id} onOpenChange={onClose}>
      <Dialog.Header>Delete Achievement</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this achievement? This action cannot
          be undone.
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
