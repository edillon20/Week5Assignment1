import React, { createContext, useContext, useEffect, useState } from "react";
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const login = (profile) => {
    setUser(profile);
    localStorage.setItem("authUser", JSON.stringify(profile));
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("authUser");

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}