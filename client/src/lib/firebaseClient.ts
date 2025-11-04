// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const validateFirebaseConfig = () => {
  const requiredKeys = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
  ]

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key])

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase environment variables: ${missingKeys.join(", ")}`)
  }

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your_") || firebaseConfig.apiKey.includes("XXXXX")) {
    throw new Error("Please replace VITE_FIREBASE_API_KEY with your actual Firebase API key")
  }

  if (!firebaseConfig.appId || firebaseConfig.appId.includes("your_") || firebaseConfig.appId.includes("123456")) {
    throw new Error("Please replace VITE_FIREBASE_APP_ID with your actual Firebase App ID")
  }

  if (!firebaseConfig.authDomain?.includes(".firebaseapp.com")) {
    throw new Error("Invalid Firebase auth domain format")
  }
}

// ✅ Initialize Firebase with enhanced error handling and validation
let app
let authInstance
let googleProvider: GoogleAuthProvider
try {
  validateFirebaseConfig()

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  authInstance = getAuth(app)

  googleProvider = new GoogleAuthProvider()
  googleProvider.addScope("email")
  googleProvider.addScope("profile")
  googleProvider.setCustomParameters({
    prompt: "select_account",
  })

  // Validate initialization
  if (!authInstance) {
    throw new Error("Firebase Auth failed to initialize")
  }

  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)

  if (error instanceof Error) {
    if (error.message.includes("Missing Firebase environment variables")) {
      console.error("🔧 Please check your .env file and ensure all Firebase environment variables are set")
    } else if (error.message.includes("Invalid Firebase")) {
      console.error("🔧 Please verify your Firebase configuration values")
    } else if (error.message.includes("Please replace")) {
      console.error("🔧 Please replace the placeholder values in your Firebase configuration with actual values")
    }
  }

  throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
}
console.log("Firebase App ID:", app.options.appId)
console.log("Firebase API Key:", app.options.apiKey)
console.log("🔥 Active Firebase Project:", app.options.projectId)

export const auth = authInstance
export { googleProvider }
export { signInWithPopup, signInWithRedirect, getRedirectResult }
