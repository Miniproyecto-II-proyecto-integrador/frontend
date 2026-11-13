import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../auth/firebase';
import { useAuth } from '../auth/AuthContext';
import { ApiError, checkUsername, createProfile } from '../auth/users';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import StatusMessage from '../components/StatusMessage';
import TextField from '../components/TextField';
import GoogleIcon from '../components/GoogleIcon';

type Fields = { nombres: string; apellidos: string; username: string; avatar: string; correo: string; contrasena: string };
const initial: Fields = { nombres: '', apellidos: '', username: '', avatar: 'avatar-1', correo: '', contrasena: '' };
export default function Registro() {
  const { user } = useAuth();
  const location = useLocation();
  const completingProfile = Boolean((location.state as { completarPerfil?: boolean } | null)?.completarPerfil && user);
  const [form, setForm] = useState<Fields>(() => ({ ...initial, correo: completingProfile ? user?.email ?? '' : '' }));
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [general, setGeneral] = useState('');
  const [pendingProfile, setPendingProfile] = useState(completingProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Registro | Study Room'; }, []);
  function change(field: keyof Fields, value: string) { setForm((old) => ({ ...old, [field]: value })); setErrors((old) => ({ ...old, [field]: undefined })); }
  async function google() {
    if (!auth) { setGeneral('El ingreso con Google no está configurado.'); return; }
    setLoading(true); setGeneral('');
    try { await signInWithPopup(auth, googleProvider); navigate('/panel', { replace: true }); }
    catch { setGeneral('No se pudo completar el ingreso con Google. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!form.nombres.trim()) next.nombres = 'Escribe tus nombres.';
    else if (form.nombres.trim().length > 60) next.nombres = 'Usa hasta 60 caracteres.';
    if (!form.apellidos.trim()) next.apellidos = 'Escribe tus apellidos.';
    else if (form.apellidos.trim().length > 60) next.apellidos = 'Usa hasta 60 caracteres.';
    if (!/^[A-Za-z0-9_]{3,20}$/.test(form.username.trim())) next.username = 'Usa de 3 a 20 caracteres: letras, números o guion bajo (_), sin espacios.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) next.correo = 'Escribe un correo válido.';
    if (!pendingProfile && form.contrasena.length < 6) next.contrasena = 'Usa al menos 6 caracteres.';
    setErrors(next); setGeneral('');
    const first = Object.keys(next)[0];
    if (first) { document.getElementById(`registro-${first}`)?.focus(); return; }
    if (!auth) { setGeneral('El registro no está configurado. Inténtalo más tarde.'); return; }
    setLoading(true);
    try {
      const availability = await checkUsername(form.username);
      if (!availability.disponible) { setErrors({ username: 'Ese nombre de usuario ya está en uso. Prueba con otro.' }); document.getElementById('registro-username')?.focus(); return; }
      if (!pendingProfile) { await createUserWithEmailAndPassword(auth, form.correo.trim(), form.contrasena); setPendingProfile(true); }
      else if (!auth.currentUser || auth.currentUser.email?.toLowerCase() !== form.correo.trim().toLowerCase()) throw new Error('La sesión cambió. Inicia sesión de nuevo para completar el perfil.');
      await createProfile({ nombres: form.nombres.trim(), apellidos: form.apellidos.trim(), username: form.username.trim(), avatar: form.avatar });
      setSuccess(true); window.setTimeout(() => navigate('/panel', { replace: true }), 800);
    } catch (error) {
      if (error instanceof ApiError && error.detail.codigo === 'PERFIL_YA_EXISTE') { setSuccess(true); window.setTimeout(() => navigate('/panel', { replace: true }), 800); }
      else if (error instanceof ApiError && error.detail.campos) { setErrors(error.detail.campos); const key = Object.keys(error.detail.campos)[0]; window.setTimeout(() => document.getElementById(`registro-${key}`)?.focus(), 0); }
      else if ((error as { code?: string }).code === 'auth/email-already-in-use') { setErrors({ correo: 'Este correo ya está registrado. Puedes iniciar sesión.' }); window.setTimeout(() => document.getElementById('registro-correo')?.focus(), 0); }
      else setGeneral(error instanceof Error ? error.message : 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
    } finally { setLoading(false); }
  }
  return <section className="font-serif mx-auto w-full max-w-2xl px-4 py-8 sm:py-12"><div className="rounded-lg bg-[#0d1c2d] p-6 shadow-xl sm:p-10">
    <Link to="/" className="text-sm text-blue-200 hover:underline focus-visible:outline-2">← Volver al inicio</Link>
    <h1 className="mt-7 text-3xl font-bold tracking-tight text-[#dce8ff]">Crear tu cuenta</h1><p className="mt-2 text-sm leading-6 text-slate-300">Únete a Study Room y colabora en tiempo real en salas de estudio y proyectos en equipo.</p>
    <div className="mt-6 space-y-5">{general && <StatusMessage type="error">{general}</StatusMessage>}{success && <StatusMessage type="success">Tu cuenta se creó correctamente.</StatusMessage>}
    {!pendingProfile && <><Button variant="secondary" className="w-full !border-0 !bg-[#152537] !py-3" onClick={google} disabled={loading || success}><GoogleIcon /> {loading ? 'Conectando…' : 'Continuar con Google'}</Button><div className="flex items-center gap-3 text-xs text-slate-300"><span className="h-px flex-1 bg-slate-700" />o regístrate con tu correo<span className="h-px flex-1 bg-slate-700" /></div></>}
    <form onSubmit={submit} noValidate className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{(['nombres', 'apellidos'] as const).map((key) => <TextField key={key} id={`registro-${key}`} label={key === 'nombres' ? 'Nombres' : 'Apellidos'} placeholder={key === 'nombres' ? 'Ej. Mateo' : 'Ej. Salazar'} value={form[key]} onChange={(event) => change(key, event.target.value)} error={errors[key]} disabled={loading || success} />)}</div>
    <div className="grid gap-4 sm:grid-cols-[11rem_1fr]"><fieldset disabled={loading || success}><legend className="mb-2 text-sm font-medium text-slate-300">Foto o avatar</legend><div className="flex flex-wrap gap-2">{['avatar-1', 'avatar-2', 'avatar-3'].map((avatar, index) => <label key={avatar} className={`flex size-11 items-center justify-center rounded-lg border text-xs ${form.avatar === avatar ? 'border-blue-300 bg-blue-600 text-white' : 'border-slate-600 bg-[#03111f] text-slate-300'}`}><input className="sr-only peer" aria-label={`Avatar ${index + 1}`} type="radio" name="avatar" value={avatar} checked={form.avatar === avatar} onChange={() => change('avatar', avatar)} /><span className="rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blue-300">{index + 1}</span></label>)}</div></fieldset><TextField id="registro-username" label="Nombre de usuario" placeholder="mateo_dev" helpText="De 3 a 20 letras, números o guion bajo (_), sin espacios." value={form.username} onChange={(event) => change('username', event.target.value)} error={errors.username} disabled={loading || success} /></div>
    <TextField id="registro-correo" label="Correo electrónico institucional o personal" type="email" autoComplete="email" placeholder="mateo.salazar@universidad.edu" value={form.correo} onChange={(event) => change('correo', event.target.value)} error={errors.correo} disabled={loading || success || pendingProfile} />
    <TextField id="registro-contrasena" label="Contraseña" type="password" autoComplete="new-password" placeholder="Escribe tu contraseña" helpText="Tu contraseña debe tener al menos 6 caracteres." value={form.contrasena} onChange={(event) => change('contrasena', event.target.value)} error={errors.contrasena} disabled={loading || success || pendingProfile} />
    <Button type="submit" className="w-full !py-3" disabled={loading || success}>{loading && <Spinner />}{loading ? 'Creando tu cuenta…' : pendingProfile ? 'Reintentar' : 'Registrarse en Study Room'}</Button><p className="pt-3 text-center text-sm text-slate-300">¿Ya tienes cuenta? <Link to="/ingreso" className="text-blue-200 underline">Iniciar sesión</Link></p></form></div></div></section>;
}
