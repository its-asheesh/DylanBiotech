// src/hooks/useOtpFlow.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useOtpFlow = (onSuccess?: () => void) => {
  const navigate = useNavigate();

  const sendOtp = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send OTP");
      }
      return res.json();
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ email, otp, password }: { email: string; otp: string; password?: string }) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid OTP");
      }
      return res.json(); // ✅ This returns { _id, name, email, role, token }
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
      else navigate("/");
    },
  });

  return {
    sendOtp: sendOtp.mutateAsync,
    resendOtp: sendOtp.mutateAsync,
    isSendingOtp: sendOtp.isPending,
    sendOtpError: sendOtp.error,

    // ✅ EXPOSE THE ASYNC VERSION THAT RETURNS DATA
    verifyOtpAsync: verifyOtp.mutateAsync, // ← ADD THIS
    verifyOtp: verifyOtp.mutate, // keep for side-effect usage if needed
    isVerifyingOtp: verifyOtp.isPending,
    verifyOtpError: verifyOtp.error,
  };
};