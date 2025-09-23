// src/hooks/useAuthForm.ts
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export const useAuthForm = (ignorePaths: string[] = []) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Shared redirect logic
  useEffect(() => {
    if (!loading && user) {
      const currentPath = window.location.pathname;
      if (!ignorePaths.includes(currentPath)) {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, ignorePaths]);
  
  return {
    user,
    loading,
  };
};