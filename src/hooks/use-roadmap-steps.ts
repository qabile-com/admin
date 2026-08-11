"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchRoadmapSteps,
  createRoadmapStep,
  updateRoadmapStep,
  deleteRoadmapStep,
  type ListParams,
  type RoadmapStepInput,
} from "@/lib/api-services";
import type { RoadmapStep, PaginatedResponse } from "@/types/api-types";

/**
 * Steps are nested under a roadmap: /api/v1/admin/roadmaps/{roadmapId}/steps
 * Pass `roadmapId: null` to stay idle (e.g. before a roadmap is selected).
 */
export function useRoadmapSteps(
  roadmapId: string | null,
  initialParams: ListParams = {},
) {
  const [data, setData] = useState<RoadmapStep[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ListParams>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    if (!roadmapId) {
      setData([]);
      setMeta({ totalItems: 0, totalPages: 0, limit: 10, offset: 0 });
      setLoading(false);
      return;
    }

    cancelledRef.current = false;
    setLoading(true);
    fetchRoadmapSteps(roadmapId, params)
      .then((res: PaginatedResponse<RoadmapStep>) => {
        if (cancelledRef.current) return;
        setData(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
  }, [roadmapId, params]);

  useEffect(() => {
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  const setSearchQuery = (q: string) =>
    setParams((prev) => ({ ...prev, q, offset: 0 }));

  const setPage = (page: number) =>
    setParams((prev) => ({ ...prev, offset: (page - 1) * (prev.limit || 10) }));

  const addStep = async (input: RoadmapStepInput) => {
    if (!roadmapId) return;
    await createRoadmapStep(roadmapId, input);
    load();
  };

  const editStep = async (stepId: string, input: RoadmapStepInput) => {
    if (!roadmapId) return;
    await updateRoadmapStep(roadmapId, stepId, input);
    load();
  };

  const removeStep = async (stepId: string) => {
    if (!roadmapId) return;
    await deleteRoadmapStep(roadmapId, stepId);
    load();
  };

  return {
    steps: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addStep,
    editStep,
    removeStep,
    refetch: load,
  };
}
