export type UserStatus = 'Active' | 'Suspended' | 'Pending';
export type CourseStatus = 'Published' | 'Draft' | 'Review';

export interface AdminUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  joinedAt: string;
  xp: number;
  courses: number;
  watchedCourses: WatchedCourse[];
}

export interface WatchedSession {
  id: string;
  title: string;
  watchedAt: string;
  earnedXp: number;
  duration: string;
}

export interface WatchedCourse {
  id: string;
  title: string;
  progress: number;
  sessions: WatchedSession[];
  earnedXp: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  mentor: string;
  status: CourseStatus;
  students: number;
  totalXp: number;
  completionBonusXp: number;
  coverUrl: string;
  videoUrl: string;
  sessions: AdminSession[];
  completion: number;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  title: string;
  xp: number;
  coverUrl: string;
  videoUrl: string;
  duration: string;
}

export const users: AdminUser[] = [
  {
    id: 'USR-1042',
    name: 'Arian Mehr',
    firstName: 'Arian',
    lastName: 'Mehr',
    email: 'arian@qabile.dev',
    phone: '+98 912 124 8841',
    role: 'Student',
    status: 'Active',
    joinedAt: '2026-07-12',
    xp: 18420,
    courses: 4,
    watchedCourses: [
      {
        id: 'CRS-220',
        title: 'Phoenix Mindset Foundations',
        progress: 86,
        earnedXp: 86,
        sessions: [
          { id: 'SES-1', title: 'Rise from ash', watchedAt: '2026-07-18', earnedXp: 10, duration: '12m' },
          { id: 'SES-2', title: 'Daily streak ritual', watchedAt: '2026-07-18', earnedXp: 12, duration: '18m' },
          { id: 'SES-3', title: 'Focus loop', watchedAt: '2026-07-17', earnedXp: 14, duration: '22m' },
        ],
      },
    ],
  },
  {
    id: 'USR-1038',
    name: 'Nika Farzan',
    firstName: 'Nika',
    lastName: 'Farzan',
    email: 'nika@qabile.dev',
    phone: '+98 912 880 4416',
    role: 'Mentor',
    status: 'Active',
    joinedAt: '2026-07-08',
    xp: 22980,
    courses: 7,
    watchedCourses: [
      {
        id: 'CRS-214',
        title: 'AI Productivity Roadmap',
        progress: 64,
        earnedXp: 58,
        sessions: [
          { id: 'SES-1', title: 'Prompt systems', watchedAt: '2026-07-16', earnedXp: 15, duration: '20m' },
          { id: 'SES-2', title: 'Automation stack', watchedAt: '2026-07-15', earnedXp: 15, duration: '24m' },
        ],
      },
    ],
  },
  {
    id: 'USR-1027',
    name: 'Sina Rahimi',
    firstName: 'Sina',
    lastName: 'Rahimi',
    email: 'sina@qabile.dev',
    phone: '+98 933 402 1168',
    role: 'Student',
    status: 'Pending',
    joinedAt: '2026-06-30',
    xp: 2400,
    courses: 1,
    watchedCourses: [
      {
        id: 'CRS-209',
        title: 'Community Leadership',
        progress: 24,
        earnedXp: 22,
        sessions: [
          { id: 'SES-1', title: 'Trusted circles', watchedAt: '2026-07-02', earnedXp: 10, duration: '14m' },
        ],
      },
    ],
  },
  {
    id: 'USR-1019',
    name: 'Darya Nouri',
    firstName: 'Darya',
    lastName: 'Nouri',
    email: 'darya@qabile.dev',
    phone: '+98 901 711 5020',
    role: 'Student',
    status: 'Suspended',
    joinedAt: '2026-06-21',
    xp: 780,
    courses: 0,
    watchedCourses: [],
  },
];

export const courses: AdminCourse[] = [
  {
    id: 'CRS-220',
    title: 'Phoenix Mindset Foundations',
    mentor: 'Nika Farzan',
    status: 'Published',
    students: 1284,
    totalXp: 100,
    completionBonusXp: 30,
    coverUrl: 'https://cdn.qabile.dev/courses/phoenix-mindset.webp',
    videoUrl: 'https://video.qabile.dev/trailers/phoenix-mindset.m3u8',
    sessions: [
      {
        id: 'SES-220-1',
        title: 'Rise from ash',
        xp: 10,
        coverUrl: 'https://cdn.qabile.dev/sessions/rise-from-ash.webp',
        videoUrl: 'https://video.qabile.dev/sessions/rise-from-ash.m3u8',
        duration: '12m',
      },
      {
        id: 'SES-220-2',
        title: 'Daily streak ritual',
        xp: 12,
        coverUrl: 'https://cdn.qabile.dev/sessions/daily-streak.webp',
        videoUrl: 'https://video.qabile.dev/sessions/daily-streak.m3u8',
        duration: '18m',
      },
      {
        id: 'SES-220-3',
        title: 'Focus loop',
        xp: 14,
        coverUrl: 'https://cdn.qabile.dev/sessions/focus-loop.webp',
        videoUrl: 'https://video.qabile.dev/sessions/focus-loop.m3u8',
        duration: '22m',
      },
    ],
    completion: 76,
    updatedAt: '2026-07-18',
  },
  {
    id: 'CRS-214',
    title: 'AI Productivity Roadmap',
    mentor: 'Pouya Sadeghi',
    status: 'Review',
    students: 612,
    totalXp: 120,
    completionBonusXp: 36,
    coverUrl: 'https://cdn.qabile.dev/courses/ai-productivity.webp',
    videoUrl: 'https://video.qabile.dev/trailers/ai-productivity.m3u8',
    sessions: [
      {
        id: 'SES-214-1',
        title: 'Prompt systems',
        xp: 15,
        coverUrl: 'https://cdn.qabile.dev/sessions/prompt-systems.webp',
        videoUrl: 'https://video.qabile.dev/sessions/prompt-systems.m3u8',
        duration: '20m',
      },
      {
        id: 'SES-214-2',
        title: 'Automation stack',
        xp: 15,
        coverUrl: 'https://cdn.qabile.dev/sessions/automation-stack.webp',
        videoUrl: 'https://video.qabile.dev/sessions/automation-stack.m3u8',
        duration: '24m',
      },
    ],
    completion: 41,
    updatedAt: '2026-07-15',
  },
  {
    id: 'CRS-209',
    title: 'Community Leadership',
    mentor: 'Sara Kamali',
    status: 'Published',
    students: 940,
    totalXp: 90,
    completionBonusXp: 20,
    coverUrl: 'https://cdn.qabile.dev/courses/community-leadership.webp',
    videoUrl: 'https://video.qabile.dev/trailers/community-leadership.m3u8',
    sessions: [
      {
        id: 'SES-209-1',
        title: 'Trusted circles',
        xp: 10,
        coverUrl: 'https://cdn.qabile.dev/sessions/trusted-circles.webp',
        videoUrl: 'https://video.qabile.dev/sessions/trusted-circles.m3u8',
        duration: '14m',
      },
    ],
    completion: 68,
    updatedAt: '2026-07-10',
  },
  {
    id: 'CRS-197',
    title: 'Deep Work Sprint',
    mentor: 'Arian Mehr',
    status: 'Draft',
    students: 0,
    totalXp: 80,
    completionBonusXp: 20,
    coverUrl: 'https://cdn.qabile.dev/courses/deep-work.webp',
    videoUrl: 'https://video.qabile.dev/trailers/deep-work.m3u8',
    sessions: [
      {
        id: 'SES-197-1',
        title: 'Sprint setup',
        xp: 10,
        coverUrl: 'https://cdn.qabile.dev/sessions/sprint-setup.webp',
        videoUrl: 'https://video.qabile.dev/sessions/sprint-setup.m3u8',
        duration: '16m',
      },
    ],
    completion: 0,
    updatedAt: '2026-07-02',
  },
];

export const getAdminSummary = () => ({
  totalUsers: users.length,
  activeUsers: users.filter((user) => user.status === 'Active').length,
  totalCourses: courses.length,
  publishedCourses: courses.filter((course) => course.status === 'Published').length,
});
