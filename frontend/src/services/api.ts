import axios from "axios";
import { API_BASE_URL, SECRET_KEY } from "../constants/constants";
import { Platform } from "react-native";

// Simple token storage (replace with SecureStore in production)
let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the secret key and auth token
api.interceptors.request.use(
  (config) => {
    config.headers["X-Secret-Key"] = SECRET_KEY;
    config.headers["X-Platform"] = Platform.OS;

    // Add authorization token if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle responses globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error: No response received", error.request);
    } else {
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  },
);
