import { clearUser, getState, setAuth } from "@/store/auth-store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type RetryableConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  _csrfRetry?: boolean;
};

// Normalize base URL so callers that include `/v1` in paths don't duplicate it.
const rawBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
// If the env includes a trailing /v1, strip it so `/v1` in request paths stays meaningful.
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
    const isCredentialAuthEndpoint =
      isCsrfEndpoint ||
      ["/auth/login", "/auth/admin/login", "/auth/register", "/auth/refresh"].some(
        (url) => config.url?.includes(url),
      );

    // Both dashboards use the same API cookie domain in production. Always
    // isolate bearer requests from that cookie because some backend guards
    // resolve the cookie before the Authorization header.
    const token = getState().token;
    const hasBearerToken = Boolean(
      token && token !== "cookie-auth" && !isCredentialAuthEndpoint,
    );
    config.withCredentials = !hasBearerToken;
    if (hasBearerToken) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Platform mutations also require CSRF with bearer authentication. The
    // token endpoint may use credentials, but this business request continues
    // to use only the platform bearer identity.
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
    // Retry every failed authenticated request once. Auth endpoints are excluded
    // so an invalid refresh cookie cannot create a refresh loop.
    const skipRefreshUrls = [
      "/auth/login",
      "/auth/admin/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/csrf-token",
    ];
    const isAuthRequest = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );
    const usedBearerToken = Boolean(
      originalRequest.headers?.get("Authorization"),
    );

    // A shared refresh cookie may belong to Admin Org. Never use it to refresh
    // a platform bearer session, otherwise the identity can cross dashboards.
    if (status === 401 && usedBearerToken) {
      clearUser();
      clearCsrfToken();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      return Promise.reject(error);
    }

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
        const refreshResponse = await axiosConfig.post("/v1/auth/refresh");
        const refreshedToken =
          refreshResponse.data?.data?.accessToken ??
          refreshResponse.data?.accessToken;
        const currentUser = getState().user;
        if (refreshedToken && currentUser) {
          setAuth(refreshedToken, currentUser);
        }

        processQueue(null);

        // Replay the original request once with the refreshed cookie.
        return axiosConfig(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        processQueue(refreshError);
        clearUser();
        clearCsrfToken();
        if (typeof window !== "undefined") {
          // Use window.location for full page reload to clear all state
          window.location.href = "/signin";
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
