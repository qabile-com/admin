"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { BdUsersTable } from "@/features/bd-users/bd-users-table";
import { useBdUsers } from "@/hooks/use-bd-users";

export default function BdUsersPage() {
  const ready = useRequireAuth();
  const { users, meta, loading, error, setSearchQuery, setPage, assignUser } =
    useBdUsers();

  if (!ready) return null;

  return (
    <AdminShell
      title="BD Users"
      description="Manage the business-development programme and referrals. Click a row for the full profile."
    >
      <BdUsersTable
        users={users}
        loading={loading}
        error={error}
        meta={meta}
        onSearch={setSearchQuery}
        onPageChange={setPage}
        onAssign={assignUser}
      />
    </AdminShell>
  );
}
