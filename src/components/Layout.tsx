import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import { getProfile } from '../auth/users';
import Avatar from './Avatar';
import Button from './Button';
import Modal from './Modal';
import Spinner from './Spinner';
import StatusMessage from './StatusMessage';

function LogoutIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
    </svg>
  );
}

const navigationItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/panel', label: 'Panel' },
  { to: '/perfil', label: 'Perfil' },
  { to: '/ayuda', label: 'Ayuda' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [profileSummary, setProfileSummary] = useState<{
    uid: string;
    avatar: string;
    username: string;
  } | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    getProfile()
      .then((profile) => {
        if (active) {
          setProfileSummary({
            uid: user.uid,
            avatar: profile.avatar,
            username: profile.username,
          });
        }
      })
      .catch(() => {
        if (active) setProfileSummary(null);
      });
    return () => { active = false; };
  }, [user]);

  const navigate = useNavigate();
  const location = useLocation();
  const authPage = ['/ingreso', '/registro', '/nombre-de-usuario'].includes(location.pathname);
  const username = profileSummary && user && profileSummary.uid === user.uid
    ? profileSummary.username
    : user?.displayName || user?.email?.split('@')[0] || 'Perfil';

  function closeLogoutDialog() {
    if (signingOut) return;
    setLogoutDialogOpen(false);
    setLogoutError('');
  }

  async function confirmSignOut() {
    setSigningOut(true);
    setLogoutError('');
    try {
      await signOut();
      setLogoutDialogOpen(false);
      navigate('/ingreso', { replace: true });
    } catch {
      setLogoutError('No pudimos cerrar sesión. Inténtalo de nuevo.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-200 flex flex-col font-sans">
      {/* Encabezado / Navegación */}
      {!authPage && (
        <header className="w-full border-b border-slate-800/80 bg-[#0b101e] px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 md:gap-4 lg:gap-8">
              <Link to="/" className="flex shrink-0 items-center gap-2.5 group sm:gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors group-hover:bg-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                    <path d="m22 12.5-8.97 4.08a2 2 0 0 1-1.66 0L2 12.5" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Study Room</span>
              </Link>

              <nav aria-label="Navegación principal" className="hidden items-center gap-1 text-sm md:flex">
                {navigationItems.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-colors ${
                        isActive
                          ? 'bg-[#172236] text-white'
                          : 'text-slate-400 hover:bg-[#111a29] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-transparent'}`}
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-2 lg:gap-4">
              {user ? (
                <>
                  <Link
                    to="/perfil"
                    aria-label={`Perfil de ${username}`}
                    className="flex min-w-0 items-center gap-2 rounded-md text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                  >
                    <Avatar
                      value={(profileSummary?.uid === user.uid && profileSummary.avatar) || user.photoURL}
                      className="size-8 shrink-0 border border-slate-700"
                    />
                    <span className="hidden max-w-32 truncate font-medium lg:inline">
                      {username}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoutError('');
                      setLogoutDialogOpen(true);
                    }}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#1c2b3c] px-2.5 py-2 text-slate-300 transition-colors hover:bg-[#172236] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:px-3"
                  >
                    <LogoutIcon />
                    <span className="hidden lg:inline">Cerrar sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/ingreso"
                    className="font-medium text-slate-300 transition-colors hover:text-white"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
          <nav
            aria-label="Navegación principal"
            className="mx-auto mt-3 flex w-full max-w-7xl items-center justify-between gap-1 border-t border-slate-800/80 pt-2 text-xs md:hidden"
          >
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-md px-2 py-2 font-medium transition-colors ${
                    isActive
                      ? 'bg-[#172236] text-white'
                      : 'text-slate-400 hover:bg-[#111a29] hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
      )}

      {/* Contenido Principal de cada Ruta */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Pie de página */}
      {!authPage && <footer className="w-full bg-[#090d19] border-t border-slate-800/70 py-5 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Study Room · Espacio digital de estudio colaborativo
      </footer>}

      <Modal
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        dismissible={!signingOut}
        title="Cerrar sesión"
        description="Confirma la finalización de tu sesión"
        titleIcon={
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
            <LogoutIcon className="size-5" />
          </span>
        }
      >
        <p className="text-sm leading-relaxed text-slate-300">
          ¿Deseas salir de tu cuenta de Study Room? Podrás volver a ingresar en
          cualquier momento con tus credenciales.
        </p>
        {logoutError && <StatusMessage type="error">{logoutError}</StatusMessage>}
        <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeLogoutDialog} disabled={signingOut}>
            Cancelar
          </Button>
          <Button onClick={() => void confirmSignOut()} disabled={signingOut}>
            {signingOut && <Spinner />}
            {signingOut ? 'Cerrando sesión…' : logoutError ? 'Reintentar' : 'Cerrar sesión'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
