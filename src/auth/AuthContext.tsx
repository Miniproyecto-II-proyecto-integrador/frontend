import { createContext, useContext, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

type ProfileSummary = { uid: string; avatar: string; username: string };
type AuthState = {
  user: User | null;
  loading: boolean;
  profileSummary: ProfileSummary | null;
  setProfileSummary: Dispatch<SetStateAction<ProfileSummary | null>>;
  getIdToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  useEffect(() => {
    if (!auth) return;
    return onIdTokenChanged(auth, (nextUser) => {
      setUser(nextUser);
      setProfileSummary((current) =>
        nextUser && current?.uid === nextUser.uid ? current : null,
      );
      setLoading(false);
    }, () => {
      setUser(null);
      setProfileSummary(null);
      setLoading(false);
    });
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileSummary,
        setProfileSummary,
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
