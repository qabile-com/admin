"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookPlus,
  ChevronRight,
  MoveDown,
  MoveUp,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
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
import { formatDuration, getErrorMessage } from "@/lib/utils";
import type { AdminCourse } from "@/types/api-types";

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
  onReorder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
}

/**
 * Browse, search, create, and reorder only. Editing a course and managing
 * its episodes both live on /dashboard/courses/[id] now (reached by
 * clicking a row) — including course delete, since it cascades to episodes
 * and their comments and deserves to be actioned somewhere that shows what's
 * about to go with it, not a quick row button.
 */
export function CoursesTable({
  courses,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onReorder,
}: CoursesTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

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
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading courses...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => {
                  const durationSec = course.durationSeconds ?? 0;
                  return (
                    <TableRow
                      key={course.id}
                      className="cursor-pointer hover:bg-white/[0.035]"
                      onClick={() => router.push(`/dashboard/courses/${course.id}`)}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{course.title}</span>
                          {course.noTrackRequired && (
                            <Badge variant="muted" title="No progress tracking required">
                              No-track
                            </Badge>
                          )}
                        </div>
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
                        {formatDuration(durationSec)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {course.views.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
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
    </Card>
  );
}

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
  const [noTrackRequired, setNoTrackRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        category: form.category,
        categories: form.categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        gradient: form.gradient,
        imageUrl: form.imageUrl,
        durationSeconds: Number(form.durationSeconds),
        views: Number(form.views),
        sortOrder: Number(form.sortOrder),
        xpPrice: Number(form.xpPrice),
        xp: Number(form.xp),
        level: form.level || undefined,
        noTrackRequired,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create the course"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        New Course
      </Dialog.Header>
      <Dialog.Body>
        <form
          id="create-course-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <FormField label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Subtitle">
              <Input
                value={form.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
              />
            </FormField>
            <FormField label="Category">
              <Input
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Description">
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Categories" hint="Comma separated">
              <Input
                value={form.categories}
                onChange={(e) => handleChange("categories", e.target.value)}
              />
            </FormField>
            <FormField label="Level">
              <Input
                value={form.level}
                onChange={(e) => handleChange("level", e.target.value)}
                placeholder="e.g. مبتدی, متوسط, پیشرفته"
              />
            </FormField>
          </div>
          <FormField label="Image URL">
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormField label="Duration (s)">
              <Input
                type="number"
                value={form.durationSeconds}
                onChange={(e) => handleChange("durationSeconds", e.target.value)}
              />
            </FormField>
            <FormField label="Views" hint="Usually 0">
              <Input
                type="number"
                value={form.views}
                onChange={(e) => handleChange("views", e.target.value)}
              />
            </FormField>
            <FormField label="Sort Order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
              />
            </FormField>
            <FormField label="XP Price">
              <Input
                type="number"
                value={form.xpPrice}
                onChange={(e) => handleChange("xpPrice", e.target.value)}
              />
            </FormField>
            <FormField label="XP">
              <Input
                type="number"
                value={form.xp}
                onChange={(e) => handleChange("xp", e.target.value)}
              />
            </FormField>
          </div>

          <SwitchField
            label="No tracking required"
            description="Learners can watch this course without progress tracking or completion gating."
            checked={noTrackRequired}
            onCheckedChange={setNoTrackRequired}
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
          <Button type="submit" form="create-course-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
