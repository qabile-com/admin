import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Pull a human-readable message out of an axios failure.
 *
 * Errors reach us as AxiosError, whose `.message` is the useless
 * "Request failed with status code 400". The message worth showing lives at
 * `response.data.message`, which NestJS returns as either a string or a
 * string[] (one entry per failed validation rule).
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong',
): string {
  if (typeof err === 'object' && err !== null) {
    const axiosLike = err as {
      response?: { data?: { message?: unknown; error?: unknown } };
      message?: unknown;
    };

    const apiMessage = axiosLike.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    if (Array.isArray(apiMessage)) {
      const joined = apiMessage.filter((m) => typeof m === 'string').join(', ');
      if (joined) return joined;
    }

    const apiError = axiosLike.response?.data?.error;
    if (typeof apiError === 'string' && apiError) return apiError;

    if (typeof axiosLike.message === 'string' && axiosLike.message) {
      return axiosLike.message;
    }
  }
  return fallback;
}

/**
 * The API never returns a single `name` field — it returns some combination of
 * displayName / firstName+lastName / username, any of which may be null.
 * Use this everywhere a user needs to be shown by name.
 */
export function userLabel(
  user:
    | {
        name?: string | null;
        displayName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        username?: string | null;
      }
    | null
    | undefined,
  fallback = 'Unknown user',
): string {
  if (!user) return fallback;
  if (user.displayName) return user.displayName;

  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;

  if (user.username) return `@${user.username}`;
  if (user.name) return user.name;
  return fallback;
}

/** Short, stable label for an id we have nothing better to show for. */
export function shortId(id: string | null | undefined): string {
  if (!id) return '—';
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

/** "USER_SIGNUP" / "eligible_activity_count" -> "User signup" / "Eligible activity count" */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  const spaced = value.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Seconds -> "2h 30m" / "45m" / "30s". Used for cooldowns and media durations. */
export function formatDuration(totalSeconds: number | null | undefined): string {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0));
  if (seconds === 0) return '0s';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs && !days && !hours) parts.push(`${secs}s`);

  return parts.join(' ');
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}
