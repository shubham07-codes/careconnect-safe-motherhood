import { apiRequest } from "./api";
export const authService = {
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: (token) => apiRequest("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
};
