// ============================================================================
// Auth context — Victoria Keba
// Email/password + Google sign-in + password reset + role-based access.
// ============================================================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./config";
import { COLLECTIONS, type AppUser } from "./types";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Create the Firestore user document if it doesn't exist yet. */
async function ensureUserDoc(fbUser: FirebaseUser) {
  const ref = doc(db, COLLECTIONS.users, fbUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const newUser: Partial<AppUser> = {
      uid: fbUser.uid,
      name: fbUser.displayName ?? "",
      email: fbUser.email ?? "",
      profileImage: fbUser.photoURL ?? "",
      role: "customer",
      favorites: [],
      cart: [],
    };
    await setDoc(ref, { ...newUser, createdAt: serverTimestamp() });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      unsubProfile?.();
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      await ensureUserDoc(fbUser);
      // Live-sync the profile document (role, cart, favorites in realtime).
      unsubProfile = onSnapshot(doc(db, COLLECTIONS.users, fbUser.uid), (snap) => {
        setProfile(snap.exists() ? ({ uid: snap.id, ...snap.data() } as AppUser) : null);
        setLoading(false);
      });
    });

    return () => {
      unsub();
      unsubProfile?.();
    };
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user);
    },
    [],
  );

  const signInGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (typeof window !== "undefined") {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login",
      });
    } else {
      await sendPasswordResetEmail(auth, email);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        signInEmail,
        signUpEmail,
        signInGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
