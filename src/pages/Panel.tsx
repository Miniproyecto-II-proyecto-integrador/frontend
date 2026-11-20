import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import CrearSalaModal from "../components/CrearSalaModal";
import SalaCard from "../components/SalaCard";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";
import type { Sala } from "../types/sala";
import { parametroSimulacion, simularSolicitud } from "../utils/simulacion";

// TODO(integración): reemplazar por GET /api/rooms (salas del anfitrión).
const SALAS_MOCK: Sala[] = [
  {
    id: "k3Fq9aXz",
    nombre: "Taller de Álgebra Lineal",
    creadaEn: "2026-11-17T15:00:00Z",
  },
  {
    id: "p8Wd2mLc",
    nombre: "Proyecto Final de Algoritmos",
    creadaEn: "2026-11-12T19:30:00Z",
  },
  {
    id: "v1Tn6yRb",
    nombre: "Repaso de Física",
    creadaEn: "2026-11-05T13:10:00Z",
  },
];

type Estado = "cargando" | "listo" | "error";

function IconoMas() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-4"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function Panel() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [intento, setIntento] = useState(0);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [aviso, setAviso] = useState("");
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.title = "Panel | Study Room";
  }, []);
  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  useEffect(() => {
    let active = true;
    const datos: Sala[] = parametroSimulacion() === "vacio" ? [] : SALAS_MOCK;
    simularSolicitud<Sala[]>(datos)
      .then((resultado) => {
        if (active) {
          setSalas(resultado);
          setEstado("listo");
        }
      })
      .catch(() => {
        if (active) setEstado("error");
      });
    return () => {
      active = false;
    };
  }, [intento]);

  function reintentar() {
    setEstado("cargando");
    setIntento((n) => n + 1);
  }

  async function copiarId(sala: Sala) {
    let mensaje: string;
    try {
      await navigator.clipboard.writeText(sala.id);
      mensaje = "ID copiado";
    } catch {
      mensaje = "No se pudo copiar. Selecciona el ID y cópialo manualmente.";
    }
    setAviso(mensaje);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setAviso(""), 3500);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Panel
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mis salas
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Crea salas privadas y comparte su ID con tus compañeros.
          </p>
        </div>
        <Button onClick={() => setCrearAbierto(true)}>
          <IconoMas /> Crear sala
        </Button>
      </header>

      <div className="mt-8">
        {estado === "cargando" && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-6 text-sm text-slate-300"
          >
            <Spinner className="size-5" /> Cargando tus salas…
          </div>
        )}

        {estado === "error" && (
          <div className="space-y-4">
            <StatusMessage type="error">
              No pudimos cargar tus salas. Inténtalo de nuevo.
            </StatusMessage>
            <Button onClick={reintentar}>Reintentar</Button>
          </div>
        )}

        {estado === "listo" && salas.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#273647] bg-[#0d1c2d]/60 p-10 text-center">
            <h2 className="text-lg font-bold text-white">
              Aún no tienes salas de estudio
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Crea tu primera sala privada para empezar a estudiar y colaborar
              en tiempo real.
            </p>
            <Button onClick={() => setCrearAbierto(true)}>
              <IconoMas /> Crear mi primera sala
            </Button>
          </div>
        )}

        {estado === "listo" && salas.length > 0 && (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {salas.map((sala) => (
              <li key={sala.id} className="flex">
                <div className="flex w-full flex-col [&>article]:flex-1">
                  <SalaCard sala={sala} onCopiar={copiarId} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CrearSalaModal
        open={crearAbierto}
        onClose={() => setCrearAbierto(false)}
      />

      {/* Región viva persistente: anuncia "ID copiado" al lector de pantalla sin mover el foco */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-sm"
      >
        {aviso && (
          <p className="rounded-lg border border-emerald-500/40 bg-[#0d1c2d] px-4 py-3 text-sm text-emerald-300 shadow-xl">
            {aviso}
          </p>
        )}
      </div>
    </section>
  );
}
