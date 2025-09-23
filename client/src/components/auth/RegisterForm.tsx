// src/components/auth/RegisterForm.tsx
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// ✅ Reusable Hooks
import { useGoogleAuthHandler } from "@/hooks/useGoogleAuthHandler";
import { useOtpFlow } from "@/hooks/useOtpFlow";
import { useAuth } from "@/context/AuthContext"; // ← IMPORTANT
import { useAuthForm } from "@/hooks/useAuthForm";

// ✅ Reusable Components
import { AuthCardLayout } from "./AuthCardLayout";
import { OtpForm } from "./OtpForm";
import { GoogleButton } from "./GoogleButton";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { PasswordField } from "./PasswordField";
import { AuthMethodDivider } from "./AuthMethodDivider";
import { AuthRedirectLink } from "./AuthRedirectLink";

// ✅ MUI
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Person, Email, PersonAdd } from "@mui/icons-material";

// Define API response shape
interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string;
}

// ✅ Zod Schema
const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
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

type RegisterFormData = z.infer<typeof registerSchema>;

// ✅ Main Component
const RegisterForm: React.FC = () => {
  useAuthForm();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState<RegisterFormData | null>(null);

  const navigate = useNavigate();
  const isMounted = useRef(true);

  // ✅ Get auth context — critical for auto-login
  const { user, token, setUser, setToken } = useAuth();

  // ✅ Google Auth
  const { handleGoogleAuth, isPending: isGooglePending } =
    useGoogleAuthHandler();

  // ✅ OTP Flow
  const {
    sendOtp,
    isSendingOtp,
    sendOtpError,
    verifyOtp,
    isVerifyingOtp,
    verifyOtpError,
  } = useOtpFlow();

  // ✅ Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return "error";
    if (strength < 50) return "warning";
    if (strength < 75) return "info";
    return "success";
  };

  // ✅ STEP 1: On Submit → Send OTP
  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError("");
    try {
      await sendOtp(data.email);
      setFormData(data);
      setIsOtpMode(true);
    } catch (err: any) {
      setSubmitError("Failed to send OTP. Please try again.");
      console.error("OTP Send Error:", err);
    }
  };

  // ✅ STEP 2: After OTP verified → Register user
  const handleVerifyOtp = async () => {
    if (!formData) return;

    try {
      // Verify OTP first
      await verifyOtp({
        email: formData.email,
        otp,
        password: formData.password,
      });

      // ✅ Register user
      const response = await axios.post<RegisterResponse>(
        "/api/users/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      const { _id, name, email, role, token } = response.data;
      const userData = { _id, name, email, role };

      // ✅ Set in context + localStorage — redirect handled by useEffect below
      setUser(userData);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // ❌ DO NOT NAVIGATE HERE — wait for context to update
    } catch (error: any) {
      if (error.response?.data?.message === "Invalid or expired OTP") {
        setSubmitError("Invalid or expired OTP. Please try again.");
      } else {
        setSubmitError("Failed to create account. Please try again.");
      }
      console.error("Registration Error:", error);
    }
  };

  // ✅ Redirect AFTER context updates (user & token are set)
  useEffect(() => {
    if (user && token) {
      alert("🎉 Account created successfully!");
      if (isMounted.current) {
        navigate("/");
      }
    }
  }, [user, token, navigate]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Combine errors
  const errorMessage =
    submitError || verifyOtpError?.message || sendOtpError?.message || "";

  return (
    <AuthCardLayout
      title="Join Company Name"
      subtitle="Create your account to get started"
      icon={<PersonAdd />}
    >
      {isOtpMode ? (
        <OtpForm
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOtp}
          isVerifying={isVerifyingOtp}
          onBack={() => setIsOtpMode(false)}
          error={!!verifyOtpError}
          onResend={() => sendOtp(formData?.email || "")}
          expiryTime={600}
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Full Name"
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  },
                }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  },
                }}
              />
            )}
          />

          <PasswordField
            name="password"
            label="Password"
            control={control}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="new-password"
          />

          {password && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                color={getStrengthColor(passwordStrength)}
                sx={{ borderRadius: 1, height: 6, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Password strength:{" "}
                {passwordStrength < 25
                  ? "Weak"
                  : passwordStrength < 50
                  ? "Fair"
                  : passwordStrength < 75
                  ? "Good"
                  : "Strong"}
              </Typography>
            </Box>
          )}

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            control={control}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <AuthErrorAlert message={errorMessage} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || isSendingOtp}
            startIcon={<PersonAdd />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              fontSize: "1.1rem",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            {isSendingOtp ? (
              <>
                Sending OTP... <CircularProgress size={16} />
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <AuthMethodDivider text="Or sign up with" />

          <GoogleButton
            onClick={handleGoogleAuth}
            isPending={isGooglePending}
            label="Sign up with Google"
          />

          {/* ❌ REMOVED: "Sign up with Email OTP" button — as requested */}

          <AuthRedirectLink
            text="Already have an account?"
            href="/login"
            linkText="Sign in here"
          />
        </form>
      )}
    </AuthCardLayout>
  );
};

export default RegisterForm;
