// src/components/auth/MobileLoginFirebase.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebaseClient";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { OtpForm } from "./OtpForm"; // ✅ Reuse shared OTP form
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface FirebasePhoneLoginResponse {
  _id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "user" | "admin";
  token: string;
}

export const MobileLoginFirebase = () => {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { setUser, setToken } = useAuth();
  const recaptchaInitialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initRecaptcha = () => {
      if (!recaptchaInitialized.current) {
        const container = document.getElementById("recaptcha-container");
        if (container) {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
          }
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
              callback: (response: any) => {
                console.log("reCAPTCHA solved:", response);
              },
              "expired-callback": () => {
                console.log("reCAPTCHA expired");
              },
            }
          );
          recaptchaInitialized.current = true;
          console.log("✅ reCAPTCHA verifier initialized");
        }
      }
    };

    const timer = setTimeout(initRecaptcha, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSendingOtp(true);
    setError("");
    try {
      const container = document.getElementById("recaptcha-container");
      if (!container) throw new Error("reCAPTCHA container not found");

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
    } catch (err: any) {
      console.error("Firebase OTP Error:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otp) return;

    try {
      setError("");
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const firebasePhone = credential.user.phoneNumber;

      // ✅ Use fetch instead of axios (consistent with other flows)
      const res = await fetch("/api/auth/firebase-phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, phone: firebasePhone }),
      });

      if (!res.ok) throw new Error("Authentication failed");

      const userData: FirebasePhoneLoginResponse = await res.json();

      // ✅ Update context with proper types
      setUser({
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email || null, // ✅ Handle null
        role: userData.role,
      });
      setToken(userData.token);
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify({
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        role: userData.role,
      }));
      // ✅ IMMEDIATE REDIRECT TO UNMOUNT COMPONENT
    navigate("/");
    } catch (err: any) {
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <div id="recaptcha-container" style={{ display: "none" }}></div>

      {!confirmationResult ? (
        <Box>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isSendingOtp ? (
              <>
                Sending OTP... <CircularProgress size={16} />
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 1, textAlign: "center" }}>
              {error}
            </Typography>
          )}
        </Box>
      ) : (
        <OtpForm // ✅ REUSE SHARED COMPONENT
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOtp}
          isVerifying={false}
          onBack={() => {
            setConfirmationResult(null);
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              delete window.recaptchaVerifier;
            }
            recaptchaInitialized.current = false;
          }}
          error={!!error}
          onResend={handleSendOtp}
          expiryTime={600} // Firebase OTP expires in 10 mins
        />
      )}
    </Box>
  );
};