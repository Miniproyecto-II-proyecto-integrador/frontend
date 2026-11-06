import { Link } from 'react-router-dom';
import HealthDataViewer from '../components/HealthDataViewer';

export default function Inicio() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center w-full px-4 py-20 md:py-28 text-center">
      {/* Badge superior */}
      <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-[#1a2030] px-4 py-1.5 text-xs md:text-sm font-medium text-slate-300 border border-slate-700/50">
        <span className="size-2 rounded-full bg-[#7aa2f7]" aria-hidden="true" />
        <span>Espacio digital de estudio colaborativo</span>
      </div>

      {/* Título principal */}
      <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#e2e8f0] leading-[1.12] mb-6">
        Estudia en equipo, en un solo lugar.
      </h1>

      {/* Subtítulo descriptivo */}
      <p className="max-w-xl text-base md:text-lg text-slate-400 leading-relaxed mb-10">
        Crea salas privadas, conversa en tiempo real y comparte audio, video y pantalla con tus
        compañeros.
      </p>

      {/* Botones de acción */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/registro"
          className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-7 py-3.5 text-sm md:text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#070b14]"
        >
          Registrarse
        </Link>
        <Link
          to="/ingreso"
          className="inline-flex items-center justify-center rounded-xl bg-[#161b28] px-7 py-3.5 text-sm md:text-base font-semibold text-slate-200 border border-slate-800/80 transition-all hover:bg-slate-800 hover:text-white active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-[#070b14]"
        >
          Iniciar sesión
        </Link>
      </div>

      {/* Requisito TS-00: Panel de estado de conexión para evaluación del Sprint 0 */}
      <div className="mt-24 w-full max-w-xl border-t border-slate-800/60 pt-8 opacity-65 hover:opacity-100 transition-opacity">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          Panel de estado de conexión · Evaluación Sprint 0 (TS-00)
        </p>
        <HealthDataViewer />
      </div>
    </section>
  );
}
