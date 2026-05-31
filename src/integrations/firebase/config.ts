// ============================================================================
// Firebase configuration — Victoria Keba
// ----------------------------------------------------------------------------
// These values are the Firebase *web* config. They are PUBLISHABLE (safe to
// ship in the client bundle) — security is enforced by Firestore/Storage rules,
// not by hiding these keys.
//
// 👉 Replace the placeholder values below with YOUR Firebase project config.
//    Firebase Console → Project settings → General → "Your apps" → SDK setup.
// ============================================================================
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "YOUR_APP_ID",
};

/** True once real config values are present (not placeholders). */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

// Avoid re-initializing during HMR / SSR.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
