import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("careconnect_user");

    return saved ? JSON.parse(saved) : null;
  });

  const persist = (nextUser) => {
    setUser(nextUser);

    sessionStorage.setItem(
      "careconnect_user",
      JSON.stringify(nextUser)
    );
  };

  const login = ({ name, email }) => {
    persist({
      name: name?.trim() || "Demo User",
      email,
      role: null,
    });
  };

  const register = ({ name, email }) => {
    persist({
      name,
      email,
      role: null,
    });
  };

  const selectRole = (role) => {
    persist({
      ...user,
      role,
    });
  };

  const logout = () => {
    sessionStorage.removeItem("careconnect_user");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    selectRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}