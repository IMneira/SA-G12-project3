import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../../types/auth";
import { api } from "./api";

interface BackendLoginResponse {
  access_token: string;
  token_type: string;
}

interface BackendRegisterResponse {
  id: number;
  email: string;
  username: string;
  // Add other user fields from your schema
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Your backend uses OAuth2PasswordRequestForm which expects form data
      const formData = new URLSearchParams();
      formData.append("username", credentials.username); // This should be the email
      formData.append("password", credentials.password);

      const response = await api.post<BackendLoginResponse>(
        "/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      // Store the token for future requests
      const token = response.data.access_token;

      // Get user info using the token
      const userResponse = await api.get<User>("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        user: userResponse.data,
        token: token,
        message: "Login successful",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.detail) {
        throw new Error(
          Array.isArray(error.response.data.detail)
            ? error.response.data.detail[0]?.msg || "Login failed"
            : error.response.data.detail,
        );
      }
      throw new Error("Login failed. Please try again.");
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Register uses JSON
      const response = await api.post<BackendRegisterResponse>("/register", {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
        // Add other required fields from your UserCreate schema
      });

      // After registration, automatically log the user in
      // Note: Your backend uses email as the username for login
      return await this.login({
        username: credentials.username, // Use email as username for login
        password: credentials.password,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Registration failed. Please try again.");
    }
  }

  async logout(): Promise<void> {
    // Clear stored token
    console.log("Logout called");
  }
}

export const authService = new AuthService();
