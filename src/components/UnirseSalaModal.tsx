import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";
import Modal from "./Modal";
import Spinner from "./Spinner";
import TextField from "./TextField";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UnirseSalaModal({ open, onClose }: Props) {
  const { getIdToken } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!open) {
      socketRef.current?.disconnect();
      socketRef.current = null;
    }
  }, [open]);

  useEffect(
    () => () => {
      socketRef.current?.disconnect();
    },
    [],
  );

  function cerrar() {
    if (connecting) return;
    setError("");
    setRoomId("");
    onClose();
  }

  async function unir(event: FormEvent) {
    event.preventDefault();
    const limpio = roomId.trim();
    setError("");
    if (!limpio) {
      setError("Escribe el ID de la sala.");
      return;
    }

    const realtimeUrl = import.meta.env.VITE_REALTIME_URL;
    if (!realtimeUrl) {
      setError("El servicio de tiempo real no está configurado.");
      return;
    }

    setConnecting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("SESION_INVALIDA");

      socketRef.current?.disconnect();
      const socket = io(realtimeUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.once("room:joined", ({ roomId: joinedId }: { roomId: string }) => {
        socket.disconnect();
        socketRef.current = null;
        setConnecting(false);
        onClose();
        navigate(`/salas/${encodeURIComponent(joinedId)}`);
      });

      socket.once(
        "room:error",
        ({ code, message }: { code: string; message: string }) => {
          socket.disconnect();
          socketRef.current = null;
          setConnecting(false);
          setError(
            code === "ROOM_NOT_FOUND"
              ? "Sala no encontrada. Verifica el ID e inténtalo de nuevo."
              : message || "No pudimos ingresar a la sala.",
          );
        },
      );

      socket.once("connect_error", () => {
        socket.disconnect();
        socketRef.current = null;
        setConnecting(false);
        setError("No pudimos conectar con el servicio. Reintenta.");
      });

      socket.once("connect", () => {
        socket.emit("room:join", { roomId: limpio });
      });
    } catch {
      setConnecting(false);
      socketRef.current?.disconnect();
      socketRef.current = null;
      setError("No pudimos iniciar la conexión. Reintenta.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      dismissible={!connecting}
      title="Unirse a una sala"
      description="Ingresa el ID compartido por el anfitrión."
    >
      <form onSubmit={unir} noValidate className="space-y-4">
        <TextField
          id="unirse-sala-id"
          label="ID de la sala"
          placeholder="Ej. ALGEBRA-2026"
          value={roomId}
          onChange={(event) => {
            setRoomId(event.target.value);
            setError("");
          }}
          error={error || undefined}
          disabled={connecting}
          autoComplete="off"
        />
        <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={cerrar} disabled={connecting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={connecting}>
            {connecting && <Spinner />}
            {connecting ? "Ingresando…" : error ? "Reintentar" : "Unirse"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
