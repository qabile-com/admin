"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  Search,
  UserPlus,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Dialog } from "@/components/ui/dialog"; // You'll need a Dialog component
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
  onBan: (userId: string, isBanned: boolean, reason?: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onCreate: (data: {
    display_name: string;
    username: string;
    phone: string;
    email?: string;
  }) => Promise<void>;
}

export function UsersTable({
  users,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onBan,
  onDelete,
  onCreate,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [banDialog, setBanDialog] = useState<{ user: AdminUser } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<AdminUser | null>(null);

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
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead className="w-24">Actions</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isOpen = openUserId === user.id;
                  const isActive = user.isActive;
                  return (
                    <Fragment key={user.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setOpenUserId(isOpen ? null : user.id)}
                      >
                        <TableCell>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email || user.id}
                          </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "success" : "danger"}>
                            {isActive ? "Active" : "Banned"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.xp.toLocaleString()}</TableCell>
                        <TableCell>{user.streak}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={isActive ? "Ban user" : "Unban user"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBanDialog({ user });
                              }}
                            >
                              <Ban className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete user"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog(user);
                              }}
                            >
                              <Trash2 className="size-4 text-red-300" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Expand details for ${user.name}`}
                            className={isOpen ? "rotate-180" : ""}
                          >
                            <ChevronDown />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={8} className="bg-black/20 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Title
                                  </span>
                                  <span className="font-bold">
                                    {user.title}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Email
                                  </span>
                                  <span className="font-bold">
                                    {user.email || "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    XP to next level
                                  </span>
                                  <span className="font-bold">
                                    {user.xpMax - user.xp} / {user.xpMax}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Avatar
                                  </span>
                                  <span className="font-bold">
                                    {user.avatar || "Default"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
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

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreate}
      />

      {/* Ban / Unban Dialog */}
      <BanUserDialog
        user={banDialog?.user ?? null}
        onClose={() => setBanDialog(null)}
        onConfirm={onBan}
      />

      {/* Delete Confirmation */}
      <DeleteUserDialog
        user={deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={onDelete}
      />
    </Card>
  );
}

// ── Dialog Components (keep in same file or separate) ──────────

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      display_name: displayName,
      username,
      phone,
      email: email || undefined,
    });
    setSubmitting(false);
    onOpenChange(false);
    setDisplayName("");
    setUsername("");
    setPhone("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Card className="w-full max-w-md p-6">
        <CardTitle className="mb-4">Create user</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            placeholder="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </Dialog>
  );
}

function BanUserDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (
    userId: string,
    isBanned: boolean,
    reason?: string,
  ) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const willBan = user.isActive; // if active, we ban; if banned, we unban
  const action = willBan ? "ban" : "unban";
  const title = `Are you sure you want to ${action} ${user.name}?`;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(user.id, !user.isActive, reason || undefined);
    setLoading(false);
    onClose();
    setReason("");
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Card className="w-full max-w-sm p-6">
        <CardTitle className="mb-4 capitalize">{action} user</CardTitle>
        <p className="mb-4 text-sm text-muted-foreground">{title}</p>
        {willBan && (
          <Input
            className="mb-4"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : `Yes, ${action}`}
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}

function DeleteUserDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(user.id);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Card className="w-full max-w-sm p-6">
        <CardTitle className="mb-4">Delete user</CardTitle>
        <p className="mb-4 text-sm text-muted-foreground">
          Are you sure you want to permanently delete {user.name}? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, delete"}
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}
