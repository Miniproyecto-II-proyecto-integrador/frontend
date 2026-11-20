import { auth } from "./firebase";

type ErrorDetail = {
  codigo: string;
  mensaje: string;
  sugerencia?: string;
  campos?: Record<string, string>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly detail: ErrorDetail;

  constructor(
    status: number,
    detail: ErrorDetail,
  ) {
    super(detail.mensaje);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function requestApi<T>(
  path: string,
  options: {
    body?: object;
    private?: boolean;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
  } = {},
): Promise<T> {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new ApiError(0, {
      codigo: "SIN_CONFIGURAR",
      mensaje: "El servicio no está configurado.",
    });
  }

  const headers: Record<string, string> = {};
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.private) {
    if (!auth?.currentUser) {
      throw new ApiError(401, {
        codigo: "TOKEN_INVALIDO",
        mensaje: "Tu sesión no es válida o ya venció.",
      });
    }
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, {
      codigo: "SIN_CONEXION",
      mensaje: "No pudimos conectarnos con el servidor. Inténtalo de nuevo.",
    });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? {
        codigo: "ERROR_INTERNO",
        mensaje: "No pudimos completar la solicitud. Inténtalo de nuevo.",
      },
    );
  }
  return data as T;
}
