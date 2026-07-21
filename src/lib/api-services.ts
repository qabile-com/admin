import apiClient from "./api-client";
import type {
  AdminUser,
  AdminCourse,
  Episode,
  EpisodeComment,
  AdminOverview,
  PaginatedResponse,
} from "@/types/api-types";

// ─── Overview ────────────────────────────────────
export const fetchOverview = () =>
  apiClient.get<AdminOverview>("/api/v1/admin/overview").then((r) => r.data);

// ─── Users ───────────────────────────────────────
export const fetchUsers = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<PaginatedResponse<AdminUser>>("/api/v1/admin/users", { params })
    .then((r) => r.data);

export const createUser = (data: {
  display_name: string;
  username: string;
  phone: string;
  email?: string;
}) =>
  apiClient.post<AdminUser>("/api/v1/admin/users", data).then((r) => r.data);

export const banUser = (
  userId: string,
  payload: { isBanned: boolean; reason?: string },
) =>
  apiClient
    .patch<AdminUser>(`/api/v1/admin/users/${userId}/ban`, payload)
    .then((r) => r.data);

export const deleteUser = (userId: string) =>
  apiClient
    .delete<{ success: boolean }>(`/api/v1/admin/users/${userId}`)
    .then((r) => r.data);

// ─── Courses ─────────────────────────────────────
export const fetchCourses = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<PaginatedResponse<AdminCourse>>("/api/v1/admin/courses", { params })
    .then((r) => r.data);

export const createCourse = (data: Partial<AdminCourse>) =>
  apiClient
    .post<AdminCourse>("/api/v1/admin/courses", data)
    .then((r) => r.data);

export const updateCourse = (courseId: string, data: Partial<AdminCourse>) =>
  apiClient
    .patch<AdminCourse>(`/api/v1/admin/courses/${courseId}`, data)
    .then((r) => r.data);

export const deleteCourse = (courseId: string) =>
  apiClient
    .delete<{ success: boolean }>(`/api/v1/admin/courses/${courseId}`)
    .then((r) => r.data);

export const reorderCourses = (items: { id: string; sortOrder: number }[]) =>
  apiClient
    .patch<
      PaginatedResponse<AdminCourse>
    >("/api/v1/admin/courses/reorder", { items })
    .then((r) => r.data);

// ─── Episodes ────────────────────────────────────
export const fetchEpisodes = (
  courseId: string,
  params?: { limit?: number; offset?: number; q?: string },
) =>
  apiClient
    .get<
      PaginatedResponse<Episode>
    >(`/api/v1/admin/courses/${courseId}/episodes`, { params })
    .then((r) => r.data);

export const updateEpisode = (
  courseId: string,
  episodeId: string,
  data: { sortOrder?: number; views?: number },
) =>
  apiClient
    .patch<Episode>(
      `/api/v1/admin/courses/${courseId}/episodes/${episodeId}`,
      data,
    )
    .then((r) => r.data);

export const reorderEpisodes = (
  courseId: string,
  items: { id: string; sortOrder: number }[],
) =>
  apiClient
    .patch<PaginatedResponse<Episode>>(
      `/api/v1/admin/courses/${courseId}/episodes/reorder`,
      {
        items,
      },
    )
    .then((r) => r.data);

// ─── Comments ────────────────────────────────────
export const fetchEpisodeComments = (
  courseId: string,
  episodeId: string,
  params?: { limit?: number; offset?: number; q?: string },
) =>
  apiClient
    .get<
      PaginatedResponse<EpisodeComment>
    >(`/api/v1/admin/courses/${courseId}/episodes/${episodeId}/comments`, { params })
    .then((r) => r.data);

export const moderateComment = (
  courseId: string,
  episodeId: string,
  commentId: string,
  data: { moderationStatus: string; reason?: string },
) =>
  apiClient
    .patch<EpisodeComment>(
      `/api/v1/admin/courses/${courseId}/episodes/${episodeId}/comments/${commentId}`,
      data,
    )
    .then((r) => r.data);

export const deleteComment = (
  courseId: string,
  episodeId: string,
  commentId: string,
) =>
  apiClient
    .delete<{
      success: boolean;
    }>(
      `/api/v1/admin/courses/${courseId}/episodes/${episodeId}/comments/${commentId}`,
    )
    .then((r) => r.data);

// Add this function after other episode functions
export const createEpisode = (
  courseId: string,
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    videoUrl?: string;
    time?: number;
    xp?: number;
    sortOrder?: number;
    views?: number;
    steps?: { id?: string; text: string; isCompleted?: boolean }[];
  },
) =>
  apiClient
    .post<Episode>(`/api/v1/admin/courses/${courseId}/episodes`, data)
    .then((r) => r.data);
