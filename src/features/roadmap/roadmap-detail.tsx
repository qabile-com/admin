"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Map as MapIcon, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useEntityDetail } from "@/hooks/use-entity-detail";
import { useEntityForm } from "@/hooks/use-entity-form";
import { useRoadmapSteps } from "@/hooks/use-roadmap-steps";
import { deleteRoadmap, fetchRoadmaps, updateRoadmap, type RoadmapInput } from "@/lib/api-services";
import { humanize } from "@/lib/utils";
import type { Roadmap } from "@/types/api-types";

function toFormState(roadmap: Roadmap): RoadmapInput {
  return {
    title: roadmap.title,
    slug: roadmap.slug,
    description: roadmap.description,
    isActive: roadmap.isActive,
    sortOrder: roadmap.sortOrder,
  };
}

export function RoadmapDetail({ id }: { id: string }) {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();

  const { entity, loading, notFound, error, setEntity } =
    useEntityDetail<Roadmap>("roadmaps", id, (params) => fetchRoadmaps(params));

  const { form, setForm, hasChanges, discard } = useEntityForm(entity, toFormState);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const stepsHook = useRoadmapSteps(id, { limit: 100 });

  const handleDiscard = () => {
    discard();
    setSaveError("");
  };

  const handleSave = async () => {
    if (!entity || !form) return;
    setSaveError("");
    setSaving(true);
    try {
      const updated = await updateRoadmap(entity.id, form);
      setEntity(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save the roadmap");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoadmap = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "roadmap",
      entityName: entity.title,
      requireTypedConfirmation: entity.title,
      description: (
        <>
          Permanently delete <strong className="text-foreground">{entity.title}</strong>?
          This also deletes its {entity.totalSteps} step
          {entity.totalSteps === 1 ? "" : "s"}. This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        await deleteRoadmap(entity.id);
        router.push("/dashboard/roadmap");
      },
    });
  };

  const handleDeleteStep = (step: (typeof stepsHook.steps)[number]) => {
    confirmDelete({
      entityLabel: "step",
      entityName: `#${step.num} ${step.title}`,
      onConfirm: () => stepsHook.removeStep(step.id),
    });
  };

  const nextNum = stepsHook.steps.length
    ? Math.max(...stepsHook.steps.map((s) => s.num)) + 1
    : 1;

  if (notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref="/dashboard/roadmap"
            backLabel="Back to roadmaps"
            title="Roadmap not found"
          />
        }
      >
        <Card>
          <CardContent>
            <EmptyState
              icon={MapIcon}
              title="Roadmap not found"
              description="It may have been deleted, or the link is out of date."
            />
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
            backHref="/dashboard/roadmap"
            backLabel="Back to roadmaps"
            title="Couldn't load roadmap"
          />
        }
      >
        <Card>
          <CardContent>
            <EmptyState
              icon={TriangleAlert}
              iconTone="danger"
              title="Couldn't load roadmap"
              description={error.message}
            />
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      header={
        <DetailPageHeader
          backHref="/dashboard/roadmap"
          backLabel="Back to roadmaps"
          loading={loading}
          title={entity?.title ?? ""}
          badges={
            entity && (
              <Badge variant={entity.isActive ? "success" : "muted"}>
                {entity.isActive ? "Active" : "Inactive"}
              </Badge>
            )
          }
          actions={
            entity && (
              <Button variant="destructive" size="sm" onClick={handleDeleteRoadmap}>
                <Trash2 className="size-4" />
                Delete roadmap
              </Button>
            )
          }
        />
      }
    >
      {loading || !entity || !form ? (
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveError && <Alert>{saveError}</Alert>}
              <FormField label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </FormField>
              <FormField label="Slug">
                <Input
                  value={form.slug ?? ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. getting-started"
                />
              </FormField>
              <FormField label="Description">
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <FormField label="Sort order" className="max-w-xs">
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </FormField>
              <SwitchField
                label="Active"
                description="Inactive roadmaps stay hidden from learners."
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
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

          {/* Steps */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Steps</CardTitle>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/dashboard/roadmap/${id}/steps/new?num=${nextNum}`)}
              >
                <Plus className="size-4" />
                Add step
              </Button>
            </CardHeader>
            <CardContent>
              {stepsHook.loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : stepsHook.steps.length === 0 ? (
                <EmptyState
                  title="No steps yet."
                  description="Add the first one to start this roadmap."
                  className="py-8"
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...stepsHook.steps]
                        .sort((a, b) => a.num - b.num)
                        .map((step) => (
                          <TableRow
                            key={step.id}
                            className="cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/roadmap/${id}/steps/${step.id}`)
                            }
                          >
                            <TableCell className="text-xs font-bold">{step.num}</TableCell>
                            <TableCell>
                              <div className="font-bold">{step.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {step.category || "Uncategorized"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={step.type === "lesson" ? "default" : "warning"}>
                                {humanize(step.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{step.xpReward}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Edit step ${step.title}`}
                                  onClick={() =>
                                    router.push(`/dashboard/roadmap/${id}/steps/${step.id}`)
                                  }
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Delete step ${step.title}`}
                                  onClick={() => handleDeleteStep(step)}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
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
