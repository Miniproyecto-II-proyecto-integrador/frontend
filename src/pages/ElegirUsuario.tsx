import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError, createProfile } from '../auth/users';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import StatusMessage from '../components/StatusMessage';
import TextField from '../components/TextField';

export default function ElegirUsuario() {
  const { user, loading: checking } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const requested = (location.state as { from?: unknown } | null)?.from;
  const destination = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/panel';
  useEffect(() => { document.title = 'Elegir nombre de usuario | Study Room'; }, []);
  if (checking) return <div role="status" className="p-8"><Spinner /> Verificando tu sesión…</div>;
  if (!user) return <Navigate to="/ingreso" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim()) { setError('Escribe un nombre de usuario.'); fieldRef.current?.focus(); return; }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username.trim())) { setError('Usa de 3 a 20 caracteres: letras, números o guion bajo (_), sin espacios.'); fieldRef.current?.focus(); return; }
    setLoading(true); setError('');
    try { await createProfile({ username: username.trim() }); setSuccess(true); window.setTimeout(() => navigate(destination, { replace: true }), 800); }
    catch (err) { setError(err instanceof ApiError ? err.detail.campos?.username ?? err.message : 'No se pudo guardar tu nombre de usuario. Inténtalo de nuevo.'); fieldRef.current?.focus(); }
    finally { setLoading(false); }
  }
  return <section className="font-serif mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-8"><div className="w-full space-y-6 rounded-lg bg-[#122133] p-6 shadow-xl sm:p-9"><p className="inline-block rounded bg-[#203248] px-2 py-1 text-xs text-blue-200">● Paso obligatorio tras autenticación con Google</p><div><h1 className="text-3xl font-bold tracking-tight text-[#dce8ff]">Elige tu nombre de usuario</h1><p className="mt-3 text-sm leading-6 text-slate-300">Antes de continuar, necesitamos que elijas cómo aparecerás en Study Room.</p></div><div className="flex items-center gap-3 rounded-md bg-[#0d1c2d] p-3">{user.photoURL && <img src={user.photoURL} alt="" className="size-12 rounded-full" />}<div><p className="font-medium text-white">{user.displayName}</p><p className="break-all text-sm text-slate-300">{user.email}</p></div></div>{success && <StatusMessage type="success">Tu nombre de usuario se guardó correctamente.</StatusMessage>}<form onSubmit={submit} noValidate className="space-y-5"><TextField ref={fieldRef} label="Nombre de usuario" placeholder="tu_usuario" maxLength={20} helpText="De 3 a 20 letras, números o guion bajo (_), sin espacios." value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} error={error} disabled={loading || success} /><Button type="submit" className="w-full !py-3" disabled={loading || success}>{loading && <Spinner />}{loading ? 'Guardando…' : 'Continuar'}</Button></form></div></section>;
}
