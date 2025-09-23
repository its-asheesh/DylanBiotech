// src/components/auth/LoginForm.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";

// ✅ Reusable Hooks
import { useFirebaseAuthRedirect } from "@/hooks/useFirebaseAuthRedirect";
import { useGoogleAuthHandler } from "@/hooks/useGoogleAuthHandler";
import { useOtpFlow } from "@/hooks/useOtpFlow";
import { useAuthForm } from "@/hooks/useAuthForm";

// ✅ Reusable Components
import { AuthCardLayout } from "./AuthCardLayout";
import { OtpForm } from "./OtpForm";
import { GoogleButton } from "./GoogleButton";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { PasswordField } from "./PasswordField";
import { AuthMethodDivider } from "./AuthMethodDivider";
import { AuthRedirectLink } from "./AuthRedirectLink";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// ✅ MUI
import {
  Box,
  Link as MuiLink,
  TextField,
  Button,
  Typography,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { Email, Login as LoginIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// ✅ Zod Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ✅ Main Component
const LoginForm: React.FC = () => {
  useAuthForm();

  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate(); // ← Add this

  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");

  // ✅ Firebase Redirect Handling
  useFirebaseAuthRedirect();

  // ✅ Google Auth
  const { handleGoogleAuth, isPending: isGooglePending } =
    useGoogleAuthHandler();

  // ✅ OTP Flow — KEEP YOUR ORIGINAL LOGIC
  const {
    sendOtp,
    isSendingOtp,
    sendOtpError,
    isVerifyingOtp,
    verifyOtpError,
  } = useOtpFlow(); // ← Don't pass onSuccess — handle in handleVerifyOtp

  // ✅ Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = useWatch({ control, name: "email" });
  const [debouncedEmail] = useDebounce(emailValue, 500);

  // ✅ Validate email exists on debounce
  useEffect(() => {
    if (!debouncedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(debouncedEmail)) {
      clearErrors("email");
      return;
    }

    const controller = new AbortController();

    const validateEmailAvailability = async () => {
      try {
        const response = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(debouncedEmail)}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Network error");

        const data = await response.json();

        // ✅ Only update if this is the latest request
        if (controller.signal.aborted) return;

        if (!data.exists) {
          setError("email", {
            type: "manual",
            message: "This email is not registered",
          });
        } else {
          clearErrors("email");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            console.error("Failed to validate email:", err);
          }
        }
      }
    };

    validateEmailAvailability();

    return () => {
      controller.abort(); // ✅ Cancel previous request
    };
  }, [debouncedEmail, setError, clearErrors]);
  // ✅ Submit
  const onSubmit = (data: LoginFormData) => {
    login(data.email, data.password, rememberMe)
      .then(() => navigate("/"))
      .catch((error) => {
        console.error("Login error:", error.message || error);
      });
  };

  // ✅ Handle OTP — YOUR ORIGINAL WORKING LOGIC
  const handleSendOtp = async () => {
    try {
      await sendOtp(getValues("email"));
      setIsOtpMode(true);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await loginWithOtp(getValues("email"), otp);
      navigate("/");
    } catch (error: unknown) {
      // ← Explicitly type as unknown
      if (error instanceof Error) {
        if (error.message !== "Invalid or expired OTP") {
          console.error("OTP Verification Error:", error.message);
        }
      } else {
        console.error("OTP Verification Error: Unknown error", error);
      }
    }
  };

  // ✅ Combine errors
  const errorMessage =
    errors.email?.message ||
    errors.password?.message ||
    verifyOtpError?.message ||
    sendOtpError?.message ||
    "";

  if (isForgotPasswordMode) {
    return <ForgotPasswordForm onBack={() => setIsForgotPasswordMode(false)} />;
  }

  return (
    <AuthCardLayout
      title="Welcome Back"
      subtitle="Sign in to your Company Name account" //DylanBiotech
      icon={<LoginIcon />}
    >
      {isOtpMode ? (
        <OtpForm
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOtp}
          isVerifying={isVerifyingOtp}
          onBack={() => setIsOtpMode(false)}
          error={!!verifyOtpError}
          onResend={() => sendOtp(getValues("email"))}
          expiryTime={600} // 10 minutes
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
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
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me"
            sx={{ mb: 1, "& .MuiTypography-root": { fontWeight: 500 } }}
          />
          <FormHelperText sx={{ mb: 3 }}>
            Check this box if you're on a personal device.
          </FormHelperText>

          <AuthErrorAlert message={errorMessage} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isVerifyingOtp}
            startIcon={<LoginIcon />}
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
            Sign In
          </Button>

          <AuthMethodDivider />

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <MuiLink
              component="button"
              type="button"
              onClick={() => setIsForgotPasswordMode(true)}
              variant="body2"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: "bold",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot Password?
            </MuiLink>
          </Box>
          <GoogleButton
            onClick={handleGoogleAuth}
            isPending={isGooglePending}
            label="Sign in with Google"
          />

          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            or
          </Typography>

          <Button
            fullWidth
            variant="text"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                Sending OTP... <CircularProgress size={16} />
              </>
            ) : (
              "Login with Email OTP"
            )}
          </Button>

          <AuthRedirectLink
            text="Don't have an account?"
            href="/register"
            linkText="Sign up here"
          />
        </form>
      )}
    </AuthCardLayout>
  );
};

export default LoginForm;
