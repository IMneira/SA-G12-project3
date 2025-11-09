import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../../types/auth";
import { api } from "./api";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/login", credentials);
      return response.data;
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/register", credentials);
      return response.data;
    } catch (error) {
      throw new Error("Registration failed. Please try again.");
    }
  }

  async logout(): Promise<void> {
    // Implement logout logic
  }
}

export const authService = new AuthService();
