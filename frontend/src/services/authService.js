import api from "./api";


export const loginUser = async (
  email,
  password
) => {
  const response = await api.post(
    "/api/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};


export const registerMother = async (
  payload
) => {
  const response = await api.post(
    "/api/auth/register-mother",
    payload
  );

  return response.data;
};


export const getPublicWards = async () => {
  const response = await api.get(
    "/api/auth/wards"
  );

  return response.data;
};


export const logoutUser = () => {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );
};