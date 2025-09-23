"use client";

// src/context/AuthContext.tsx
import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on app start
  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // ✅ Check if token is expired (only if rememberMe was used)
        if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
          console.log("🕒 Token expired — attempting refresh...");
          refreshAccessToken(localStorage.getItem("refreshToken")); // ← FIXED
          return;
        }

        setUser(parsedUser);
        setToken(storedToken);
        console.log("✅ User restored from storage:", parsedUser.email);
      } catch (e) {
        console.error("Failed to parse stored user data");
        logout();
      }
    }

    setLoading(false);
  }, []);

  // ✅ Auto-refresh token (if rememberMe)
  useEffect(() => {
    if (!token || !localStorage.getItem("refreshToken")) return;

    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem("tokenExpiry");
      if (expiry && new Date() > new Date(expiry)) {
        console.log("🕒 Access token expired — refreshing...");
        refreshAccessToken(localStorage.getItem("refreshToken")); // ← FIXED
      }
    };

    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // ✅ Refresh access token s
  const refreshAccessToken = async (refreshToken: string | null) => {
    if (!refreshToken) {
      console.warn("⚠️ No refresh token available — logging out");
      logout();
      return;
    }

    try {
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Refresh token invalid");
      }

      const data = await response.json();
      const newExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", newExpiry);

      console.log("✅ Access token refreshed");
    } catch (error) {
      console.error("❌ Failed to refresh token:", error);
      logout();
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setUser(userData);
      setToken(data.token);

      if (rememberMe) {
        // ✅ Set expiry to 30 days
        const expiry = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.setItem("tokenExpiry", expiry);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Google login failed");
      }

      const data = await response.json();

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setUser(userData);
      setToken(data.token);

      // Always persist Google login in localStorage (user expects "remember me")
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } catch (error) {
      throw error;
    }
  };

  // Inside AuthProvider component
  const loginWithOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }

      const data = await response.json();

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setUser(userData);
      setToken(data.token);

      // Persist in localStorage (treat OTP login like "remember me")
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      console.log("✅ Logged in via OTP:", userData.email);
    } catch (error) {
      console.error("OTP Login Error:", error);
      throw error;
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    loginWithGoogle,
    loginWithOtp,
    logout,
    loading,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
