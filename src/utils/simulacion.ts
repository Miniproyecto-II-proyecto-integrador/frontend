// Utilidades TEMPORALES para simular al backend mientras no se consumen los endpoints del sprint.
// TODO(integración): eliminar este archivo cuando se conecten los endpoints reales.
export function parametroSimulacion(): string | null {
  return new URLSearchParams(window.location.search).get("simular");
}

export function simularSolicitud<T>(resultado: T, ms = 900): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    window.setTimeout(() => {
      if (parametroSimulacion() === "error")
        reject(new Error("Error simulado del servidor"));
      else resolve(resultado);
    }, ms);
  });
}
