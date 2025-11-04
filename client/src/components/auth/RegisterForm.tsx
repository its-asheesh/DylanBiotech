// src/components/auth/RegisterForm.tsx
"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// ✅ Reusable Hooks
import { useGoogleAuthHandler } from "@/hooks/useGoogleAuthHandler";
import { useOtpFlow } from "@/hooks/useOtpFlow";
import { useAuth } from "@/context/AuthContext";
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
import { Person, Email, PersonAdd, PhoneAndroid } from "@mui/icons-material";

// ✅ Zod Schema (unchanged)
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

const RegisterForm: React.FC = () => {
  useAuthForm();
  const [step, setStep] = useState<1 | 2>(1); // 👈 NEW: Multi-step state
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const { user, token, setUser, setToken } = useAuth();
  const { handleGoogleAuth, isPending: isGooglePending } = useGoogleAuthHandler();
  const {
    sendOtp,
    isSendingOtp,
    sendOtpError,
    verifyOtpAsync,
    isVerifyingOtp,
    verifyOtpError,
  } = useOtpFlow();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
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

  // ✅ STEP 1: On "Continue" → Validate name & go to Step 2
  const handleContinue = async () => {
    const isNameValid = await trigger("name");
    if (isNameValid) {
      setStep(2);
    }
  };

  // ✅ STEP 2: On Submit → Send OTP
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

  const handleVerifyOtp = async () => {
    if (!formData) return;
    try {
      const userData = await verifyOtpAsync({
        email: formData.email,
        otp,
        password: formData.password,
      });

      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email || null,
        role: userData.role,
      });
      setToken(userData.token);
      localStorage.setItem("token", userData.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        })
      );
    } catch (error: any) {
      const msg = error.message || "Failed to create account";
      setSubmitError(msg);
      console.error("Registration Error:", error);
    }
  };

  useEffect(() => {
    if (user && token && isMounted.current) {
      navigate("/");
    }
  }, [user, token, navigate]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const errorMessage =
    submitError || verifyOtpError?.message || sendOtpError?.message || "";

  // ✅ Render Step 1: Only Full Name
  if (step === 1) {
    return (
      <AuthCardLayout
        title="Join DylanBiotech"
        subtitle="Let's get started"
        icon={<PersonAdd />}
      >
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
        <Button
          fullWidth
          variant="contained"
          onClick={handleContinue}
          disabled={isSubmitting}
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
          Continue
        </Button>
        <Box sx={{ mt: 3 }}>
          <AuthRedirectLink
            text="Already have an account?"
            href="/login"
            linkText="Sign in here"
          />
        </Box>
      </AuthCardLayout>
    );
  }

  // ✅ Render Step 2: Email, Password, etc.
  if (isOtpMode) {
    return (
      <AuthCardLayout
        title="Verify Your Email"
        subtitle="Enter the OTP sent to your email"
        icon={<Email />}
      >
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
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      title="Create Your Account"
      subtitle="Complete your registration"
      icon={<PersonAdd />}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
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

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate("/signup-mobile")}
          sx={{ mt: 2, py: 1.2, borderRadius: 2 }}
        >
          <PhoneAndroid sx={{ mr: 1 }} />
          Sign up with Mobile
        </Button>

        <AuthRedirectLink
          text="Already have an account?"
          href="/login"
          linkText="Sign in here"
        />
      </form>
    </AuthCardLayout>
  );
};

export default RegisterForm;