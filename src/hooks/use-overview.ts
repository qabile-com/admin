"use client";

import { useEffect, useState, useRef } from "react";
import { fetchOverview } from "@/lib/api-services";
import type { AdminOverview } from "@/types/api-types";

export function useOverview() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cancelledRef = useRef(false);

  const load = () => {
    setLoading(true);
    cancelledRef.current = false;
    fetchOverview()
      .then((overview) => {
        if (!cancelledRef.current) {
          setData(overview);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return { data, loading, error, refetch: load };
}
