// apps/admin-org/lib/api/error.ts

import axios from "axios";

/** A safe, human-readable message for API failures. Never render raw Axios errors. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as
    { message?: string | string[]; error?: string } | undefined;
  const message = Array.isArray(data?.message)
    ? data.message[0]
    : data?.message;
  if (message) return message;
  if (data?.error) return data.error;

  if (!error.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }
  if (error.response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (error.response.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (error.response.status === 404) {
    return "This resource is not available on the server.";
  }
  if (error.response.status >= 500) {
    return "The server could not complete this request. Please try again shortly.";
  }
  return fallback;
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return !error.response && !error.request;
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return error.code === "ECONNABORTED" || error.message?.includes("timeout");
}

/**
 * Get the status code from an error
 */
export function getErrorStatusCode(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.status || null;
}

/**
 * Get the error response data
 */
export function getErrorData(error: unknown): Record<string, unknown> | null {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.data || null;
}

/**
 * Get validation errors from the response
 */
export function getValidationErrors(
  error: unknown,
): Record<string, string[]> | null {
  const data = getErrorData(error);
  if (data && typeof data === "object" && "errors" in data) {
    const errors = data.errors as Record<string, string[]>;
    return errors;
  }
  return null;
}

/**
 * Format validation errors into a readable string
 */
export function formatValidationErrors(
  errors: Record<string, string[]> | null,
): string {
  if (!errors) return "";
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
}
