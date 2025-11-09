
import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { setAuthToken } from "../services/api";

type AuthCtx = {
  token: string | null;
  user: { id: number; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: "login" | "register";
  switchAuthView: (v: "login" | "register") => void;
  login: (cred: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "register">("login");

  const switchAuthView = (v: "login" | "register") => setCurrentView(v);

  const login = async (cred: { username: string; password: string }) => {
    const { token: tkn, user: me } = await authService.login(cred);

    setToken(tkn);
    setAuthToken(tkn);
    setUser(me);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(undefined);
    setCurrentView("login");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, isLoading, currentView, switchAuthView, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
