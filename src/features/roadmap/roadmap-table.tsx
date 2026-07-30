"use client";

import { useState } from "react";
import { Search, Plus, Pencil } from "lucide-react";
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
import type { RoadmapStep } from "@/types/api-types";

interface RoadmapTableProps {
  steps: RoadmapStep[];
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
  onCreate: (data: Partial<RoadmapStep>) => Promise<void>;
  onUpdate: (id: string, data: Partial<RoadmapStep>) => Promise<void>;
}

export function RoadmapTable({
  steps,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onUpdate,
}: RoadmapTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editDialog, setEditDialog] = useState<RoadmapStep | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.offset / meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>Roadmap Steps</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 size-4" /> New step
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmap steps..."
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
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>XP Reward</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading roadmap steps...
                  </TableCell>
                </TableRow>
              ) : steps.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No steps found.
                  </TableCell>
                </TableRow>
              ) : (
                steps.map((step) => (
                  <TableRow key={step.id}>
                    <TableCell>{step.num}</TableCell>
                    <TableCell className="font-bold">{step.title}</TableCell>
                    <TableCell>{step.category}</TableCell>
                    <TableCell>{step.type}</TableCell>
                    <TableCell>{step.xpReward} XP</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit step"
                        onClick={() => setEditDialog(step)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {meta.totalItems} total steps
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

      <CreateRoadmapDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
      <EditRoadmapDialog
        key={editDialog?.id}
        step={editDialog}
        onClose={() => setEditDialog(null)}
        onUpdate={onUpdate}
      />
    </Card>
  );
}

// ─── Create Dialog ──────────────────────────────
function CreateRoadmapDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<RoadmapStep>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    num: "",
    title: "",
    category: "",
    type: "exercise",
    introText: "",
    contentText: "",
    xpReward: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        num: Number(form.num),
        title: form.title,
        category: form.category,
        type: form.type,
        introText: form.introText,
        contentText: form.contentText,
        xpReward: Number(form.xpReward),
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
      <Dialog.Header>New Roadmap Step</Dialog.Header>
      <Dialog.Body>
        <form
          id="create-roadmap-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="space-y-2">
            <span className="text-sm font-bold">Number</span>
            <Input
              type="number"
              value={form.num}
              onChange={(e) => handleChange("num", e.target.value)}
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
            <span className="text-sm font-bold">Category</span>
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Type</span>
            <Input
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Intro Text</span>
            <Input
              value={form.introText}
              onChange={(e) => handleChange("introText", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Content Text</span>
            <Input
              value={form.contentText}
              onChange={(e) => handleChange("contentText", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">XP Reward</span>
            <Input
              type="number"
              value={form.xpReward}
              onChange={(e) => handleChange("xpReward", e.target.value)}
            />
          </label>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-roadmap-form"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────
function EditRoadmapDialog({
  step,
  onClose,
  onUpdate,
}: {
  step: RoadmapStep | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<RoadmapStep>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<RoadmapStep>>(
    step
      ? {
          num: step.num,
          title: step.title,
          category: step.category,
          type: step.type,
          introText: step.introText,
          contentText: step.contentText,
          xpReward: step.xpReward,
        }
      : {},
  );
  const [submitting, setSubmitting] = useState(false);

  if (!step) return null;

  const handleChange = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate(step.id, form);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!step} onOpenChange={onClose}>
      <Dialog.Header>Edit Roadmap Step</Dialog.Header>
      <Dialog.Body>
        <form
          id="edit-roadmap-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="space-y-2">
            <span className="text-sm font-bold">Number</span>
            <Input
              type="number"
              value={form.num || 0}
              onChange={(e) => handleChange("num", Number(e.target.value))}
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
            <span className="text-sm font-bold">Category</span>
            <Input
              value={(form.category as string) || ""}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Type</span>
            <Input
              value={(form.type as string) || ""}
              onChange={(e) => handleChange("type", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Intro Text</span>
            <Input
              value={(form.introText as string) || ""}
              onChange={(e) => handleChange("introText", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Content Text</span>
            <Input
              value={(form.contentText as string) || ""}
              onChange={(e) => handleChange("contentText", e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">XP Reward</span>
            <Input
              type="number"
              value={form.xpReward || 0}
              onChange={(e) => handleChange("xpReward", Number(e.target.value))}
            />
          </label>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-roadmap-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
