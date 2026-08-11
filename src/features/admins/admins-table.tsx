"use client";

import { useState } from "react";
import { Search, UserPlus, Trash2 } from "lucide-react";
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
import { humanize, userLabel } from "@/lib/utils";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
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
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error.message}
          </div>
        )}
        <div className="overflow-x-auto">
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
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No admins found.
                  </TableCell>
                </TableRow>
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
                        onClick={() => setDeleteId(admin.id)}
                      >
                        <Trash2 className="size-4 text-red-300" />
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

      {/* Create Admin Dialog */}
      <CreateAdminDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
      {/* Delete Confirmation */}
      <DeleteAdminDialog
        adminId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, phone, email });
      onOpenChange(false);
      setName("");
      setPhone("");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>Add Admin</Dialog.Header>
      <Dialog.Body>
        <form id="add-admin-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-bold">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Phone</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
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

function DeleteAdminDialog({
  adminId,
  onClose,
  onConfirm,
}: {
  adminId: string | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!adminId) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(adminId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!adminId} onOpenChange={onClose}>
      <Dialog.Header>Remove Admin</Dialog.Header>
      <Dialog.Body>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove this admin? They will revert to a
          regular user.
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
            {loading ? "Removing..." : "Yes, remove"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
