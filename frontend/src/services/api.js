const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) throw new Error(await response.text() || "API request failed");

  const type = response.headers.get("content-type") || "";
  return type.includes("application/json") ? response.json() : response.text();
}

export { API_BASE_URL };
