// apps/admin-org/utils/axios-config.ts

import axios from "axios";

// Normalize base URL
const rawBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const normalizedBase = rawBase.replace(/\/v1$/, "");

export const axiosConfig = axios.create({
  baseURL: normalizedBase,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================

let csrfToken: string | null = null;
let csrfTokenFetching: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await axiosConfig.get("/v1/auth/csrf-token");
    const token = response.data.csrfToken;
    if (!token) {
      throw new Error("No CSRF token received");
    }
    return token;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
}

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (csrfTokenFetching) {
    return csrfTokenFetching;
  }

  csrfTokenFetching = fetchCsrfToken()
    .then((token) => {
      csrfToken = token;
      return token;
    })
    .finally(() => {
      csrfTokenFetching = null;
    });

  return csrfTokenFetching;
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfTokenFetching = null;
}

// ============================================
// REQUEST INTERCEPTOR - Add CSRF Token
// ============================================

axiosConfig.interceptors.request.use(
  async (config) => {
    const skipMethods = ["get", "head", "options"];
    const method = config.method?.toLowerCase() || "";

    const skipUrls = [
      "/v1/auth/login",
      "/v1/auth/register",
      "/v1/auth/csrf-token",
      "/v1/auth/refresh",
    ];
    const isAuthEndpoint = skipUrls.some((url) => config.url?.includes(url));

    if (skipMethods.includes(method) || isAuthEndpoint) {
      return config;
    }

    try {
      const token = await getCsrfToken();
      config.headers["X-CSRF-Token"] = token;
    } catch (error) {
      console.warn("Failed to add CSRF token to request:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// RESPONSE INTERCEPTOR - Handle Token Refresh
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: any;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(axiosConfig(prom.config));
    }
  });
  failedQueue = [];
};

axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    // Handle CSRF token errors
    if (
      status === 403 &&
      (message === "invalid csrf token" || message === "CSRF token mismatch")
    ) {
      clearCsrfToken();
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await getCsrfToken();
          return axiosConfig(originalRequest);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }

    // Handle token refresh for 401 errors
    const skipRefreshUrls = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/csrf-token",
    ];
    const isAuthRequest = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // The refresh response updates the httpOnly cookie used by axiosConfig.
        await axiosConfig.post("/v1/auth/refresh");

        processQueue(null);

        // Replay the original request once with the refreshed cookie.
        return axiosConfig(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        processQueue(refreshError);
        const { clearUser } = await import("@/store/auth-store");
        clearUser();
        clearCsrfToken();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosConfig;
