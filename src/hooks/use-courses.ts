"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
} from "@/lib/api-services";
import type { AdminCourse, PaginatedResponse } from "@/types/api-types";

interface UseCoursesOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useCourses(initialParams: UseCoursesOptions = {}) {
  const [data, setData] = useState<AdminCourse[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<UseCoursesOptions>(initialParams);
  const cancelledRef = useRef(false);

  const load = useCallback(() => {
    // setLoading(true);
    cancelledRef.current = false;
    fetchCourses(params)
      .then((response: PaginatedResponse<AdminCourse>) => {
        if (!cancelledRef.current) {
          setData(response.data);
          setMeta(response.meta);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      })
      .finally(() => {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      });
  }, [params]);

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

  const addCourse = async (courseData: Parameters<typeof createCourse>[0]) => {
    await createCourse(courseData);
    load();
  };

  const editCourse = async (courseId: string, data: Partial<AdminCourse>) => {
    await updateCourse(courseId, data);
    load();
  };

  const removeCourse = async (courseId: string) => {
    await deleteCourse(courseId);
    load();
  };

  const reorder = async (items: { id: string; sortOrder: number }[]) => {
    await reorderCourses(items);
    load();
  };

  return {
    courses: data,
    meta,
    loading,
    error,
    setSearchQuery,
    setPage,
    addCourse,
    editCourse,
    removeCourse,
    reorder,
    refetch: load,
  };
}
