"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
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
import { Dialog } from "@/components/ui/dialog";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  const confirmDelete = useConfirmDelete();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editDialog, setEditDialog] = useState<Achievement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleDelete = (achievement: Achievement) => {
    confirmDelete({
      entityLabel: "achievement",
      entityName: achievement.title,
      onConfirm: () => onDelete(achievement.id),
    });
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
        {error && <Alert className="mb-4">{error.message}</Alert>}

        <div className="overflow-x-auto rounded-lg border border-border">
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
                <TableEmptyState colSpan={6}>No achievements found.</TableEmptyState>
              ) : (
                achievements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-bold">{a.title}</TableCell>
                    <TableCell className="font-mono text-xs">{a.slug}</TableCell>
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
                          onClick={() => handleDelete(a)}
                        >
                          <Trash2 className="size-4 text-destructive" />
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

      <AchievementDialog open={showCreate} onOpenChange={setShowCreate} onSubmit={onCreate} />
      <AchievementDialog
        key={editDialog?.id}
        achievement={editDialog}
        open={!!editDialog}
        onOpenChange={(open) => !open && setEditDialog(null)}
        onSubmit={async (data) => {
          if (editDialog) await onUpdate(editDialog.id, data);
        }}
      />
    </Card>
  );
}

// ─── Create/edit dialog ─────────────────────────────────
const TRIGGER_PRESETS = [
  "eligible_activity_count",
  "course_completed",
  "streak_days",
  "referral_count",
  "forum_post_count",
  "xp_milestone",
];
const CUSTOM_TRIGGER = "__custom__";

function AchievementDialog({
  achievement,
  open,
  onOpenChange,
  onSubmit,
}: {
  achievement?: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Achievement>) => Promise<void>;
}) {
  const isEdit = !!achievement;

  // Seeded directly from props rather than via useEntityForm: the parent remounts this
  // dialog with key={editDialog?.id} on every open, and these fields derive from
  // achievement (trigger preset vs. custom trigger, JSON-stringified config) rather than
  // mapping 1:1 to it, so the simpler entity->form hook doesn't fit here.
  const initialTriggerType = achievement?.triggerType ?? TRIGGER_PRESETS[0];
  const isKnownTrigger = TRIGGER_PRESETS.includes(initialTriggerType);

  const [slug, setSlug] = useState(achievement?.slug ?? "");
  const [title, setTitle] = useState(achievement?.title ?? "");
  const [description, setDescription] = useState(achievement?.description ?? "");
  const [imageUrl, setImageUrl] = useState(achievement?.imageUrl ?? "");
  const [triggerPreset, setTriggerPreset] = useState(
    isKnownTrigger ? initialTriggerType : CUSTOM_TRIGGER,
  );
  const [customTrigger, setCustomTrigger] = useState(isKnownTrigger ? "" : initialTriggerType);
  const [threshold, setThreshold] = useState(String(achievement?.threshold ?? 1));
  const [xpEarned, setXpEarned] = useState(String(achievement?.xpEarned ?? 0));
  const [configText, setConfigText] = useState(
    JSON.stringify(achievement?.config ?? {}, null, 2),
  );
  const [isActive, setIsActive] = useState(achievement?.isActive ?? true);
  const [isRepeatable, setIsRepeatable] = useState(achievement?.isRepeatable ?? true);
  const [isShareable, setIsShareable] = useState(achievement?.isShareable ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const triggerType = triggerPreset === CUSTOM_TRIGGER ? customTrigger : triggerPreset;

  let configError = "";
  if (configText.trim()) {
    try {
      JSON.parse(configText);
    } catch {
      configError = "Not valid JSON";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let config: Record<string, unknown> = {};
    if (configText.trim()) {
      try {
        config = JSON.parse(configText);
      } catch {
        setError("Config must be valid JSON.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        slug,
        title,
        description,
        imageUrl: imageUrl || null,
        triggerType,
        isRepeatable,
        isShareable,
        isActive,
        threshold: Number(threshold),
        xpEarned: Number(xpEarned),
        config,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, `Failed to ${isEdit ? "save" : "create"} the achievement`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        {isEdit ? "Edit achievement" : "New achievement"}
      </Dialog.Header>
      <Dialog.Body>
        <form id="achievement-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Slug" required>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </FormField>
            <FormField label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </FormField>
          </div>
          <FormField label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <FormField label="Image URL">
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Trigger type">
              <Select
                value={triggerPreset}
                onChange={(e) => setTriggerPreset(e.target.value)}
              >
                {TRIGGER_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {humanize(preset)}
                  </option>
                ))}
                <option value={CUSTOM_TRIGGER}>Other (custom)</option>
              </Select>
            </FormField>
            {triggerPreset === CUSTOM_TRIGGER && (
              <FormField label="Custom trigger type" required>
                <Input
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  placeholder="e.g. weekly_login_streak"
                  required
                />
              </FormField>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Threshold" required>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
            </FormField>
            <FormField label="XP earned" required>
              <Input
                type="number"
                value={xpEarned}
                onChange={(e) => setXpEarned(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Config (JSON)" error={configError}>
            <Textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              rows={4}
              className="font-mono text-xs"
              placeholder="{}"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Active" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={isRepeatable}
                onCheckedChange={setIsRepeatable}
                aria-label="Repeatable"
              />
              Repeatable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={isShareable}
                onCheckedChange={setIsShareable}
                aria-label="Shareable"
              />
              Shareable
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
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="achievement-form"
            disabled={submitting || !!configError}
          >
            {submitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
