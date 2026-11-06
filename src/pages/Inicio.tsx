import HealthDataViewer from '../components/HealthDataViewer';

export default function Inicio() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Inicio</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Página principal de bienvenida a la plataforma.
      </p>
      <div className="mt-8">
        <HealthDataViewer />
      </div>
    </div>
  );
}
