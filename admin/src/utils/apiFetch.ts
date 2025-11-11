// src/utils/apiFetch.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  // Safely convert headers to a plain object
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Handle different header types
  if (options.headers) {
    if (options.headers instanceof Headers) {
      // Convert Headers object to plain object
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      // Convert array of [key, value] pairs to object
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      // Plain object
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      // Clone the response so we can read it without consuming the original
      const clonedResponse = response.clone();
      const errorData = await clonedResponse.json();
      
      // Safely extract message from error response
      if (errorData && typeof errorData === 'object' && errorData !== null) {
        // Check if it's a plain object (has Object.prototype in its prototype chain)
        if (Object.prototype.toString.call(errorData) === '[object Object]') {
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // If it's not a plain object, try to stringify it
          errorMessage = JSON.stringify(errorData);
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch (parseError) {
      // If JSON parsing fails, try to get text response
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        if (text) {
          errorMessage = text;
        }
      } catch (textError) {
        // Use default error message
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

