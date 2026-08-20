"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { TableEmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage, humanize, userLabel } from "@/lib/utils";
import type { AdminUser } from "@/types/api-types";

interface UsersTableProps {
  users: AdminUser[];
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
    display_name?: string;
    username?: string;
    phone?: string;
    email?: string;
  }) => Promise<void>;
}

/**
 * Browse, search, and create only — ban/verify/XP/award/delete all live on
 * the user's own /dashboard/users/[id] page now, reached by clicking a row.
 */
export function UsersTable({
  users,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onCreate,
}: UsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.offset / meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>Users</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus />
            Add user
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableEmptyState colSpan={7}>No users found.</TableEmptyState>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  >
                    <TableCell>
                      <div className="font-bold">{userLabel(user)}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email || user.username || user.id}
                      </div>
                    </TableCell>
                    <TableCell>{humanize(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Banned"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.level}</TableCell>
                    <TableCell>{user.xp.toLocaleString()}</TableCell>
                    <TableCell>{user.streak}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {meta.totalItems} total users
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

      <CreateUserDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />
    </Card>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: UsersTableProps["onCreate"];
}) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        display_name: displayName || undefined,
        username: username || undefined,
        phone: phone || undefined,
        email: email || undefined,
      });
      onOpenChange(false);
      setDisplayName("");
      setUsername("");
      setPhone("");
      setEmail("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create the user"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        Create user
      </Dialog.Header>
      <Dialog.Body>
        <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <FormField label="Display name">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </FormField>
          <FormField label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <p className="text-xs text-muted-foreground">
            All fields are optional, but supply at least a phone or an email so
            the account can sign in.
          </p>
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
          <Button type="submit" form="create-user-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
