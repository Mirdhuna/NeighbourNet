export const API_BASE = "http://127.0.0.1:8000";

export function getAccessToken() {
  try {
    return (
      window.localStorage.getItem("access_token") ||
      window.sessionStorage.getItem("access_token") ||
      ""
    );
  } catch {
    return "";
  }
}

export function clearAuthStorage() {
  const keys = ["access_token", "neighbornet_session"];
  try {
    keys.forEach((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
  } catch {
    // storage unavailable
  }
}

export function apiErrorMessage(data, status) {
  if (status === 401) return "Your session has expired. Please log in again.";
  if (!data) return `Request failed (${status})`;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => item.msg || item.message || JSON.stringify(item))
      .join(" ");
  }
  return `Request failed (${status})`;
}

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Could not reach the server. Check that the API is running and CORS is allowed."
    );
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }

  if (!response.ok) {
    const error = new Error(apiErrorMessage(data, response.status));
    error.status = response.status;
    throw error;
  }

  return data;
}
