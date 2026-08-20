"use client";

import { useState } from "react";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
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
import { getErrorMessage, humanize, userLabel } from "@/lib/utils";
import type { AdminEntry } from "@/types/api-types";

interface AdminsTableProps {
  admins: AdminEntry[];
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
  onCreate: (data: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export function AdminsTable({
  admins,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
  onDelete,
}: AdminsTableProps) {
  const confirmDelete = useConfirmDelete();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleDelete = (admin: AdminEntry) => {
    confirmDelete({
      entityLabel: "admin",
      entityName: userLabel(admin),
      description: (
        <>
          Remove <strong className="text-foreground">{userLabel(admin)}</strong>{" "}
          as an admin? They revert to a regular user immediately.
        </>
      ),
      onConfirm: () => onDelete(admin.id),
    });
  };

  const currentPage = meta.offset / meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>Admins</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-1" /> Add admin
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admins..."
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
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableEmptyState colSpan={5}>No admins found.</TableEmptyState>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-bold">
                      {userLabel(admin)}
                    </TableCell>
                    <TableCell>{humanize(admin.role)}</TableCell>
                    <TableCell>{admin.phone || "—"}</TableCell>
                    <TableCell>{admin.email || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove admin"
                        onClick={() => handleDelete(admin)}
                      >
                        <Trash2 className="size-4 text-destructive" />
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
            {meta.totalItems} total admins
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

      <CreateAdminDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
    </Card>
  );
}

function CreateAdminDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ name, phone, email });
      onOpenChange(false);
      setName("");
      setPhone("");
      setEmail("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add the admin"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        Add Admin
      </Dialog.Header>
      <Dialog.Body>
        <form id="add-admin-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <FormField label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Phone" required>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </FormField>
          <FormField label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
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
          <Button type="submit" form="add-admin-form" disabled={submitting}>
            {submitting ? "Creating..." : "Add Admin"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
