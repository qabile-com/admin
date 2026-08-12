"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Trash2, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistEditor, type ChecklistItem } from "@/components/ui/checklist-editor";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import {
  createRoadmapStep,
  deleteRoadmapStep,
  fetchRoadmapSteps,
  updateRoadmapStep,
  type RoadmapStepInput,
} from "@/lib/api-services";
import { getErrorMessage, humanize } from "@/lib/utils";
import type { RoadmapStep, RoadmapStepType } from "@/types/api-types";

function toFormState(roadmapId: string, step: RoadmapStep): RoadmapStepInput {
  return {
    roadmapId,
    num: step.num,
    title: step.title,
    category: step.category,
    type: step.type,
    introText: step.introText,
    contentText: step.contentText,
    steps: step.steps,
    xpReward: step.xpReward,
  };
}

export function StepDetail({
  roadmapId,
  stepId,
  defaultNum = 1,
}: {
  roadmapId: string;
  stepId: string;
  defaultNum?: number;
}) {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const isCreate = stepId === "new";
  const backHref = `/dashboard/roadmap/${roadmapId}`;

  const { entity, loading, notFound, error, setEntity } = useEntityDetail<RoadmapStep>(
    `roadmap-steps:${roadmapId}`,
    isCreate ? null : stepId,
    (params) => fetchRoadmapSteps(roadmapId, params),
  );

  const emptyForm: RoadmapStepInput = {
    roadmapId,
    num: defaultNum,
    title: "",
    category: "",
    type: "lesson",
    introText: "",
    contentText: "",
    steps: [],
    xpReward: 0,
  };

  const [form, setForm] = useState<RoadmapStepInput>(emptyForm);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (entity) setForm(toFormState(roadmapId, entity));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const hasChanges = isCreate
    ? true
    : !!entity && JSON.stringify(form) !== JSON.stringify(toFormState(roadmapId, entity));

  const handleDiscard = () => {
    if (entity) setForm(toFormState(roadmapId, entity));
    setSaveError("");
  };

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      if (isCreate) {
        const created = await createRoadmapStep(roadmapId, form);
        router.push(`/dashboard/roadmap/${roadmapId}/steps/${created.id}`);
      } else if (entity) {
        const updated = await updateRoadmapStep(roadmapId, entity.id, form);
        setEntity(updated);
        setSavedAt(new Date().toLocaleTimeString());
      }
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, "Failed to save the step"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "step",
      entityName: `#${entity.num} ${entity.title}`,
      onConfirm: async () => {
        await deleteRoadmapStep(roadmapId, entity.id);
        router.push(backHref);
      },
    });
  };

  if (!isCreate && notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader backHref={backHref} backLabel="Back to roadmap" title="Step not found" />
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <ListChecks className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Step not found</p>
              <p className="text-sm text-muted-foreground">
                It may have been deleted, or the link is out of date.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  if (!isCreate && error) {
    return (
      <AdminShell
        header={
          <DetailPageHeader backHref={backHref} backLabel="Back to roadmap" title="Couldn't load step" />
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

  const stillLoading = !isCreate && (loading || !entity);

  return (
    <AdminShell
      header={
        <DetailPageHeader
          backHref={backHref}
          backLabel="Back to roadmap"
          loading={stillLoading}
          title={isCreate ? "New step" : `#${entity?.num} ${entity?.title ?? ""}`}
          badges={
            !isCreate &&
            entity && (
              <Badge variant={entity.type === "lesson" ? "default" : "warning"}>
                {humanize(entity.type)}
              </Badge>
            )
          }
          actions={
            !isCreate &&
            entity && (
              <Button variant="destructive" size="sm" onClick={handleDeleteStep}>
                <Trash2 className="size-4" />
                Delete step
              </Button>
            )
          }
        />
      }
    >
      {stillLoading ? (
        <div className="h-96 animate-pulse rounded-xl bg-[var(--glass-2)]" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Step details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveError && (
              <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                {saveError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Number" required>
                <Input
                  type="number"
                  value={form.num}
                  onChange={(e) => setForm({ ...form, num: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Type">
                <Select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as RoadmapStepType })
                  }
                >
                  <option value="lesson">Lesson</option>
                  <option value="exercise">Exercise</option>
                </Select>
              </FormField>
              <FormField label="XP reward" required>
                <Input
                  type="number"
                  value={form.xpReward}
                  onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                />
              </FormField>
            </div>

            <FormField label="Title" required>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormField>

            <FormField label="Category" required>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </FormField>

            <FormField label="Intro text" required>
              <Textarea
                value={form.introText}
                onChange={(e) => setForm({ ...form, introText: e.target.value })}
                rows={3}
              />
            </FormField>

            <FormField label="Content text">
              <Textarea
                value={form.contentText ?? ""}
                onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                rows={8}
              />
            </FormField>

            <ChecklistEditor
              items={(form.steps ?? []) as ChecklistItem[]}
              onChange={(items) =>
                setForm({
                  ...form,
                  steps: items.map((it) => ({ id: it.id, text: it.text })),
                })
              }
              emptyHint="No checklist items. Learners will just see the content text."
            />
          </CardContent>
          <SaveDiscardBar
            hasChanges={hasChanges}
            saving={saving}
            savedAt={savedAt}
            saveLabel={isCreate ? "Create step" : "Save changes"}
            savingLabel={isCreate ? "Creating..." : "Saving..."}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        </Card>
      )}
    </AdminShell>
  );
}
