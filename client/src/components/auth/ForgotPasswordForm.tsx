// src/components/auth/ForgotPasswordForm.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOtpFlow } from "@/hooks/useOtpFlow";
import { useAuth } from "@/context/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useNavigate } from "react-router-dom";

// ✅ Reusable Components
import { OtpForm } from "./OtpForm";
import { AuthCardLayout } from "./AuthCardLayout";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { PasswordField } from "./PasswordField";

// ✅ MUI
import {
  TextField,
  Button,
  IconButton,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Email, Lock } from "@mui/icons-material";

// ✅ Zod Schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
}) => {
  useAuthForm(["/login", "/register"]);

  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // ✅ Reuse OTP Flow
  const {
    sendOtp,
    isSendingOtp,
    sendOtpError,
    isVerifyingOtp,
    verifyOtpError,
  } = useOtpFlow(() => {
    // ✅ Do nothing — we handle step progression manually
    console.log("OTP verified — handled manually");
  });

  // ✅ Step 1: Email Form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // ✅ Step 3: Password Form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // ✅ Handle Email Submit
  const onSubmitEmail = (data: EmailFormData) => {
    setEmail(data.email);
    sendOtp(data.email)
      .then(() => setStep("otp"))
      .catch(() => {
        // Error handled by hook
      });
  };

  // ✅ Handle OTP Verify
  // ✅ JUST SET STEP — NO OTP VERIFICATION HERE
  // ✅ Handle OTP Verify — JUST SET STEP
  const handleVerifyOtp = () => {
    console.log(
      "✅ Setting step to password — OTP will be verified in reset-password"
    );
    setStep("password");
  };

  // ✅ Handle Password Reset
  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: data.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      const result = await response.json();

      // ✅ Set user + token from response
      const userData = result.user;
      const token = result.token;

      setUser(userData);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("✅ Password reset — logged in");
      navigate("/");
    } catch (error: any) {
      console.error("Password reset error:", error);
    }
  };

  // ✅ Combine errors
  const errorMessage =
    emailErrors.email?.message ||
    passwordErrors.password?.message ||
    passwordErrors.confirmPassword?.message ||
    verifyOtpError?.message ||
    sendOtpError?.message ||
    "";

  return (
    <AuthCardLayout
      title={
        step === "email"
          ? "Reset Password"
          : step === "otp"
          ? "Verify OTP"
          : "Set New Password"
      }
      subtitle={
        step === "email"
          ? "Enter your email to receive a reset code"
          : step === "otp"
          ? "Enter the 6-digit code sent to your email"
          : "Create a new password for your account"
      }
      icon={step === "password" ? <Lock /> : <Email />}
    >
      <IconButton
        onClick={
          step === "email"
            ? onBack
            : () => setStep(step === "otp" ? "email" : "otp")
        }
        sx={{ position: "absolute", left: 16, top: 16 }}
      >
        <ArrowBack />
      </IconButton>

      <AuthErrorAlert message={errorMessage} />

      {step === "email" && (
        <form onSubmit={handleEmailSubmit(onSubmitEmail)}>
          <Controller
            name="email"
            control={emailControl}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                error={!!emailErrors.email}
                helperText={emailErrors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSendingOtp}
            startIcon={<Email />}
            sx={{ py: 1.5 }}
          >
            {isSendingOtp ? (
              <>
                Sending OTP... <CircularProgress size={16} />
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <OtpForm
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOtp}
          isVerifying={isVerifyingOtp}
          onBack={() => setStep("email")}
          error={!!verifyOtpError}
        />
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
          <PasswordField
            name="password"
            label="New Password"
            control={passwordControl}
            error={!!passwordErrors.password}
            helperText={passwordErrors.password?.message}
            autoComplete="new-password"
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            control={passwordControl}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            startIcon={<Lock />}
            sx={{ py: 1.5, mt: 2 }}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  );
};
