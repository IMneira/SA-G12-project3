import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { setAuthToken } from "../services/api";
import { LoginCredentials, RegisterCredentials, User } from "../../types/auth";

export type AuthView = "login" | "register";

type AuthCtx = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: AuthView;
  switchAuthView: (v: AuthView) => void;
  login: (cred: LoginCredentials) => Promise<void>;
  register: (cred: RegisterCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const switchAuthView = (v: AuthView) => setCurrentView(v);

  const login = async (cred: LoginCredentials) => {
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

  const register = async (cred: RegisterCredentials) => {
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
