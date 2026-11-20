import { Link } from "react-router-dom";
import type { Sala } from "../types/sala";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default function SalaCard({
  sala,
  onCopiar,
}: {
  sala: Sala;
  onCopiar: (sala: Sala) => void;
}) {
  const headingId = `sala-${sala.id}-nombre`;
  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col justify-between gap-5 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-5"
    >
      <div className="flex flex-col gap-4">
        <span className="w-fit rounded border border-blue-400/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Anfitrión
        </span>
        <div>
          <h2
            id={headingId}
            className="break-words text-base font-semibold text-white"
          >
            {sala.nombre}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Creada el {formatoFecha.format(new Date(sala.creadaEn))}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 rounded border border-[#1c2b3c] bg-[#051424] px-3 py-2">
          <p className="flex min-w-0 items-center gap-2 text-xs">
            <span className="font-mono text-slate-400">ID:</span>
            <code className="select-all truncate font-mono tracking-wide text-slate-100">
              {sala.id}
            </code>
          </p>
          <button
            type="button"
            onClick={() => onCopiar(sala)}
            aria-label={`Copiar ID de la sala ${sala.nombre}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-blue-200 hover:bg-[#1c2b3c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
            Copiar ID
          </button>
        </div>
      </div>
      <Link
        to={`/salas/${sala.id}`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        Entrar a la sala<span className="sr-only">: {sala.nombre}</span>
      </Link>
    </article>
  );
}
