export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout?: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
  isAuthenticated: boolean;
}
