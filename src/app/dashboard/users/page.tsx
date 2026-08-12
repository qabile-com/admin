"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "@/features/users/users-table";

export default function UsersPage() {
  const ready = useRequireAuth();
  const usersHook = useUsers({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Users"
      description="Search members and manage accounts. Click a row for the full profile."
    >
      <UsersTable
        users={usersHook.users}
        loading={usersHook.loading}
        error={usersHook.error}
        meta={usersHook.meta}
        onSearch={usersHook.setSearchQuery}
        onPageChange={usersHook.setPage}
        onCreate={usersHook.addUser}
      />
    </AdminShell>
  );
}
