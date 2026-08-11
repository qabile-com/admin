import apiClient from "./api-client";
import type {
  AdminUser,
  AdminCourse,
  Episode,
  EpisodeComment,
  EpisodeMediaType,
  EpisodeStep,
  AdminOverview,
  PaginatedResponse,
  Achievement,
  Roadmap,
  RoadmapStep,
  RoadmapStepItem,
  RoadmapStepType,
  ForumPost,
  ForumLike,
  ForumBlock,
  ModerationStatus,
  XpRule,
  XpRuleKind,
  ForumPostCooldownRule,
  BdUser,
  InvitedUser,
  Activity,
  NotificationDispatchResponse,
} from "@/types/api-types";

/** Every list endpoint takes the same three query params. */
export interface ListParams {
  limit?: number;
  offset?: number;
  q?: string;
}

type Success = { success: boolean };

// ─── Overview ────────────────────────────────────
export const fetchOverview = () =>
  apiClient.get<AdminOverview>("/api/v1/admin/overview").then((r) => r.data);

// ─── Users ───────────────────────────────────────
export const fetchUsers = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<AdminUser>>("/api/v1/admin/users", { params })
    .then((r) => r.data);

export const createUser = (data: {
  display_name?: string;
  username?: string;
  phone?: string;
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

/** PATCH /api/v1/admin/users/{id}/verify */
export const verifyUser = (userId: string, isVerified: boolean) =>
  apiClient
    .patch<AdminUser>(`/api/v1/admin/users/${userId}/verify`, { isVerified })
    .then((r) => r.data);

export const deleteUser = (userId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/users/${userId}`)
    .then((r) => r.data);

export const awardAchievement = (userId: string, achievementId: string) =>
  apiClient
    .post<Success>(
      `/api/v1/admin/users/${userId}/achievements/${achievementId}/award`,
    )
    .then((r) => r.data);

export const modifyUserXp = (
  userId: string,
  data: { amount: number; reason?: string },
) =>
  apiClient
    .post<AdminUser>(`/api/v1/admin/users/${userId}/xp`, data)
    .then((r) => r.data);

// ─── Admins ──────────────────────────────────────
export const createAdmin = (data: {
  name: string;
  phone?: string;
  email?: string;
}) =>
  apiClient.post<AdminUser>("/api/v1/admin/admins", data).then((r) => r.data);

export const removeAdmin = (userId: string) =>
  apiClient
    .delete<AdminUser>(`/api/v1/admin/admins/${userId}`)
    .then((r) => r.data);

// ─── Courses ─────────────────────────────────────
export interface CourseInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category: string;
  categories?: string[];
  gradient?: string;
  imageUrl?: string | null;
  coverUrl?: string | null;
  durationSeconds: number;
  views: number;
  sortOrder?: number;
  xpPrice: number;
  xp?: number;
  level?: string | null;
  noTrackRequired?: boolean;
}

export const fetchCourses = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<AdminCourse>>("/api/v1/admin/courses", { params })
    .then((r) => r.data);

export const createCourse = (data: CourseInput) =>
  apiClient
    .post<AdminCourse>("/api/v1/admin/courses", data)
    .then((r) => r.data);

export const updateCourse = (courseId: string, data: Partial<CourseInput>) =>
  apiClient
    .patch<AdminCourse>(`/api/v1/admin/courses/${courseId}`, data)
    .then((r) => r.data);

export const deleteCourse = (courseId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/courses/${courseId}`)
    .then((r) => r.data);

export const reorderCourses = (items: { id: string; sortOrder: number }[]) =>
  apiClient
    .patch<
      PaginatedResponse<AdminCourse>
    >("/api/v1/admin/courses/reorder", { items })
    .then((r) => r.data);

// ─── Episodes ────────────────────────────────────
export interface EpisodeInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: EpisodeMediaType;
  durationSeconds: number;
  xp: number;
  level?: string | null;
  sortOrder?: number;
  views?: number;
  steps?: Pick<EpisodeStep, "id" | "text" | "isCompleted">[];
  noTrackRequired?: boolean;
}

export const fetchEpisodes = (courseId: string, params?: ListParams) =>
  apiClient
    .get<
      PaginatedResponse<Episode>
    >(`/api/v1/admin/courses/${courseId}/episodes`, { params })
    .then((r) => r.data);

export const createEpisode = (courseId: string, data: EpisodeInput) =>
  apiClient
    .post<Episode>(`/api/v1/admin/courses/${courseId}/episodes`, data)
    .then((r) => r.data);

export const updateEpisode = (
  courseId: string,
  episodeId: string,
  data: Partial<EpisodeInput>,
) =>
  apiClient
    .patch<Episode>(
      `/api/v1/admin/courses/${courseId}/episodes/${episodeId}`,
      data,
    )
    .then((r) => r.data);

export const deleteEpisode = (courseId: string, episodeId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/courses/${courseId}/episodes/${episodeId}`)
    .then((r) => r.data);

/**
 * DELETE /api/v1/admin/courses/{courseId}/episodes/batch/{ids}
 * `ids` is a comma-separated list embedded in the path.
 */
export const deleteEpisodesBatch = (courseId: string, episodeIds: string[]) =>
  apiClient
    .delete<Success>(
      `/api/v1/admin/courses/${courseId}/episodes/batch/${episodeIds
        .map(encodeURIComponent)
        .join(",")}`,
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

// ─── Episode comments ────────────────────────────
export const fetchEpisodeComments = (
  courseId: string,
  episodeId: string,
  params?: ListParams,
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
  data: { moderationStatus: ModerationStatus; reason?: string },
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
    .delete<Success>(
      `/api/v1/admin/courses/${courseId}/episodes/${episodeId}/comments/${commentId}`,
    )
    .then((r) => r.data);

// ─── Achievements ────────────────────────────────
export interface AchievementInput {
  slug: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  triggerType: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRepeatable: boolean;
  isShareable: boolean;
  isActive: boolean;
  threshold: number;
  xpEarned: number;
  config?: Record<string, unknown> | null;
}

export const fetchAchievements = (params?: ListParams) =>
  apiClient
    .get<
      PaginatedResponse<Achievement>
    >("/api/v1/admin/achievements", { params })
    .then((r) => r.data);

export const createAchievement = (data: AchievementInput) =>
  apiClient
    .post<Achievement>("/api/v1/admin/achievements", data)
    .then((r) => r.data);

export const updateAchievement = (id: string, data: AchievementInput) =>
  apiClient
    .patch<Achievement>(`/api/v1/admin/achievements/${id}`, data)
    .then((r) => r.data);

export const deleteAchievement = (id: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/achievements/${id}`)
    .then((r) => r.data);

// ─── Roadmaps ────────────────────────────────────
export interface RoadmapInput {
  slug?: string | null;
  title: string;
  description?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export const fetchRoadmaps = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<Roadmap>>("/api/v1/admin/roadmaps", { params })
    .then((r) => r.data);

export const createRoadmap = (data: RoadmapInput) =>
  apiClient.post<Roadmap>("/api/v1/admin/roadmaps", data).then((r) => r.data);

export const updateRoadmap = (id: string, data: Partial<RoadmapInput>) =>
  apiClient
    .patch<Roadmap>(`/api/v1/admin/roadmaps/${id}`, data)
    .then((r) => r.data);

export const deleteRoadmap = (id: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/roadmaps/${id}`)
    .then((r) => r.data);

// ─── Roadmap steps (nested under a roadmap) ──────
export interface RoadmapStepInput {
  roadmapId: string;
  num: number;
  title: string;
  category: string;
  type: RoadmapStepType;
  introText: string;
  contentText?: string | null;
  steps?: RoadmapStepItem[];
  xpReward: number;
}

export const fetchRoadmapSteps = (roadmapId: string, params?: ListParams) =>
  apiClient
    .get<
      PaginatedResponse<RoadmapStep>
    >(`/api/v1/admin/roadmaps/${roadmapId}/steps`, { params })
    .then((r) => r.data);

export const createRoadmapStep = (
  roadmapId: string,
  data: RoadmapStepInput,
) =>
  apiClient
    .post<RoadmapStep>(`/api/v1/admin/roadmaps/${roadmapId}/steps`, data)
    .then((r) => r.data);

export const updateRoadmapStep = (
  roadmapId: string,
  stepId: string,
  data: RoadmapStepInput,
) =>
  apiClient
    .patch<RoadmapStep>(
      `/api/v1/admin/roadmaps/${roadmapId}/steps/${stepId}`,
      data,
    )
    .then((r) => r.data);

export const deleteRoadmapStep = (roadmapId: string, stepId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/roadmaps/${roadmapId}/steps/${stepId}`)
    .then((r) => r.data);

// ─── Forum ───────────────────────────────────────
export const fetchForumPosts = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<ForumPost>>("/api/v1/admin/forum/posts", { params })
    .then((r) => r.data);

export const fetchForumPostLikes = (postId: string, params?: ListParams) =>
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
    .delete<Success>(`/api/v1/admin/forum/posts/${postId}`)
    .then((r) => r.data);

export const deleteForumComment = (commentId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/forum/comments/${commentId}`)
    .then((r) => r.data);

export const fetchForumBlocks = (params?: ListParams) =>
  apiClient
    .get<
      PaginatedResponse<ForumBlock>
    >("/api/v1/admin/forum/blocks", { params })
    .then((r) => r.data);

// ─── Activities ──────────────────────────────────
export const fetchActivities = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<Activity>>("/api/v1/admin/activities", { params })
    .then((r) => r.data);

// ─── XP rules (signup + referral share one shape) ─
export const fetchXpRule = (kind: XpRuleKind) =>
  apiClient.get<XpRule>(`/api/v1/admin/xp-rules/${kind}`).then((r) => r.data);

export const updateXpRule = (
  kind: XpRuleKind,
  data: { isActive: boolean; amount: number },
) =>
  apiClient
    .patch<XpRule>(`/api/v1/admin/xp-rules/${kind}`, data)
    .then((r) => r.data);

export const fetchSignupXpRule = () => fetchXpRule("signup");
export const updateSignupXpRule = (data: {
  isActive: boolean;
  amount: number;
}) => updateXpRule("signup", data);

export const fetchReferralXpRule = () => fetchXpRule("referral");
export const updateReferralXpRule = (data: {
  isActive: boolean;
  amount: number;
}) => updateXpRule("referral", data);

// ─── Forum post cooldown (API unit is SECONDS) ────
export const fetchForumPostCooldownRule = () =>
  apiClient
    .get<ForumPostCooldownRule>("/api/v1/admin/forum/post-cooldown")
    .then((r) => r.data);

export const updateForumPostCooldownRule = (data: {
  isActive: boolean;
  seconds: number;
}) =>
  apiClient
    .patch<ForumPostCooldownRule>("/api/v1/admin/forum/post-cooldown", data)
    .then((r) => r.data);

// ─── BD users ────────────────────────────────────
export const fetchBdUsers = (params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<BdUser>>("/api/v1/admin/bd-users", { params })
    .then((r) => r.data);

export const assignBdUser = (userId: string) =>
  apiClient
    .post<BdUser>(`/api/v1/admin/bd-users/${userId}`)
    .then((r) => r.data);

export const removeBdUser = (userId: string) =>
  apiClient
    .delete<Success>(`/api/v1/admin/bd-users/${userId}`)
    .then((r) => r.data);

export const fetchInvitedUsers = (userId: string, params?: ListParams) =>
  apiClient
    .get<PaginatedResponse<InvitedUser>>(
      `/api/v1/admin/users/${userId}/invited-users`,
      { params },
    )
    .then((r) => r.data);

// ─── Push notifications ──────────────────────────
export interface SendNotificationInput {
  title: string;
  body: string;
  /** Target specific users. Omit when `sendToAll` is true. */
  userIds?: string[];
  sendToAll?: boolean;
  /** Custom string data payload delivered with the push. */
  data?: Record<string, string>;
  imageUrl?: string | null;
  link?: string | null;
}

export const sendNotification = (payload: SendNotificationInput) =>
  apiClient
    .post<NotificationDispatchResponse>(
      "/api/v1/admin/notifications/send",
      payload,
    )
    .then((r) => r.data);
