"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, UserPlus } from "lucide-react";
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
import { UserPickerDialog } from "./user-picker-dialog";
import { humanize, userLabel } from "@/lib/utils";
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
  onAssign: (userId: string) => Promise<void>;
}

/**
 * Browse, search, and assign only — removing a BD user, and everything else
 * about them, lives on the shared /dashboard/users/[id] profile page (a
 * BdUser is an AdminUser, so BD and plain Users both land on the same page).
 */
export function BdUsersTable({
  users,
  loading,
  error,
  meta,
  onSearch,
  onPageChange,
  onAssign,
}: BdUsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssign, setShowAssign] = useState(false);

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

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Invited</TableHead>
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
                    Loading BD users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No BD users found.
                  </TableCell>
                </TableRow>
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
                        {user.username ? `@${user.username}` : user.id}
                      </div>
                    </TableCell>
                    <TableCell>{humanize(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.referralCode}
                    </TableCell>
                    <TableCell>{user.invitedUsersCount}</TableCell>
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

      {/* Assign BD User — pick from the live user list */}
      <UserPickerDialog
        open={showAssign}
        onOpenChange={setShowAssign}
        onConfirm={onAssign}
        title="Assign BD program"
        confirmLabel="Assign BD"
        excludeIds={users.map((u) => u.id)}
        excludeLabel="Already BD"
      />
    </Card>
  );
}
