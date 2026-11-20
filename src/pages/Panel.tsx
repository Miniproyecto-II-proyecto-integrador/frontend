import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getProfile } from "../auth/users";
import Button from "../components/Button";
import CrearSalaModal from "../components/CrearSalaModal";
import {
  IconoCasa,
  IconoEntrar,
  IconoGrupo,
  IconoLlave,
  IconoMas,
} from "../components/icons";
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
    participantesConectados: 0,
  },
  {
    id: "p8Wd2mLc",
    nombre: "Proyecto Final de Algoritmos",
    creadaEn: "2026-11-12T19:30:00Z",
    participantesConectados: 0,
  },
  {
    id: "v1Tn6yRb",
    nombre: "Repaso de Física",
    creadaEn: "2026-11-05T13:10:00Z",
    participantesConectados: 0,
  },
];

type Estado = "cargando" | "listo" | "error";

function Metrica({
  icono,
  valor,
  etiqueta,
}: {
  icono: ReactNode;
  valor: number;
  etiqueta: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#1c2b3c] bg-[#051424]">
        {icono}
      </div>
      <p className="flex flex-col">
        <span className="text-xl font-semibold tracking-tight text-white">
          {valor}
        </span>
        <span className="text-xs text-slate-300">{etiqueta}</span>
        {/* TODO(integración): dato real pendiente (US-08 / tiempo real) */}
        <span className="text-xs text-slate-400">Aún no disponible</span>
      </p>
    </div>
  );
}

export default function Panel() {
  const [username, setUsername] = useState("");
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
    getProfile()
      .then((perfil) => {
        if (active) setUsername(perfil.username);
      })
      .catch(() => {
        /* si falla, el saludo queda sin nombre */
      });
    return () => {
      active = false;
    };
  }, []);

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
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">
            {username ? `Hola, ${username}` : "Hola"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mis salas
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* TODO(US-08): conectar con el modal de unirse a una sala */}
          <Button type="button" variant="secondary">
            <IconoEntrar className="size-4 text-slate-400" /> Unirse a una sala
          </Button>
          <Button onClick={() => setCrearAbierto(true)}>
            <IconoMas /> Crear sala
          </Button>
        </div>
      </header>

      {/* TODO(integración): valores reales cuando exista US-08 y la presencia en tiempo real */}
      <section aria-label="Resumen" className="mt-8 grid gap-4 md:grid-cols-2">
        <Metrica
          icono={<IconoCasa className="size-5 text-blue-400" />}
          valor={0}
          etiqueta="Salas disponibles hoy"
        />
        <Metrica
          icono={<IconoGrupo className="size-5 text-indigo-400" />}
          valor={0}
          etiqueta="Compañeros en línea"
        />
      </section>

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
                <SalaCard sala={sala} onCopiar={copiarId} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {estado === "listo" && (
        <section
          aria-labelledby="banner-id-sala"
          className="mt-8 flex flex-col gap-4 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded border border-[#1c2b3c] bg-[#051424]">
              <IconoLlave className="size-5 text-indigo-400" />
            </div>
            <div>
              <h2
                id="banner-id-sala"
                className="text-base font-semibold text-white"
              >
                ¿Tienes un ID de sala?
              </h2>
              <p className="text-xs text-slate-300">
                Únete a una sala privada a la que te hayan invitado.
              </p>
            </div>
          </div>
          {/* TODO(US-08): conectar con el modal de unirse a una sala */}
          <Button type="button" variant="secondary" className="shrink-0">
            <IconoEntrar className="size-4 text-slate-400" /> Ingresar ID
          </Button>
        </section>
      )}

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
