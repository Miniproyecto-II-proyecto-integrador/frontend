import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import { ApiError, getProfile } from './users';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [result, setResult] = useState<{ uid: string; status: 'ok' | 'missing' | 'error' } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    getProfile().then(() => { if (active) setResult({ uid: user.uid, status: 'ok' }); }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401 && auth) { void signOut(auth); return; }
      setResult({ uid: user.uid, status: error instanceof ApiError && error.detail.codigo === 'PERFIL_NO_ENCONTRADO' ? 'missing' : 'error' });
    });
    return () => { active = false; };
  }, [user, attempt]);
  const status = user && result?.uid === user.uid ? result.status : 'loading';
  if (loading || (user && status === 'loading')) return <div role="status" className="flex items-center justify-center gap-3 p-12"><Spinner /> Verificando tu sesión…</div>;
  if (!user) return <Navigate to="/ingreso" replace state={{ from: location.pathname + location.search + location.hash }} />;
  if (status === 'error') return <div className="p-8"><p role="alert">No pudimos verificar tu perfil.</p><button type="button" className="mt-3 underline focus-visible:outline-2" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button></div>;
  if (status === 'missing' && user.providerData.some((provider) => provider.providerId === 'google.com')) return <Navigate to="/nombre-de-usuario" replace state={{ from: location.pathname + location.search + location.hash }} />;
  if (status === 'missing') return <div role="alert" className="p-8">Tu cuenta aún no tiene perfil. Contacta al equipo para completar tu registro.</div>;
  return <Outlet />;
}
