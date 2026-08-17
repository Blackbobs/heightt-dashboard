import axios from "axios";

/** A safe, human-readable message for API failures. Never render raw Axios errors. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as { message?: string | string[]; error?: string } | undefined;
  const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
  if (message) return message;
  if (data?.error) return data.error;

  if (!error.response) return "Unable to reach the server. Check your connection and try again.";
  if (error.response.status === 401) return "Your session has expired. Please sign in again.";
  if (error.response.status === 403) return "You do not have permission to perform this action.";
  if (error.response.status === 404) return "This resource is not available on the server.";
  if (error.response.status >= 500) return "The server could not complete this request. Please try again shortly.";
  return fallback;
}
