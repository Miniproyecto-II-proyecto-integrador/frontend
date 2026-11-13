import { auth } from './firebase';

export interface Profile { uid: string; nombres: string; apellidos: string; username: string; email: string; avatar: string; proveedor: 'password' | 'google'; perfilCompleto: boolean }
type ErrorDetail = { codigo: string; mensaje: string; sugerencia?: string; campos?: Record<string, string> };
export class ApiError extends Error {
  status: number;
  detail: ErrorDetail;
  constructor(status: number, detail: ErrorDetail) { super(detail.mensaje); this.status = status; this.detail = detail; }
}

async function request<T>(path: string, options: { body?: object; private?: boolean } = {}): Promise<T> {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!base) throw new ApiError(0, { codigo: 'SIN_CONFIGURAR', mensaje: 'El servicio no está configurado.' });
  const headers: Record<string, string> = {};
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.private) {
    if (!auth?.currentUser) throw new ApiError(401, { codigo: 'TOKEN_INVALIDO', mensaje: 'Tu sesión no es válida o ya venció.' });
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  let response: Response;
  try { response = await fetch(`${base}${path}`, { method: options.body ? 'POST' : 'GET', headers, body: options.body ? JSON.stringify(options.body) : undefined }); }
  catch { throw new ApiError(0, { codigo: 'SIN_CONEXION', mensaje: 'No pudimos conectarnos con el servidor. Inténtalo de nuevo.' }); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data?.error ?? { codigo: 'ERROR_INTERNO', mensaje: 'No pudimos completar la solicitud. Inténtalo de nuevo.' });
  return data as T;
}
export const checkUsername = (username: string) => request<{ username: string; disponible: boolean }>(`/api/users/username-disponible?username=${encodeURIComponent(username.trim())}`);
export const getProfile = () => request<Profile>('/api/users/me', { private: true });
export const createProfile = (body: { username: string; nombres?: string; apellidos?: string; avatar?: string }) => request<Profile>('/api/users', { private: true, body });
