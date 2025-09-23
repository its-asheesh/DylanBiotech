// src/hooks/useGoogleAuth.ts
import { useMutation } from "@tanstack/react-query"
import { auth, googleProvider, signInWithPopup } from "@/lib/firebaseClient"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom" // ✅ Add this

export const useGoogleAuth = () => {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate() // ✅ Get navigate

  return useMutation({
    mutationFn: async () => {
      if (typeof window === "undefined") {
        throw new Error("Google Sign-In is only available in browser")
      }

      if (!auth?.app) {
        throw new Error("Firebase is not initialized. Please check your Firebase configuration.")
      }

      if (!googleProvider) {
        throw new Error("Google Auth provider is not configured")
      }

      try {
        console.log("🔵 Starting Google sign-in...")
        const result = await signInWithPopup(auth, googleProvider)
        console.log("✅ Google sign-in successful:", result.user.email)

        const idToken = await result.user.getIdToken()
        console.log("🔵 Got Firebase ID token, calling loginWithGoogle...")

        await loginWithGoogle(idToken)

        console.log("✅ User logged in and state persisted")

        // ✅ Redirect to home page
        navigate("/")

        return { success: true }
      } catch (error: any) {
        console.error("❌ Google sign-in error:", error)

        if (error.code === "auth/popup-closed-by-user") {
          throw new Error("Sign-in was cancelled. Please try again.")
        } else if (error.code === "auth/popup-blocked") {
          throw new Error("Pop-up was blocked by your browser. Please allow pop-ups and try again.")
        } else if (error.code === "auth/network-request-failed") {
          throw new Error("Network error. Please check your internet connection and try again.")
        } else if (error.code === "auth/internal-error") {
          throw new Error("Authentication service error. Please try again later.")
        } else if (error.message?.includes("Backend authentication failed")) {
          throw new Error("Server authentication failed. Please try again.")
        }

        throw error
      }
    },
  })
}