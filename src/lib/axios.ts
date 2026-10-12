import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAuthToken, clearAuthToken, isAuthenticated } from "@/lib/auth";

// 1. Correct base URL fallback for Vite/NextJS
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.NEXT_PUBLIC_API_BASE_URL ||
 // "http://localhost:8000/api";
  "https://vistapay.techprenure.com/api/admin";

// Helper to safely resolve guest token without breaking SSR/Builds
const getGuestToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    let token = localStorage.getItem("guest_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("guest_token", token);
    }
    return token;
  } catch (error) {
    console.error("Failed to access localStorage for guest token:", error);
    return null;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth & Dynamic Guest Tokens
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Dynamic Guest Token
    const guestToken = getGuestToken();
    if (guestToken && config.headers) {
      config.headers["X-Guest-Token"] = guestToken;
    }

    // 2. Auth Bearer Token (Only attach if NOT explicit unauthenticated guest/temp requests)
    const token = getAuthToken();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor: Global Error & Auth Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // Handle 401 Unauthenticated
      if (status === 401) {
        const hadToken = isAuthenticated();
        clearAuthToken();

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;

          // Paths where 401 should NOT trigger a redirect loop
          const publicAuthPaths = [
            "/login",
            "/register",
            "/otp",
            "/forgot-password",
          ];
          const isPublicAuthRoute = publicAuthPaths.some((path) =>
            currentPath.startsWith(path),
          );

          if (hadToken && !isPublicAuthRoute) {
            const redirectUrl = encodeURIComponent(
              currentPath + window.location.search,
            );
            window.location.href = `/login?expired=1&from=${redirectUrl}`;
          }
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.warn(
          "Access denied: You do not have the required permissions.",
        );
      }
    }

    return Promise.reject(error);
  },
);
