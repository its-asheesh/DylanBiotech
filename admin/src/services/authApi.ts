// src/services/authApi.ts
import { apiFetch } from '../utils/apiFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  adminLevel?: number;
  permissions?: string[];
};

export type LoginResponse = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  adminLevel?: number;
  permissions?: string[];
  token: string;
};

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data: LoginResponse = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('accessToken', data.token);
  }
  
  return data;
}

/**
 * Logout - clear token from localStorage
 */
export function logout(): void {
  localStorage.removeItem('accessToken');
}

/**
 * Get current user from token (verify token is valid)
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch<User>('/users/profile');
  return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}

