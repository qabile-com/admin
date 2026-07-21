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
  duration: number; // seconds
  views: number;
  sortOrder: number;
  xp: number;
}

// Episode from /api/v1/admin/courses/{courseId}/episodes
export interface Episode {
  id: string;
  courseId: string;
  title: string;
  description: string;
  coverUrl: string;
  videoUrl: string;
  time: number; // seconds
  xp: number;
  sortOrder: number;
}

// Comment from /api/v1/admin/courses/{courseId}/episodes/{episodeId}/comments
export interface EpisodeComment {
  id: string;
  courseId: string;
  episodeId: string;
  authorId: string;
  authorName: string;
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
  admins: {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
  }[];
  recentActivities: {
    id: string;
    actionType: string;
    targetType: string;
    targetId: string;
    summary: string;
    metadata: Record<string, any>;
    createdAt: string;
  }[];
}
