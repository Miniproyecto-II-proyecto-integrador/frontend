import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../auth/api";
import { createRoom } from "../auth/rooms";
import Button from "./Button";
import Modal from "./Modal";
import Spinner from "./Spinner";
import StatusMessage from "./StatusMessage";
import TextField from "./TextField";

const MAX_NOMBRE = 50;
const ID_CAMPO = "crear-sala-nombre";

export default function CrearSalaModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [general, setGeneral] = useState("");
  const [creando, setCreando] = useState(false);
  const [creada, setCreada] = useState(false);

  function cerrar() {
    if (creando || creada) return;
    setNombre("");
    setError("");
    setGeneral("");
    onClose();
  }

  async function crear(event: FormEvent) {
    event.preventDefault();
    const limpio = nombre.trim();
    const problema = !limpio
      ? "Escribe un nombre para la sala."
      : limpio.length > MAX_NOMBRE
        ? `Usa hasta ${MAX_NOMBRE} caracteres. Ahora tienes ${limpio.length}.`
        : "";
    setError(problema);
    setGeneral("");
    if (problema) {
      document.getElementById(ID_CAMPO)?.focus();
      return;
    }
    setCreando(true);
    try {
      await createRoom(limpio);
      setCreada(true);
      onCreated();
      window.setTimeout(() => {
        onClose();
        navigate("/panel");
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError && error.detail.campos?.nombre) {
        setError(error.detail.campos.nombre);
        document.getElementById(ID_CAMPO)?.focus();
      } else {
        setGeneral(
          error instanceof ApiError
            ? error.detail.mensaje
            : "No pudimos crear la sala. Inténtalo de nuevo.",
        );
      }
    } finally {
      setCreando(false);
    }
  }

  const bloqueado = creando || creada;

  return (
    <Modal
      open={open}
      onClose={cerrar}
      dismissible={!bloqueado}
      title="Crear sala"
      description="Escribe un nombre para identificar tu sala de estudio."
    >
      <form onSubmit={crear} noValidate className="space-y-4">
        {general && <StatusMessage type="error">{general}</StatusMessage>}
        {creada && (
          <StatusMessage type="success">
            Sala creada. Volviendo al panel…
          </StatusMessage>
        )}
        <TextField
          id={ID_CAMPO}
          label="Nombre de la sala"
          placeholder="Ej. Taller de Algoritmos"
          autoComplete="off"
          helpText={`Máximo ${MAX_NOMBRE} caracteres (${nombre.trim().length}/${MAX_NOMBRE}).`}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setError("");
          }}
          error={error}
          disabled={bloqueado}
        />
        <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={cerrar} disabled={bloqueado}>
            Cancelar
          </Button>
          <Button type="submit" disabled={bloqueado}>
            {creando && <Spinner />}
            {creando ? "Creando sala…" : general ? "Reintentar" : "Crear sala"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
