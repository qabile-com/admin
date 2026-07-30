import apiClient from "./api-client";
import type {
  AdminUser,
  AdminCourse,
  Episode,
  EpisodeComment,
  AdminOverview,
  PaginatedResponse,
  Achievement,
  RoadmapStep,
  ForumPost,
  ForumLike,
  ForumBlock,
  XpRule,
  Activity,
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

export const awardAchievement = (userId: string, achievementId: string) =>
  apiClient
    .post<{
      success: boolean;
    }>(`/api/v1/admin/users/${userId}/achievements/${achievementId}/award`)
    .then((r) => r.data);

export const modifyUserXp = (
  userId: string,
  data: { amount: number; reason: string },
) =>
  apiClient
    .post<AdminUser>(`/api/v1/admin/users/${userId}/xp`, data)
    .then((r) => r.data);

// ─── Admins ──────────────────────────────────────
export const createAdmin = (data: {
  name: string;
  phone: string;
  email: string;
}) =>
  apiClient.post<AdminUser>("/api/v1/admin/admins", data).then((r) => r.data);

export const removeAdmin = (userId: string) =>
  apiClient
    .delete<AdminUser>(`/api/v1/admin/admins/${userId}`)
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

export const createEpisode = (
  courseId: string,
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    videoUrl?: string;
    durationSeconds?: number;
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

export const updateEpisode = (
  courseId: string,
  episodeId: string,
  data: Partial<Episode>,
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
    .patch<
      PaginatedResponse<Episode>
    >(`/api/v1/admin/courses/${courseId}/episodes/reorder`, { items })
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
    }>(`/api/v1/admin/courses/${courseId}/episodes/${episodeId}/comments/${commentId}`)
    .then((r) => r.data);

// ─── Achievements ────────────────────────────────
export const fetchAchievements = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<
      PaginatedResponse<Achievement>
    >("/api/v1/admin/achievements", { params })
    .then((r) => r.data);

export const createAchievement = (data: Partial<Achievement>) =>
  apiClient
    .post<Achievement>("/api/v1/admin/achievements", data)
    .then((r) => r.data);

export const updateAchievement = (id: string, data: Partial<Achievement>) =>
  apiClient
    .patch<Achievement>(`/api/v1/admin/achievements/${id}`, data)
    .then((r) => r.data);

export const deleteAchievement = (id: string) =>
  apiClient
    .delete<{ success: boolean }>(`/api/v1/admin/achievements/${id}`)
    .then((r) => r.data);

// ─── Roadmap Steps ───────────────────────────────
export const fetchRoadmapSteps = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<
      PaginatedResponse<RoadmapStep>
    >("/api/v1/admin/roadmap/steps", { params })
    .then((r) => r.data);

export const createRoadmapStep = (data: Partial<RoadmapStep>) =>
  apiClient
    .post<RoadmapStep>("/api/v1/admin/roadmap/steps", data)
    .then((r) => r.data);

export const updateRoadmapStep = (id: string, data: Partial<RoadmapStep>) =>
  apiClient
    .patch<RoadmapStep>(`/api/v1/admin/roadmap/steps/${id}`, data)
    .then((r) => r.data);

// ─── Forum Posts ─────────────────────────────────
export const fetchForumPosts = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<PaginatedResponse<ForumPost>>("/api/v1/admin/forum/posts", { params })
    .then((r) => r.data);

export const fetchForumPostLikes = (
  postId: string,
  params?: { limit?: number; offset?: number; q?: string },
) =>
  apiClient
    .get<
      PaginatedResponse<ForumLike>
    >(`/api/v1/admin/forum/posts/${postId}/likes`, { params })
    .then((r) => r.data);

export const pinForumPost = (postId: string, isPinned: boolean) =>
  apiClient
    .patch<ForumPost>(`/api/v1/admin/forum/posts/${postId}`, { isPinned })
    .then((r) => r.data);

export const deleteForumPost = (postId: string) =>
  apiClient
    .delete<{ success: boolean }>(`/api/v1/admin/forum/posts/${postId}`)
    .then((r) => r.data);

export const deleteForumComment = (commentId: string) =>
  apiClient
    .delete<{ success: boolean }>(`/api/v1/admin/forum/comments/${commentId}`)
    .then((r) => r.data);

export const fetchForumBlocks = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<
      PaginatedResponse<ForumBlock>
    >("/api/v1/admin/forum/blocks", { params })
    .then((r) => r.data);

// ─── Activities ──────────────────────────────────
export const fetchActivities = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) =>
  apiClient
    .get<PaginatedResponse<Activity>>("/api/v1/admin/activities", { params })
    .then((r) => r.data);

// ─── XP Rules ────────────────────────────────────
export const fetchSignupXpRule = () =>
  apiClient.get<XpRule>("/api/v1/admin/xp-rules/signup").then((r) => r.data);

export const updateSignupXpRule = (data: {
  isActive: boolean;
  amount: number;
}) =>
  apiClient
    .patch<XpRule>("/api/v1/admin/xp-rules/signup", data)
    .then((r) => r.data);
