import axios from "axios";
import { API_BASE_URL, SECRET_KEY } from "../constants/constants";
import { Platform } from "react-native";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the secret key in headers
api.interceptors.request.use(
  (config) => {
    config.headers["X-Secret-Key"] = SECRET_KEY;
    // Optionally add platform info
    config.headers["X-Platform"] = Platform.OS;
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
    // Handle errors globally
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("API Error: No response received", error.request);
    } else {
      // Something else happened while setting up the request
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  },
);
