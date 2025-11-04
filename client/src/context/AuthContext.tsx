// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  _id: string;
  name: string;
  email: string | null;
  phone?: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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

  // Load from storage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
          console.log("🕒 Token expired — attempting refresh...");
          refreshAccessToken(); // ✅ No argument
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

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem("tokenExpiry");
      if (expiry && new Date() > new Date(expiry)) {
        console.log("🕒 Access token expired — refreshing...");
        refreshAccessToken(); // ✅ No argument
      }
    };

    const interval = setInterval(checkTokenExpiry, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // ✅ FIXED: No refreshToken parameter, uses cookie
  const refreshAccessToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        credentials: "include", // ✅ Critical: sends cookie
      });

      if (!response.ok) throw new Error("Refresh failed");

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
    const response = await fetch("/api/auth/login", { // ✅ Fixed route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // ✅ Sends cookie
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("tokenExpiry", new Date(Date.now() + 15 * 60 * 1000).toISOString());
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include", // ✅
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
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  const loginWithOtp = async (email: string, otp: string) => {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
      credentials: "include", // ✅
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
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  const logout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // ✅
    }).finally(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, loginWithGoogle, loginWithOtp, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};