// src/utils/apiFetch.ts

type QueueItem = {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Helper Function to get token from storage

const getStoredToken = () : string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const baseUrl = `${import.meta.env.VITE_API_URL || ""}/api`;

  const sendRequest = async (tokenOverride?: string | null): Promise<Response> => {

    const token = tokenOverride ?? getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(baseUrl + url, {
      credentials: "include",
      ...options,
      headers,
    });
  };

  try {
    const res = await sendRequest();

    if (res.status === 401) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => sendRequest(newToken));
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(baseUrl + "/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          throw new Error("Refresh failed");
        }

        const data = await refreshRes.json();

        // ✅ FIX: Validate and type-assert the token
        const newToken = typeof data.token === "string" ? data.token : null;

        processQueue(null, newToken);
        isRefreshing = false;

        return sendRequest(newToken); 
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.dispatchEvent(new Event("logout"));
        throw new Error("Session expired");
      }
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};
