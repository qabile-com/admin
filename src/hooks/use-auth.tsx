"use client";

import { createContext, useContext, useState } from "react";
import type { AuthUser } from "@/types/api-types";
import apiClient from "@/lib/api-client";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}

interface AuthContextType extends AuthState {
  login: (
    accessToken: string,
    refreshToken: string,
    user: AuthState["user"],
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("qabile_admin_auth");
      if (stored) {
        try {
          return JSON.parse(stored) as AuthState;
        } catch {
          // ignore
        }
      }
    }
    return { accessToken: null, refreshToken: null, user: null };
  });

  const login = (
    accessToken: string,
    refreshToken: string,
    user: AuthState["user"],
  ) => {
    const newState = { accessToken, refreshToken, user };
    setState(newState);
    localStorage.setItem("qabile_admin_auth", JSON.stringify(newState));
  };

  const logout = () => {
    const stored = localStorage.getItem("qabile_admin_auth");
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        if (auth.refreshToken) {
          // Fire and forget – don’t block the logout
          apiClient
            .post("/api/v1/auth/logout", {
              refreshToken: auth.refreshToken,
            })
            .catch(() => {});
        }
      } catch {}
    }
    setState({ accessToken: null, refreshToken: null, user: null });
    localStorage.removeItem("qabile_admin_auth");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
