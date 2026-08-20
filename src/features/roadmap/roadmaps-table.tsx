"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Map as MapIcon, Plus, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
import { getErrorMessage } from "@/lib/utils";
import type { Roadmap } from "@/types/api-types";
import type { RoadmapInput } from "@/lib/api-services";

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
}

/**
 * Browse, search, create only. Editing, its steps, and deleting (it
 * cascades to every step) all live on /dashboard/roadmap/[id] now.
 */
export function RoadmapsTable({
  roadmaps,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
}: RoadmapsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

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
              Click a roadmap to edit it and manage its steps
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
        {error && <Alert className="mb-4">{error.message}</Alert>}

        <div className="overflow-x-auto rounded-lg border border-border">
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
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading roadmaps...
                  </TableCell>
                </TableRow>
              ) : roadmaps.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={MapIcon}
                      title="No roadmaps yet"
                      description="Create a roadmap, then add steps to it."
                      className="px-6"
                      action={
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowCreate(true)}
                        >
                          New roadmap
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                roadmaps.map((roadmap) => (
                  <TableRow
                    key={roadmap.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/roadmap/${roadmap.id}`)}
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
                      <Badge variant={roadmap.isActive ? "success" : "muted"}>
                        {roadmap.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{roadmap.totalSteps}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
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

      <CreateRoadmapDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
    </Card>
  );
}

function CreateRoadmapDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoadmapInput) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);
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
      setTitle("");
      setSlug("");
      setDescription("");
      setSortOrder("1");
      setIsActive(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create the roadmap"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        New roadmap
      </Dialog.Header>
      <Dialog.Body>
        <form id="roadmap-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <FormField label="Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </FormField>
          <FormField label="Slug">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. getting-started"
            />
          </FormField>
          <FormField label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <FormField label="Sort order">
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </FormField>
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
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="roadmap-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
