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
  return <section className="mx-auto w-full max-w-md px-5 py-12"><div className="space-y-5 rounded-2xl border border-[#1e293b] bg-[#111827] p-6 sm:p-8"><h1 className="text-2xl font-bold text-white">Elige tu nombre de usuario</h1><p className="text-sm text-slate-300">Completa tu perfil para continuar.</p><div className="flex items-center gap-3">{user.photoURL && <img src={user.photoURL} alt="" className="size-12 rounded-full" />}<div><p className="font-medium text-white">{user.displayName}</p><p className="text-sm text-slate-300">{user.email}</p></div></div>{success && <StatusMessage type="success">Tu nombre de usuario se guardó correctamente.</StatusMessage>}<form onSubmit={submit} noValidate className="space-y-4"><TextField ref={fieldRef} label="Nombre de usuario" placeholder="Ej. alejandra" value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} error={error} disabled={loading || success} /><Button type="submit" className="w-full" disabled={loading || success}>{loading && <Spinner />}{loading ? 'Guardando…' : 'Confirmar'}</Button></form></div></section>;
}
