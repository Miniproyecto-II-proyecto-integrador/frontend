import { requestApi } from "./api";

export interface SalaRespuesta {
  id: string;
  nombre: string;
  ownerUid: string;
  createdAt: string;
}

export interface MensajeSala {
  id: string;
  roomId: string;
  senderUid: string | null;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface HistorialMensajes {
  messages: MensajeSala[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const getRooms = () =>
  requestApi<SalaRespuesta[]>("/api/rooms", { private: true });

export const createRoom = (nombre: string) =>
  requestApi<SalaRespuesta>("/api/rooms", {
    private: true,
    method: "POST",
    body: { nombre },
  });

export const updateRoom = (id: string, nombre: string) =>
  requestApi<SalaRespuesta>(`/api/rooms/${encodeURIComponent(id)}`, {
    private: true,
    method: "PATCH",
    body: { nombre },
  });

export const deleteRoom = (id: string) =>
  requestApi<{ eliminada: true }>(
    `/api/rooms/${encodeURIComponent(id)}`,
    { private: true, method: "DELETE" },
  );

export const getRoomMessages = (
  id: string,
  limit = 50,
  cursor?: string,
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return requestApi<HistorialMensajes>(
    `/api/rooms/${encodeURIComponent(id)}/messages?${params.toString()}`,
    { private: true },
  );
};
