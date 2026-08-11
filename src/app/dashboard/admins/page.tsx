"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { useAdmins } from "@/hooks/use-admins"; // We'll create this hook
import { AdminsTable } from "@/features/admins/admins-table";

export default function AdminsPage() {
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

  const adminsHook = useAdmins({ limit: 10, offset: 0 });

  if (!mounted) return null;

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
