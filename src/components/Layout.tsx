import { Outlet, Link, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-200 flex flex-col font-sans">
      {/* Encabezado / Navegación */}
      <header className="w-full bg-[#0b101e] border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
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
            <span className="font-bold text-white text-lg tracking-tight">Study Room</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold transition-colors'
                  : 'text-slate-300 hover:text-white transition-colors'
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/ayuda"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold transition-colors'
                  : 'text-slate-300 hover:text-white transition-colors'
              }
            >
              Ayuda
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <Link
            to="/ingreso"
            className="text-slate-300 hover:text-white font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors shadow-sm"
          >
            Registrarse
          </Link>
          <Link
            to="/perfil"
            aria-label="Perfil de usuario"
            className="size-8 rounded-full bg-indigo-200/90 text-slate-900 flex items-center justify-center hover:bg-indigo-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Contenido Principal de cada Ruta */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Pie de página */}
      <footer className="w-full bg-[#090d19] border-t border-slate-800/70 py-5 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Study Room · Espacio digital de estudio colaborativo
      </footer>
    </div>
  );
}
