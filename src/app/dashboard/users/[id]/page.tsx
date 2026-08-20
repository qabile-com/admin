"use client";

import { use } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { UserDetail } from "@/features/users/user-detail";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ready = useRequireAuth();

  if (!ready) return null;

  // UserDetail renders its own <AdminShell> — see the note in user-detail.tsx.
  // key={id} forces a full remount if the id ever changes without an unmount,
  // so stale prop-seeded state can't leak between two different entities.
  return <UserDetail key={id} id={id} />;
}
