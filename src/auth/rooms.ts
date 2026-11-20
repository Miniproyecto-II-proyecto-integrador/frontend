import { requestApi } from "./api";

export interface SalaRespuesta {
  id: string;
  nombre: string;
  ownerUid: string;
  createdAt: string;
}

export const getRooms = () =>
  requestApi<SalaRespuesta[]>("/api/rooms", { private: true });

export const createRoom = (nombre: string) =>
  requestApi<SalaRespuesta>("/api/rooms", {
    private: true,
    method: "POST",
    body: { nombre },
  });
