import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../auth/firebase';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import StatusMessage from '../components/StatusMessage';
import TextField from '../components/TextField';
import GoogleIcon from '../components/GoogleIcon';

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

  return (
    <section className="font-serif mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-8 sm:py-12">
      <div className="w-full rounded-lg bg-[#0d1c2d] p-6 shadow-xl sm:p-9">
        <Link to="/" className="text-sm text-blue-200 hover:underline focus-visible:outline-2">← Volver al inicio</Link>
        <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-blue-300">Acceso para estudiantes</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#dce8ff]">Ingreso a Study Room</h1>
        <p className="mt-2 text-sm text-slate-300">Bienvenido de nuevo. Ingresa a tus salas de estudio.</p>
        {requested && <p className="mt-4 text-sm text-slate-300">Inicia sesión para continuar.</p>}
        <div className="mt-7 space-y-5">
          {message && <StatusMessage type="error">{message}</StatusMessage>}{success && <StatusMessage type="success">Sesión iniciada correctamente.</StatusMessage>}
          <Button variant="secondary" className="w-full !border-0 !bg-[#1b2b3d] !py-3" onClick={google} disabled={Boolean(loading) || success}>{loading === 'google' ? <><Spinner /> Conectando con Google…</> : <><GoogleIcon /> Continuar con Google</>}</Button>
          <div className="flex items-center gap-3 text-xs text-slate-300"><span className="h-px flex-1 bg-slate-700" />o con tu correo de estudio<span className="h-px flex-1 bg-slate-700" /></div>
          <form onSubmit={submit} noValidate className="space-y-5">
            <TextField ref={emailRef} label="Correo electrónico" type="email" autoComplete="email" placeholder="estudiante@universidad.edu" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((old) => ({ ...old, email: undefined })); }} error={errors.email} disabled={Boolean(loading) || success} />
            <TextField ref={passwordRef} label="Contraseña" type="password" autoComplete="current-password" placeholder="Escribe tu contraseña" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((old) => ({ ...old, password: undefined })); }} error={errors.password} disabled={Boolean(loading) || success} />
            <Button type="submit" className="w-full !bg-[#b4c5ff] !py-3 !text-[#00174b] hover:!bg-[#cbd6ff]" disabled={Boolean(loading) || success}>{loading === 'manual' && <Spinner />}{loading === 'manual' ? 'Iniciando sesión…' : 'Iniciar sesión'}</Button>
          </form>
          <p className="pt-5 text-center text-sm text-slate-300">¿No tienes cuenta? <Link className="text-blue-200 underline focus-visible:outline-2 focus-visible:outline-offset-2" to="/registro">Registrarse</Link></p>
        </div>
      </div>
    </section>
  );
}
