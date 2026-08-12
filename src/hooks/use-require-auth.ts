"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Redirects to "/" once mounted if there's no access token. Every dashboard
 * page repeated this exact mounted+redirect dance; centralized here.
 *
 * Returns `true` once it's safe to render the authenticated page (mounted on
 * the client AND a token is present) — callers should `if (!ready) return null;`.
 */
export function useRequireAuth(): boolean {
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

  return mounted && !!accessToken;
}
