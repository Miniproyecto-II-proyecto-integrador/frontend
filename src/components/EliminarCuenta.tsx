import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Modal from "./Modal";
import Spinner from "./Spinner";
import StatusMessage from "./StatusMessage";
import { simularSolicitud } from "../utils/simulacion";

export default function EliminarCuenta() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function cerrar() {
    if (deleting) return;
    setOpen(false);
    setError("");
  }

  async function eliminar() {
    setDeleting(true);
    setError("");
    try {
      // TODO(integración): DELETE /api/users/me y luego signOut() de Firebase
      await simularSolicitud(null, 1200);
      navigate("/ingreso", { replace: true, state: { cuentaEliminada: true } });
    } catch {
      setError(
        "No pudimos completar la acción. No se eliminó nada. Inténtalo de nuevo.",
      );
      setDeleting(false);
    }
  }

  return (
    <section
      aria-labelledby="zona-peligro"
      className="rounded-lg border border-red-500/30 bg-red-950/20 p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 id="zona-peligro" className="text-base font-semibold text-white">
            Eliminar cuenta definitivamente
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            Esta acción es definitiva: se eliminará tu cuenta y no podrás volver
            a acceder con ella.
          </p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 !border-red-400/60 !text-red-300 hover:!bg-red-500/10"
          onClick={() => setOpen(true)}
        >
          Eliminar cuenta
        </Button>
      </div>

      <Modal
        open={open}
        onClose={cerrar}
        dismissible={!deleting}
        tone="danger"
        title="¿Eliminar tu cuenta definitivamente?"
        description="Esta acción no se puede deshacer."
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Se eliminarán tu perfil y tus datos personales.</li>
          <li>Tu nombre de usuario quedará libre para otras personas.</li>
          {/* TODO: ajustar a la política de salas y mensajes que documente Coordinación */}
          <li>
            Tus salas y mensajes asociados se eliminarán junto con tu cuenta.
          </li>
        </ul>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={cerrar} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            className="!bg-[#dc2626] hover:!bg-[#b91c1c]"
            onClick={eliminar}
            disabled={deleting}
          >
            {deleting && <Spinner />}
            {deleting
              ? "Eliminando cuenta…"
              : error
                ? "Reintentar"
                : "Eliminar cuenta"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
