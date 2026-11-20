import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import type { Profile } from './users';

type AuthState = {
  user: User | null;
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const userUid = useRef<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onIdTokenChanged(
      auth,
      (nextUser) => {
        const nextUid = nextUser?.uid ?? null;
        if (userUid.current !== nextUid) setProfile(null);
        userUid.current = nextUid;
        setUser(nextUser);
        setLoading(false);
      },
      () => {
        userUid.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
      },
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        loading,
        getIdToken: async () =>
          auth?.currentUser ? auth.currentUser.getIdToken() : null,
        signOut: async () => {
          if (auth) await signOut(auth);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// El proveedor y su hook se mantienen juntos para compartir el contexto privado.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider');
  return context;
}
