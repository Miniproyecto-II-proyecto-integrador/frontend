import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../auth/firebase';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import StatusMessage from '../components/StatusMessage';
import TextField from '../components/TextField';

export default function Ingreso() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState<'manual' | 'google' | null>(null);
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const requested = (location.state as { from?: string } | null)?.from;
  const destination = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/panel';
  useEffect(() => { document.title = 'Iniciar sesión | Study Room'; }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = { email: email.trim() ? undefined : 'Escribe tu correo electrónico.', password: password ? undefined : 'Escribe tu contraseña.' };
    setErrors(nextErrors); setMessage('');
    if (nextErrors.email || nextErrors.password) { (nextErrors.email ? emailRef : passwordRef).current?.focus(); return; }
    if (!auth) { setMessage('El inicio de sesión no está configurado. Inténtalo más tarde.'); return; }
    setLoading('manual');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setSuccess(true); window.setTimeout(() => navigate(destination, { replace: true }), 800);
    } catch (error) {
      const code = (error as { code?: string }).code;
      setMessage(['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code ?? '') ? 'Correo o contraseña incorrectos' : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally { setLoading(null); }
  }

  async function google() {
    setMessage('');
    if (!auth) { setMessage('El inicio de sesión no está configurado. Inténtalo más tarde.'); return; }
    setLoading('google');
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess(true);
      window.setTimeout(() => navigate(destination, { replace: true }), 800);
    } catch { setMessage('No se pudo completar el ingreso con Google. Inténtalo de nuevo.'); }
    finally { setLoading(null); }
  }

  return <section className="mx-auto w-full max-w-md px-5 py-12"><div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-6 sm:p-8"><h1 className="text-2xl font-bold text-white">Iniciar sesión</h1><p className="mt-2 text-sm text-slate-300">Bienvenido de nuevo a Study Room.</p>{requested && <p className="mt-4 text-sm text-slate-300">Inicia sesión para continuar.</p>}<div className="mt-6 space-y-4">{message && <StatusMessage type="error">{message}</StatusMessage>}{success && <StatusMessage type="success">Sesión iniciada correctamente.</StatusMessage>}<Button variant="secondary" className="w-full" onClick={google} disabled={Boolean(loading) || success}>{loading === 'google' && <Spinner />}{loading === 'google' ? 'Conectando con Google…' : 'Continuar con Google'}</Button><form onSubmit={submit} noValidate className="space-y-4"><TextField ref={emailRef} label="Correo electrónico" type="email" autoComplete="email" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={Boolean(loading) || success} /><TextField ref={passwordRef} label="Contraseña" type="password" autoComplete="current-password" placeholder="Escribe tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} disabled={Boolean(loading) || success} /><Button type="submit" className="w-full" disabled={Boolean(loading) || success}>{loading === 'manual' && <Spinner />}{loading === 'manual' ? 'Iniciando sesión…' : 'Iniciar sesión'}</Button></form><p className="text-center text-sm text-slate-300">¿No tienes cuenta? <Link className="text-blue-300 underline focus-visible:outline-2 focus-visible:outline-offset-2" to="/registro">Regístrate</Link></p></div></div></section>;
}
