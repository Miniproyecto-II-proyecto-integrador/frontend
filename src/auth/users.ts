import { requestApi } from "./api";
export { ApiError } from "./api";

export interface Profile { uid: string; nombres: string; apellidos: string; username: string; email: string; avatar: string; proveedor: 'password' | 'google'; perfilCompleto: boolean }
export const checkUsername = (username: string) => requestApi<{ username: string; disponible: boolean }>(`/api/users/username-disponible?username=${encodeURIComponent(username.trim())}`);
export const getProfile = () => requestApi<Profile>('/api/users/me', { private: true });
export const createProfile = (body: { username: string; nombres?: string; apellidos?: string; avatar?: string }) => requestApi<Profile>('/api/users', { private: true, method: 'POST', body });
export const updateProfile = (body: { nombres?: string; apellidos?: string; username?: string; email?: string; avatar?: string }) => requestApi<Profile>('/api/users/me', { private: true, method: 'PATCH', body });
