/**
 * centralized API client for ECHO .NET Backend
 */

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function getHeaders() {
  const userStr = localStorage.getItem("echo_user");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  
  if (userStr) {
    try {
      const { token } = JSON.parse(localStorage.getItem("echo_token_data") || "{}");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch { } // ignore
  }
  return headers;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Network error");
  }
  return data;
}
