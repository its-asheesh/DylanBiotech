// src/firebase-admin.ts
import * as admin from "firebase-admin";
import * as serviceAccount from "./config/dylanbiotech-fd09f-firebase-adminsdk-fbsvc-824e271979.json"; // ✅ Direct JSON import

// Initialize only once
if (!admin.apps.length) {
  try {
    // Validate
    if (!serviceAccount.private_key) {
      throw new Error("Service account is missing 'private_key'");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed:", error);
    process.exit(1);
  }
}

export default admin;