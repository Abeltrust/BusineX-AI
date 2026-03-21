import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextValue {
  authLoading: boolean;
  authReady: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [authLoading, setAuthLoading] = useState(false);
  const popupInFlight = useRef(false);

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  const value: AuthContextValue = {
    authLoading,
    authReady,
    user,
    async signInWithGoogle() {
      if (!auth) {
        throw new Error('Firebase authentication is not configured.');
      }

      if (popupInFlight.current) {
        return;
      }

      popupInFlight.current = true;
      setAuthLoading(true);

      try {
        await signInWithPopup(auth, googleProvider);
      } finally {
        popupInFlight.current = false;
        setAuthLoading(false);
      }
    },
    async signOutUser() {
      if (!auth) {
        return;
      }

      await signOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
