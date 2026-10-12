import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/types";
import { fetchProfile } from "@/api/admin"; // Assume an endpoint that gets /api/user
import { apiClient } from "@/lib/axios";

interface PendingSignup {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  pendingEmail: string | null;
  tempToken: string | null;
  requires2fa: boolean;
  setTempToken: (token: string | null) => void;
  setRequires2fa: (status: boolean) => void;
  handleLoginSuccess: (token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: PendingSignup) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  enable2FA: () => void;
  disable2FA: () => void;
  hasTransactionPin: boolean;
  setTransactionPin: (pin: string) => void;
  verifyTransactionPin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "vistapay_token";
const TEMP_TOKEN_KEY = "vistapay_temp_token";
const PIN_KEY = "vistapay_txn_pin";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [tempToken, setTempTokenState] = useState<string | null>(() =>
    sessionStorage.getItem(TEMP_TOKEN_KEY)
  );
  const [requires2fa, setRequires2faState] = useState<boolean>(
    () => !!sessionStorage.getItem(TEMP_TOKEN_KEY)
  );
  const [pin, setPin] = useState<string | null>(null);

  // Helper to sync tempToken state with storage
  const setTempToken = (token: string | null) => {
    setTempTokenState(token);
    if (token) {
      sessionStorage.setItem(TEMP_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TEMP_TOKEN_KEY);
    }
  };

  // Helper to set 2FA status
  const setRequires2fa = (status: boolean) => {
    setRequires2faState(status);
    if (!status) {
      setTempToken(null);
    }
  };

 // Fetches user profile when a valid authentication token exists
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      const response = await fetchProfile();
      // Cast the extracted data object to User
      const userData = (response.data ?? response) as unknown as User;
      setUser(userData);
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      logout();
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const savedPin = localStorage.getItem(PIN_KEY);
    if (savedPin) setPin(savedPin);
  }, [loadUser]);

  // Saves actual authorization token and establishes the session
  const handleLoginSuccess = async (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setTempToken(null);
    setRequires2faState(false);
    await loadUser();
  };

  const login: AuthContextValue["login"] = async (email) => {
    await delay(600);
    setPendingEmail(email);
  };

  const register: AuthContextValue["register"] = async (data) => {
    await delay(600);
    setPendingEmail(data.email);
  };

  const verifyOtp: AuthContextValue["verifyOtp"] = async () => {
    await delay(500);
    setPendingEmail(null);
  };

  const requestPasswordReset: AuthContextValue["requestPasswordReset"] = async (email) => {
    await delay(600);
    setPendingEmail(email);
  };

  const resetPassword: AuthContextValue["resetPassword"] = async () => {
    await delay(600);
    setPendingEmail(null);
  };

const logout = async () => {
  try {
    // Call Laravel Sanctum / Passport logout endpoint
    await apiClient.post('/logout');
  } catch (err) {
    // Silently log or handle network errors if the token is already expired
    console.warn('Logout endpoint request failed:', err);
  } finally {
    // Always clear authentication state and local storage regardless of API response
    setUser(null);
    setTempToken(null);
    setRequires2faState(false);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TEMP_TOKEN_KEY);
  }
};

  const enable2FA = () => setUser((u) => (u ? { ...u, twoFactorEnabled: true } : u));
  const disable2FA = () => setUser((u) => (u ? { ...u, twoFactorEnabled: false } : u));

  const setTransactionPin = (newPin: string) => {
    setPin(newPin);
    localStorage.setItem(PIN_KEY, newPin);
  };

  const verifyTransactionPin = (candidate: string) => {
    if (!pin) return true;
    return candidate === pin;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initializing,
        pendingEmail,
        tempToken,
        requires2fa,
        setTempToken,
        setRequires2fa,
        handleLoginSuccess,
        login,
        register,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
        logout,
        enable2FA,
        disable2FA,
        hasTransactionPin: !!pin,
        setTransactionPin,
        verifyTransactionPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}