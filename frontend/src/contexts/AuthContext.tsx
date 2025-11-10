import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { setAuthToken } from "../services/api";

export type AuthView = "login" | "register";
type LoginCreds = { username: string; password: string };
type RegisterCreds = { email: string; password: string; username?: string };
type UserShape = { id: number; email: string };

type AuthCtx = {
  token: string | null;
  user: UserShape | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: AuthView;
  switchAuthView: (v: AuthView) => void;
  login: (cred: LoginCreds) => Promise<void>;
  register: (cred: RegisterCreds) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserShape | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const switchAuthView = (v: AuthView) => setCurrentView(v);

  const login = async (cred: LoginCreds) => {
    setIsLoading(true);
    try {
      const { token: tkn, user: me } = await authService.login(cred);
      setToken(tkn);
      setAuthToken(tkn);
      setUser(me);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (cred: RegisterCreds) => {
    setIsLoading(true);
    try {

      const { token: tkn, user: me } = await authService.register(cred);
      setToken(tkn);
      setAuthToken(tkn);
      setUser(me);
      setIsAuthenticated(true);

    } finally {
      setIsLoading(false);
    }
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
      value={{
        token,
        user,
        isAuthenticated,
        isLoading,
        currentView,
        switchAuthView,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
