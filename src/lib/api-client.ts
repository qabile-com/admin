import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://api.qabile.com",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("qabile_admin_auth");
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        if (auth.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
      } catch {
        // ignore
      }
    }
  }
  return config;
});

export default apiClient;

// NOTE: 401s are handled exclusively by the refresh interceptor below.
// A second, earlier interceptor used to hard-redirect to "/" on any 401, which
// ran first and made the refresh flow unreachable — every token expiry logged
// the admin out. Do not re-add one here.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const stored = localStorage.getItem("qabile_admin_auth");
      if (!stored) {
        isRefreshing = false;
        localStorage.removeItem("qabile_admin_auth");
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const { refreshToken } = JSON.parse(stored);
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
          {
            refreshToken,
          },
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update storage and state
        const updated = {
          accessToken,
          refreshToken: newRefreshToken,
          user: JSON.parse(stored).user,
        };
        localStorage.setItem("qabile_admin_auth", JSON.stringify(updated));
        // Update auth context (if accessible) – but for simplicity we just store.

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("qabile_admin_auth");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
