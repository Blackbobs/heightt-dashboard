// apps/admin-org/utils/axios-config.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type RetryableConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  _csrfRetry?: boolean;
};

// Normalize base URL
const rawBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const normalizedBase = rawBase.replace(/\/v1$/, "");

export const axiosConfig = axios.create({
  baseURL: normalizedBase,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================

let csrfToken: string | null = null;
let csrfTokenFetching: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const response = await axiosConfig.get("/v1/auth/csrf-token");
  const token = response.data?.csrfToken ?? response.data?.token;

  if (!token) {
    throw new Error("The backend did not return a CSRF token");
  }

  csrfToken = token;
  return token;
}

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    csrfToken = null;
  }

  if (!forceRefresh && csrfToken) {
    return csrfToken;
  }

  if (csrfTokenFetching) {
    return csrfTokenFetching;
  }

  csrfTokenFetching = fetchCsrfToken().finally(() => {
    csrfTokenFetching = null;
  });

  return csrfTokenFetching;
}

export function clearCsrfToken() {
  csrfToken = null;
}

// ============================================
// REQUEST INTERCEPTOR - Add CSRF Token
// ============================================

axiosConfig.interceptors.request.use(
  async (config) => {
    const skipMethods = ["get", "head", "options"];
    const method = config.method?.toLowerCase() || "";

    const isCsrfEndpoint = config.url?.includes("/auth/csrf-token");

    config.withCredentials = true;

    if (skipMethods.includes(method) || isCsrfEndpoint) {
      return config;
    }

    config.headers.set("X-CSRF-Token", await getCsrfToken());

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
  config: RetryableConfig;
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
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data as
      { code?: string; error?: string; message?: string } | undefined;
    const invalidCsrf =
      data?.code === "CSRF_TOKEN_INVALID" ||
      data?.error === "CSRF_TOKEN_INVALID" ||
      data?.message === "CSRF_TOKEN_INVALID" ||
      data?.message === "invalid csrf token" ||
      data?.message === "CSRF token mismatch";

    // Handle CSRF token errors
    if (invalidCsrf && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      clearCsrfToken();
      const freshToken = await getCsrfToken(true);
      originalRequest.headers.set("X-CSRF-Token", freshToken);
      return axiosConfig(originalRequest);
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

    if (status === 401 && !isAuthRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;

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
        const { clearAuth } = await import("@/store/auth-store");
        clearAuth();
        clearCsrfToken();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && typeof window !== "undefined") {
      const params = originalRequest.params as { academicSessionId?: string; sessionId?: string } | undefined;
      let body: { academicSessionId?: string; sessionId?: string } | undefined;
      if (typeof originalRequest.data === "string") {
        try { body = JSON.parse(originalRequest.data); } catch { body = undefined; }
      } else if (originalRequest.data && typeof originalRequest.data === "object") {
        body = originalRequest.data;
      }
      const academicSessionId = params?.academicSessionId || params?.sessionId || body?.academicSessionId || body?.sessionId;
      if (academicSessionId) {
        window.dispatchEvent(new CustomEvent("admin-session-forbidden", { detail: academicSessionId }));
      }
    }

    return Promise.reject(error);
  },
);

export default axiosConfig;
