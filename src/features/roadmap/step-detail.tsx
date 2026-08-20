"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Trash2, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistEditor, type ChecklistItem } from "@/components/ui/checklist-editor";
import { useConfirmDelete } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SaveDiscardBar } from "@/components/ui/save-discard-bar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import { useEntityForm } from "@/hooks/use-entity-form";
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

  const { form, setForm, hasChanges, discard } = useEntityForm(
    entity,
    (step) => toFormState(roadmapId, step),
    { emptyForm, isCreate },
  );
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
          <CardContent>
            <EmptyState
              icon={ListChecks}
              title="Step not found"
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
          <DetailPageHeader backHref={backHref} backLabel="Back to roadmap" title="Couldn't load step" />
        }
      >
        <Card>
          <CardContent>
            <EmptyState
              icon={TriangleAlert}
              iconTone="danger"
              title="Couldn't load step"
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
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Step details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveError && <Alert>{saveError}</Alert>}
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
