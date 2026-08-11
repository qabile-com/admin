"use client";

import { Fragment, useState } from "react";
import { ChevronDown, Search, UserPlus, UserMinus } from "lucide-react";
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
import { formatDateTime, getErrorMessage, humanize, shortId, userLabel } from "@/lib/utils";
import type { BdUser } from "@/types/api-types";

interface BdUsersTableProps {
  users: BdUser[];
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
  onRemove: (userId: string) => Promise<void>;
  onAssign: (userId: string) => Promise<void>;
}

export function BdUsersTable({
  users,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onRemove,
  onAssign,
}: BdUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<BdUser | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState("");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = assignUserId.trim();
    if (!id) return;

    setAssignError("");
    setSubmitting(true);
    try {
      await onAssign(id);
      setAssignUserId("");
      setShowAssign(false);
    } catch (err: unknown) {
      setAssignError(
        getErrorMessage(err, "Failed to assign the BD role"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentPage = meta.offset / meta.limit + 1;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>BD Users</CardTitle>
          <Button size="sm" onClick={() => setShowAssign(true)}>
            <UserPlus />
            Assign BD
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username..."
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
                <TableHead>Referral Code</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead className="w-24">Actions</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading BD users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No BD users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isOpen = openUserId === user.id;
                  return (
                    <Fragment key={user.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setOpenUserId(isOpen ? null : user.id)}
                      >
                        <TableCell>
                          <div className="font-bold">{userLabel(user)}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.username ? `@${user.username}` : user.id}
                          </div>
                        </TableCell>
                        <TableCell>{humanize(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "success" : "danger"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.xp.toLocaleString()}</TableCell>
                        <TableCell>{user.streak}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {user.referralCode}
                        </TableCell>
                        <TableCell>{user.invitedUsersCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remove from BD"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRemoveDialog(user);
                              }}
                            >
                              <UserMinus className="size-4 text-red-300" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Expand details for ${user.displayName}`}
                            className={isOpen ? "rotate-180" : ""}
                          >
                            <ChevronDown />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={10} className="bg-black/20 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Full Name
                                  </span>
                                  <span className="font-bold">
                                    {user.firstName} {user.lastName}
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
                                    Bio
                                  </span>
                                  <span className="font-bold max-w-xs truncate">
                                    {user.bio || "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Title
                                  </span>
                                  <span className="font-bold">
                                    {user.title}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Assigned At
                                  </span>
                                  <span className="font-bold">
                                    {formatDateTime(user.bdAssignedAt)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Assigned By
                                  </span>
                                  <span
                                    className="font-mono text-xs font-bold"
                                    title={user.bdAssignedByUserId ?? undefined}
                                  >
                                    {shortId(user.bdAssignedByUserId)}
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
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Achievements
                                  </span>
                                  <span className="font-bold">
                                    {user.achievements.length}
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
            {meta.totalItems} total BD users
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

      {/* Assign BD User Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <Dialog.Header onClose={() => setShowAssign(false)}>
          Assign BD program
        </Dialog.Header>
        <Dialog.Body>
          <form id="assign-bd-form" onSubmit={handleAssign} className="space-y-4">
            {assignError && (
              <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                {assignError}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Paste the ID of the user you want to add to the BD program. You
              can copy it from the Users page.
            </p>
            <label className="space-y-2">
              <span className="text-sm font-bold">User ID</span>
              <Input
                placeholder="e.g. 3f8c1a2e-..."
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                required
              />
            </label>
          </form>
        </Dialog.Body>
        <Dialog.Footer>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAssign(false);
                setAssignUserId("");
                setAssignError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="assign-bd-form" disabled={submitting}>
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </Dialog.Footer>
      </Dialog>

      {/* Remove BD User Dialog */}
      <RemoveBdUserDialog
        user={removeDialog}
        onClose={() => setRemoveDialog(null)}
        onConfirm={onRemove}
      />
    </Card>
  );
}

function RemoveBdUserDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: BdUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleRemove = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to remove the BD role"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <Dialog.Header onClose={onClose}>Remove from BD</Dialog.Header>
      <Dialog.Body>
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Remove{" "}
          <strong className="text-foreground">{userLabel(user)}</strong> from
          the BD program? Their referral history is kept.
        </p>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Yes, remove"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
