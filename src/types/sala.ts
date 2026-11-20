export interface Sala {
  id: string;
  nombre: string;
  creadaEn: string; // ISO 8601
  participantesConectados: number; // TODO(integración): vendrá de la presencia en tiempo real (Socket.IO)
}
