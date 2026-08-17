import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};