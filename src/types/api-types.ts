// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    limit: number;
    offset: number;
    totalItems: number;
    totalPages: number;
  };
}

// User from /api/v1/admin/users
export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  avatar: string | null;
  isActive: boolean;
  // Fields added in newer swagger:
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
  phone?: string;
  isCompleteOnboarding?: boolean;
  achievements?: UserAchievement[];
}

export interface UserAchievement {
  slug: string;
  earnedAt: string;
  meta?: Record<string, unknown>;
}

// Course from /api/v1/admin/courses
export interface AdminCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  categories: string[];
  gradient: string;
  imageUrl: string;
  duration: number; // seconds (legacy)
  durationSeconds?: number; // newer field
  views: number;
  sortOrder: number;
  xp: number; // legacy?
  xpPrice?: number; // newer field
  level?: string;
}

// Episode from /api/v1/admin/courses/{courseId}/episodes
export interface Episode {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  description: string;
  category?: string;
  imageUrl?: string;
  coverUrl: string;
  videoUrl: string;
  mediaType?: string;
  time: number; // seconds (legacy)
  durationSeconds?: number; // newer
  xp: number;
  level?: string;
  sortOrder: number;
  views?: number;
  steps?: EpisodeStep[];
}

export interface EpisodeStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

// Comment from /api/v1/admin/courses/{courseId}/episodes/{episodeId}/comments
export interface EpisodeComment {
  id: string;
  courseId: string;
  episodeId: string;
  authorId: string;
  authorName: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorDisplayName?: string;
  text: string;
  moderationStatus: "approved" | "pending" | "rejected";
  moderationReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
}

// Overview response
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

export interface AdminEntry {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

export interface Activity {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Achievement definition
export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  triggerType: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRepeatable: boolean;
  isShareable: boolean;
  isActive: boolean;
  threshold: number;
  config: Record<string, unknown>;
}

// Roadmap step
export interface RoadmapStep {
  id: string;
  num: number;
  title: string;
  category: string;
  type: string;
  introText: string;
  contentText: string;
  steps: { id: string; text: string }[];
  xpReward: number;
}

// Forum post
export interface ForumPost {
  id: string;
  authorId: string;
  text: string;
  likes: number;
  location: string;
  emoji: string;
  isPinned: boolean;
  hasImage: boolean;
  attachment?: {
    id: string;
    kind: string;
    url: string;
  };
  tags: string[];
  achievement?: {
    title: string;
    sub: string;
    icon: string;
  };
  createdAt: string;
  comments: ForumComment[];
}

export interface ForumComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ForumLike {
  id: string;
  postId: string;
  user: {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  likedAt: string;
}

export interface ForumBlock {
  id: string;
  blocker: BlockUser;
  blockedUser: BlockUser;
  blockedAt: string;
}

export interface BlockUser {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  username: string;
}

// XP Rules
export interface XpRule {
  code: string;
  title: string;
  isActive: boolean;
  amount: number;
}
