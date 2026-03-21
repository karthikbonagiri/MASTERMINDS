'use client';
// src/lib/auth-context.tsx
// ============================================================
// Global Authentication Context
// - Tracks Firebase Auth user state
// - Checks Firestore for admin role on login
// - Provides signIn / signOut / isAdmin to all components
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Types ────────────────────────────────────────────────────
interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  adminData: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAdminData(firebaseUser: User): Promise<void> {
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      setAdminData(snap.exists() ? (snap.data() as AdminUser) : null);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setAdminData(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchAdminData(firebaseUser);
      } else {
        setAdminData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await fetchAdminData(credential.user);
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setAdminData(null);
  };

  const isAdmin = !!user && adminData?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, adminData, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
