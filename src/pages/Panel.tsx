import { useEffect } from 'react';

export default function Panel() {
  useEffect(() => { document.title = 'Panel | Study Room'; }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Panel</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Has iniciado sesión. Puedes cerrar sesión desde la barra superior.
      </p>
    </div>
  );
}

