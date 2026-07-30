"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "@/features/users/users-table";

export default function UsersPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/");
    }
  }, [mounted, accessToken, router]);

  const usersHook = useUsers({ limit: 10, offset: 0 });

  if (!mounted) return null;

  return (
    <AdminShell>
      <UsersTable
        users={usersHook.users}
        loading={usersHook.loading}
        error={usersHook.error}
        meta={usersHook.meta}
        onSearch={usersHook.setSearchQuery}
        onPageChange={usersHook.setPage}
        onBan={usersHook.toggleBan}
        onDelete={usersHook.removeUser}
        onCreate={usersHook.addUser}
      />
    </AdminShell>
  );
}
