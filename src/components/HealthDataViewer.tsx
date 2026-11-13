import { useState, useEffect, useCallback } from 'react';

interface HealthDataResponse {
  data: {
    mensaje: string;
  };
  leidoEn: string;
}

export function HealthDataViewer() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [leidoEn, setLeidoEn] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/health-data`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const result: HealthDataResponse = await response.json();

      if (!result?.data?.mensaje) {
        throw new Error('Formato de respuesta inválido: no se encontró "data.mensaje"');
      }

      setMensaje(result.data.mensaje);
      setLeidoEn(result.leidoEn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchHealthData);
  }, [fetchHealthData]);

  if (loading) {
    return (
      <div
        aria-live="polite"
        className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="size-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Consultando datos de Firestore...
          </span>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-md w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        aria-live="assertive"
        className="w-full max-w-md mx-auto p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/80 shadow-sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-red-800 dark:text-red-300">
              Error de conexión End-to-End
            </h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 break-words">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setLoading(true); setError(null); void fetchHealthData(); }}
            className="self-center inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/70 shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          Firestore Conectado
        </span>
      </div>
      <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
        {mensaje}
      </p>
      {leidoEn && (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Leído en: <span className="font-mono">{leidoEn}</span>
        </p>
      )}
    </div>
  );
}

export default HealthDataViewer;
