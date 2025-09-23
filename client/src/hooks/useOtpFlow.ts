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
    // ✅ Updated type: allow optional password
    mutationFn: async ({ email, otp, password }: { email: string; otp: string; password?: string }) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ Include password in request
        body: JSON.stringify({ email, otp, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
      else navigate("/");
    },
  });

  // Resend OTP (same as sendOtp)
  const resendOtp = sendOtp.mutateAsync;

  return {
    sendOtp: sendOtp.mutateAsync,
    resendOtp,
    isSendingOtp: sendOtp.isPending,
    sendOtpError: sendOtp.error,

    verifyOtp: verifyOtp.mutate, // ← You're using .mutate — that's fine
    isVerifyingOtp: verifyOtp.isPending,
    verifyOtpError: verifyOtp.error,
  };
};