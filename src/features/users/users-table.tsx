"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  Search,
  UserPlus,
  Ban,
  Trash2,
  BadgeCheck,
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
import { Dialog } from "@/components/ui/dialog";
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
  onBan: (userId: string, isBanned: boolean, reason?: string) => Promise<void>;
  onVerify: (userId: string, isVerified: boolean) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onCreate: (data: {
    display_name?: string;
    username?: string;
    phone?: string;
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
  onVerify,
  onDelete,
  onCreate,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [banDialog, setBanDialog] = useState<{ user: AdminUser } | null>(null);
  const [verifyDialog, setVerifyDialog] = useState<AdminUser | null>(null);
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
                          <div className="font-bold">{userLabel(user)}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email || user.username || user.id}
                          </div>
                        </TableCell>
                        <TableCell>{humanize(user.role)}</TableCell>
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
                              aria-label={`Verify ${userLabel(user)}`}
                              title="Verify user"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVerifyDialog(user);
                              }}
                            >
                              <BadgeCheck className="size-4" />
                            </Button>
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
                            aria-label={`Expand details for ${userLabel(user)}`}
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

      {/* Verify Dialog */}
      <VerifyUserDialog
        user={verifyDialog}
        onClose={() => setVerifyDialog(null)}
        onConfirm={onVerify}
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

// ── Dialogs ────────────────────────────────────────────────
// All of these use Dialog.Header/Body/Footer — the Dialog primitive already
// supplies the panel chrome, so nesting a <Card> inside would double it.

function DialogError({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
      {message}
    </div>
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
      setError(
        getErrorMessage(err, "Failed to create the user"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Header onClose={() => onOpenChange(false)}>
        Create user
      </Dialog.Header>
      <Dialog.Body>
        <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <DialogError message={error} />}
          <label className="space-y-2">
            <span className="text-sm font-bold">Display name</span>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Username</span>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Phone</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
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
  const [error, setError] = useState("");

  if (!user) return null;

  const willBan = user.isActive; // active -> ban, banned -> unban
  const action = willBan ? "ban" : "unban";

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(user.id, willBan, reason || undefined);
      onClose();
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>
        <span className="capitalize">{action} user</span>
      </Dialog.Header>
      <Dialog.Body>
        {error && <DialogError message={error} />}
        <p className="text-sm text-muted-foreground">
          Are you sure you want to {action}{" "}
          <strong className="text-foreground">{userLabel(user)}</strong>?
        </p>
        {willBan && (
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-bold">Reason</span>
            <Input
              placeholder="Optional — shown in the audit log"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        )}
      </Dialog.Body>
      <Dialog.Footer>
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
      </Dialog.Footer>
    </Dialog>
  );
}

function VerifyUserDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, isVerified: boolean) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const run = async (isVerified: boolean) => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(user.id, isVerified);
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to update the verification status"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>Verification</Dialog.Header>
      <Dialog.Body>
        {error && <DialogError message={error} />}
        <p className="text-sm text-muted-foreground">
          Set the verification status for{" "}
          <strong className="text-foreground">{userLabel(user)}</strong>.
        </p>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => run(false)}
            disabled={loading}
          >
            Un-verify
          </Button>
          <Button onClick={() => run(true)} disabled={loading}>
            {loading ? "Saving..." : "Verify"}
          </Button>
        </div>
      </Dialog.Footer>
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
  const [error, setError] = useState("");

  if (!user) return null;

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to delete the user"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>Delete user</Dialog.Header>
      <Dialog.Body>
        {error && <DialogError message={error} />}
        <p className="text-sm text-muted-foreground">
          Permanently delete{" "}
          <strong className="text-foreground">{userLabel(user)}</strong>? This
          cannot be undone.
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
            {loading ? "Deleting..." : "Yes, delete"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
