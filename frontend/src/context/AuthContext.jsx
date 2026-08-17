import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
  const data = await loginUser(
    email,
    password
  );

  localStorage.setItem(
    "access_token",
    data.access_token
  );

  const loggedUser = {
    user_id: data.user_id,
    full_name: data.full_name,
    role: data.role,
  };

  localStorage.setItem(
    "user",
    JSON.stringify(loggedUser)
  );

  setUser(loggedUser);

  return loggedUser;
};

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}