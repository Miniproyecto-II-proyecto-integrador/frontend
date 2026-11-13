import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

type AuthState = { user: User | null; loading: boolean; getIdToken: () => Promise<string | null>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  useEffect(() => {
    if (!auth) return;
    return onIdTokenChanged(auth, (nextUser) => { setUser(nextUser); setLoading(false); }, () => { setUser(null); setLoading(false); });
  }, []);
  return <AuthContext.Provider value={{ user, loading, getIdToken: async () => auth?.currentUser ? auth.currentUser.getIdToken() : null, signOut: async () => { if (auth) await signOut(auth); } }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider');
  return context;
}
