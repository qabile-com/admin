// Types mirror https://api-web.qabilebyadam.com/api/docs
// Fields the API marks `nullable: true` are typed `| null` here.

// Generic paginated response — PaginatedResponseDto + PaginationMetaDto
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  totalItems: number;
  totalPages: number;
}

export type UserRole = "user" | "admin" | "super_admin" | "adam";

// UserResponseDto — /api/v1/admin/users
export interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  email: string | null;
  role: UserRole;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  avatar: string | null;
  isActive: boolean;
  isCompleteOnboarding: boolean;
  isBd: boolean;
  achievements: UserAchievement[];
  /** Not part of UserResponseDto — only present on AdminUserDto (overview.admins). */
  phone?: string | null;
  /** Legacy convenience field kept for older call sites; prefer `userLabel()`. */
  name?: string;
}

// AuthUserDto — returned by /api/v1/auth/login, /otp/verify, /google, /refresh
export interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  email: string | null;
  role: UserRole;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  isCompleteOnboarding: boolean;
}

// AuthLoginResponseDto
export interface AuthLoginResponse {
  mode: "otp" | "password";
  success?: boolean;
  message?: string;
  expiresIn?: number;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiredAt?: string;
  refreshTokenExpiredAt?: string;
  user?: AuthUser;
  isNewUser?: boolean;
}

// UserAchievementSummaryDto
export interface UserAchievement {
  slug: string;
  earnedAt: string;
  meta: Record<string, unknown> | null;
}

// AdminCourseResponseDto — /api/v1/admin/courses
export interface AdminCourse {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  categories: string[];
  gradient: string;
  imageUrl: string | null;
  durationSeconds: number;
  views: number;
  sortOrder: number;
  xpPrice: number;
  xp: number;
  level: string | null;
  /** When true the course is watchable without progress tracking / completion gating. */
  noTrackRequired: boolean;
  /** Accepted by Create/UpdateCourseDto but not returned by AdminCourseResponseDto. */
  coverUrl?: string | null;
}

export type EpisodeMediaType = "video" | "audio";

// AdminCourseEpisodeResponseDto
export interface Episode {
  id: string;
  courseId: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  mediaType: EpisodeMediaType;
  durationSeconds: number;
  xp: number;
  level: string | null;
  sortOrder: number;
  views: number;
  steps: EpisodeStep[];
  /** When true the episode is watchable without progress tracking / completion gating. */
  noTrackRequired: boolean;
}

// AdminCourseEpisodeStepDto
export interface EpisodeStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type ModerationStatus = "approved" | "pending" | "rejected";

// AdminCourseCommentResponseDto
export interface EpisodeComment {
  id: string;
  courseId: string;
  episodeId: string;
  authorId: string;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorDisplayName: string | null;
  text: string;
  moderationStatus: ModerationStatus;
  moderationReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
}

// AdminOverviewResponseDto
export interface AdminOverview {
  adminsCount: number;
  usersCount: number;
  coursesCount: number;
  roadmapStepsCount: number;
  forumPostsCount: number;
  forumCommentsCount: number;
  bannedUsersCount: number;
  admins: AdminEntry[];
  recentActivities: Activity[];
}

// AdminUserDto
export interface AdminEntry {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  role: UserRole;
  phone: string | null;
  email: string | null;
}

// AdminActivityItemResponseDto
export interface Activity {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// AdminAchievementResponseDto
export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  triggerType: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRepeatable: boolean;
  isShareable: boolean;
  isActive: boolean;
  threshold: number;
  xpEarned: number;
  config: Record<string, unknown> | null;
}

// AdminRoadmapResponseDto — /api/v1/admin/roadmaps
export interface Roadmap {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  totalSteps: number;
}

export type RoadmapStepType = "lesson" | "exercise";

// AdminRoadmapStepResponseDto — /api/v1/admin/roadmaps/{roadmapId}/steps
export interface RoadmapStep {
  id: string;
  roadmapId: string;
  num: number;
  title: string;
  category: string;
  type: RoadmapStepType;
  introText: string;
  contentText: string | null;
  steps: RoadmapStepItem[];
  xpReward: number;
}

// RoadmapStepItemDto
export interface RoadmapStepItem {
  id: string;
  text: string;
}

// AdminForumUserAccountResponseDto
export interface ForumUserAccount {
  id: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}

// AdminForumAttachmentResponseDto
export interface ForumAttachment {
  id: string;
  kind: string;
  url: string;
}

// AdminForumPostResponseDto
export interface ForumPost {
  id: string;
  authorId: string;
  text: string;
  likes: number;
  location: string | null;
  emoji: string | null;
  isPinned: boolean;
  hasImage: boolean;
  attachment: ForumAttachment | null;
  attachments: ForumAttachment[];
  tags: string[];
  achievement: { title: string; sub: string; icon: string } | null;
  createdAt: string;
  comments: ForumComment[];
}

// AdminForumCommentResponseDto
export interface ForumComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

// AdminForumPostLikeResponseDto
export interface ForumLike {
  id: string;
  postId: string;
  user: ForumUserAccount;
  likedAt: string;
}

// AdminForumBlockResponseDto
export interface ForumBlock {
  id: string;
  blocker: ForumUserAccount;
  blockedUser: ForumUserAccount;
  blockedAt: string;
}

/** @deprecated Use `ForumUserAccount`. */
export type BlockUser = ForumUserAccount;

// AdminXpRewardRuleResponseDto — /api/v1/admin/xp-rules/{signup,referral}
export interface XpRule {
  code: string;
  title: string;
  isActive: boolean;
  amount: number;
}

export type XpRuleKind = "signup" | "referral";

// AdminForumPostCooldownResponseDto — note: the API stores SECONDS, not hours.
export interface ForumPostCooldownRule {
  code: string;
  title: string;
  isActive: boolean;
  seconds: number;
}

// AdminBdUserResponseDto — /api/v1/admin/bd-users
export interface BdUser extends AdminUser {
  referralCode: string | null;
  invitedUsersCount: number;
  bdAssignedAt: string;
  bdAssignedByUserId: string | null;
}

// AdminInvitedUserResponseDto — /api/v1/admin/users/{id}/invited-users
export interface InvitedUser extends AdminUser {
  joinedAt: string;
  usedReferralCode: string | null;
}

// AdminNotificationDispatchResultDto — /api/v1/admin/notifications/send
export interface NotificationDispatchResult {
  requestedUsersCount: number | null;
  targetedTokensCount: number;
  successCount: number;
  failureCount: number;
  removedInvalidTokensCount: number;
}

export interface NotificationDispatchResponse {
  data: NotificationDispatchResult;
}
