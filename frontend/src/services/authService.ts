import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../../types/auth";
import { api, setAuthToken } from "../services/api"; 

interface BackendLoginResponse {
  access_token: string;
  token_type: string;
}
interface BackendRegisterResponse {
  id: number;
  email: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {

    const loginUser =
      (credentials as any).email ?? credentials.username ?? "";
    const form = new URLSearchParams();
    form.set("username", loginUser);
    form.set("password", credentials.password);

    const { data } = await api.post<BackendLoginResponse>("/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token = data.access_token;
    setAuthToken(token);

    const me = await api.get<User>("/users/me");
    return { user: me.data, token, message: "Login successful" };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log("[AuthService] Register request:", {
      email: credentials.email,
      password: "***",
      credentialsKeys: Object.keys(credentials),
    });
    
    try {
      const response = await api.post<BackendRegisterResponse>("/register", {
        email: credentials.email,
        password: credentials.password,
      });
      
      console.log("[AuthService] Register success:", response.data);
      
      return this.login({
        username: credentials.email,
        password: credentials.password,
      });
    } catch (error: any) {
      console.error("[AuthService] Register error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Mejorar el mensaje de error para el usuario
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    setAuthToken(undefined);
  }
}

export const authService = new AuthService();
