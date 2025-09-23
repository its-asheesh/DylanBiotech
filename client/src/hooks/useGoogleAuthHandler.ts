// src/hooks/useGoogleAuthHandler.ts
import { useGoogleAuth } from "./useGoogleAuth"; // ← Uses your existing hook
import { useNavigate } from "react-router-dom";

export const useGoogleAuthHandler = (onSuccess?: () => void) => {
  const googleAuth = useGoogleAuth(); // ← Reuse your mutation
  const navigate = useNavigate();

  const handleGoogleAuth = () => {
    googleAuth.mutate(undefined, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        else navigate("/"); // ← Navigate only if no custom handler
      },
    });
  };

  return {
    handleGoogleAuth,
    isPending: googleAuth.isPending,
    error: googleAuth.error, // ← Optional: expose error
  };
};