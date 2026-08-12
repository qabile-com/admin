"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Map as MapIcon, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useEntityDetail } from "@/hooks/use-entity-detail";
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

  const [form, setForm] = useState<RoadmapInput | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (entity) setForm(toFormState(entity));
  }, [entity]);

  const stepsHook = useRoadmapSteps(id, { limit: 100 });

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
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <MapIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Roadmap not found</p>
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
            backHref="/dashboard/roadmap"
            backLabel="Back to roadmaps"
            title="Couldn't load roadmap"
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
          <div className="h-56 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-40 animate-pulse rounded-xl bg-[var(--glass-2)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap details</CardTitle>
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
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--glass-2)]" />
                  ))}
                </div>
              ) : stepsHook.steps.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No steps yet. Add the first one to start this roadmap.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/5">
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
                                  <Trash2 className="size-4 text-red-300" />
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
