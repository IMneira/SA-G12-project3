import React, { createContext, useState, useContext, ReactNode } from "react";
import {
  AuthContextType,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../../types/auth";
import { authService } from "../services/authService";
import { setAuthToken } from "../services/api";

export type AuthView = "login" | "register";

interface AuthContextTypeExtended
  extends Omit<AuthContextType, "switchAuthView"> {
  currentView: AuthView;
  switchAuthView: (view: AuthView) => void;
}

const AuthContext = createContext<AuthContextTypeExtended | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      // Store token securely (AsyncStorage, SecureStore, etc.)
      setAuthToken(authResponse.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse = await authService.register(credentials);
      setUser(authResponse.user);
      // Store token securely (AsyncStorage, SecureStore, etc.)
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setAuthToken(null); // Clear the token
  };

  const switchAuthView = (view: AuthView): void => {
    setCurrentView(view);
  };

  const value: AuthContextTypeExtended = {
    user,
    isLoading,
    login,
    register,
    logout,
    currentView,
    switchAuthView,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextTypeExtended => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
