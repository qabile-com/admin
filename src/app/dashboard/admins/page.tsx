"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAdmins } from "@/hooks/use-admins";
import { AdminsTable } from "@/features/admins/admins-table";

export default function AdminsPage() {
  const ready = useRequireAuth();
  const adminsHook = useAdmins({ limit: 10, offset: 0 });

  if (!ready) return null;

  return (
    <AdminShell
      title="Admins"
      description="Grant and revoke administrator access."
    >
      <AdminsTable
        admins={adminsHook.admins}
        loading={adminsHook.loading}
        error={adminsHook.error}
        meta={adminsHook.meta}
        onSearch={adminsHook.setSearchQuery}
        onPageChange={adminsHook.setPage}
        onCreate={adminsHook.addAdmin}
        onDelete={adminsHook.removeAdmin}
      />
    </AdminShell>
  );
}
