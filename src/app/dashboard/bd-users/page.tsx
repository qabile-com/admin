"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { BdUsersTable } from "@/features/bd-users/bd-users-table";
import { useBdUsers } from "@/hooks/use-bd-users";

export default function BdUsersPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { users, meta, loading, error, setSearchQuery, setPage, assignUser, removeUser } = useBdUsers();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/");
    }
  }, [mounted, accessToken, router]);

  if (!mounted) return null;

  return (
    <AdminShell
      title="BD Users"
      description="Manage the business-development programme and referrals."
    >
      <BdUsersTable
        users={users}
        loading={loading}
        error={error}
        meta={meta}
        onSearch={setSearchQuery}
        onPageChange={setPage}
        onAssign={assignUser}
        onRemove={removeUser}
      />
    </AdminShell>
  );
}
