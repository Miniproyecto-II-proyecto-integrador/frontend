import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, getProfile } from "../auth/users";
import type { Profile } from "../auth/users";
import Avatar from "../components/Avatar";
import { avatarOptions } from "../components/avatarOptions";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";
import TextField from "../components/TextField";
import { simularSolicitud } from "../utils/simulacion";
import EliminarCuenta from "../components/EliminarCuenta";

type Fields = {
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  avatar: string;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;

// TODO(integración): estas colisiones son simuladas. Las reemplaza la respuesta de la API (409 / campos).
const USERNAME_OCUPADO = "ocupado";
const CORREO_OCUPADO = "ocupado@correo.com";

const enfocar = (id: string) =>
  window.setTimeout(() => document.getElementById(id)?.focus(), 0);

function desdePerfil(p: Profile): Fields {
  return {
    nombres: p.nombres,
    apellidos: p.apellidos,
    username: p.username,
    correo: p.email,
    avatar: p.avatar,
  };
}

function validar(f: Fields): FieldErrors {
  const next: FieldErrors = {};
  if (!f.nombres.trim()) next.nombres = "Escribe tus nombres.";
  else if (f.nombres.trim().length > 60)
    next.nombres = "Usa hasta 60 caracteres.";
  if (!f.apellidos.trim()) next.apellidos = "Escribe tus apellidos.";
  else if (f.apellidos.trim().length > 60)
    next.apellidos = "Usa hasta 60 caracteres.";
  if (!/^[A-Za-z0-9_]{3,20}$/.test(f.username.trim()))
    next.username =
      "Usa de 3 a 20 caracteres: letras, números o guion bajo (_), sin espacios.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.trim()))
    next.correo = "Escribe un correo válido.";
  return next;
}

function Dato({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-base text-slate-100 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function Perfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadState, setLoadState] = useState<"cargando" | "error" | "listo">(
    "cargando",
  );
  const [loadError, setLoadError] = useState("");
  const [intento, setIntento] = useState(0);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Fields>({
    nombres: "",
    apellidos: "",
    username: "",
    correo: "",
    avatar: "avatar-1",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [general, setGeneral] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = "Perfil | Study Room";
  }, []);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (active) {
          setProfile(data);
          setLoadState("listo");
        }
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(
          error instanceof ApiError
            ? error.detail.mensaje
            : "No pudimos cargar tu perfil. Inténtalo de nuevo.",
        );
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [intento]);

  function reintentarCarga() {
    setLoadState("cargando");
    setIntento((n) => n + 1);
  }

  function change(field: keyof Fields, value: string) {
    setForm((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: undefined }));
  }

  function empezarEdicion() {
    if (!profile) return;
    setForm(desdePerfil(profile));
    setErrors({});
    setGeneral("");
    setSaved(false);
    setEditing(true);
    enfocar("perfil-nombres");
  }

  function cancelar() {
    setEditing(false);
    setErrors({});
    setGeneral("");
    enfocar("perfil-editar");
  }

  async function guardar() {
    if (!profile) return;
    const next = validar(form);
    setErrors(next);
    setGeneral("");
    const first = Object.keys(next)[0];
    if (first) {
      enfocar(`perfil-${first}`);
      return;
    }
    setSaving(true);
    try {
      // TODO(integración): PUT /api/users/me
      await simularSolicitud(null);
      const colisiones: FieldErrors = {};
      if (form.username.trim().toLowerCase() === USERNAME_OCUPADO)
        colisiones.username =
          "Ese nombre de usuario ya está en uso. Prueba con otro.";
      if (form.correo.trim().toLowerCase() === CORREO_OCUPADO)
        colisiones.correo =
          "Ese correo ya está registrado en otra cuenta. Usa uno diferente.";
      const firstCol = Object.keys(colisiones)[0];
      if (firstCol) {
        setErrors(colisiones);
        enfocar(`perfil-${firstCol}`);
        return;
      }
      setProfile({
        ...profile,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        username: form.username.trim(),
        email: form.correo.trim(),
        avatar: form.avatar,
      });
      setEditing(false);
      setSaved(true);
      enfocar("perfil-editar");
    } catch {
      setGeneral("No pudimos guardar tus cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void guardar();
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-[#1c2b3c] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Ajustes de cuenta
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mi perfil
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Gestiona tu identidad pública y tu correo de estudio.
          </p>
        </div>
        {loadState === "listo" && !editing && (
          <Button
            id="perfil-editar"
            variant="secondary"
            onClick={empezarEdicion}
          >
            Editar perfil
          </Button>
        )}
      </header>

      <div className="mt-6 space-y-6">
        {loadState === "cargando" && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-6 text-sm text-slate-300"
          >
            <Spinner className="size-5" /> Cargando tu perfil…
          </div>
        )}

        {loadState === "error" && (
          <div className="space-y-4">
            <StatusMessage type="error">{loadError}</StatusMessage>
            <Button onClick={reintentarCarga}>Reintentar</Button>
          </div>
        )}

        {loadState === "listo" && profile && (
          <>
            {saved && !editing && (
              <StatusMessage type="success">
                Tu perfil se actualizó correctamente.
              </StatusMessage>
            )}

            <div className="rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-6 sm:p-8">
              {!editing ? (
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <Avatar
                    value={profile.avatar}
                    className="size-20 shrink-0 border-2 border-[#273647]"
                  />
                  <dl className="grid flex-1 gap-5 sm:grid-cols-2">
                    <Dato label="Nombres" value={profile.nombres} />
                    <Dato label="Apellidos" value={profile.apellidos} />
                    <Dato
                      label="Nombre de usuario"
                      value={`@${profile.username}`}
                      mono
                    />
                    <Dato
                      label="Correo electrónico"
                      value={profile.email}
                      mono
                    />
                  </dl>
                </div>
              ) : (
                <form
                  onSubmit={submit}
                  noValidate
                  className="space-y-5"
                  aria-label="Editar perfil"
                >
                  {general && (
                    <StatusMessage type="error">{general}</StatusMessage>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="perfil-nombres"
                      label="Nombres"
                      autoComplete="given-name"
                      value={form.nombres}
                      onChange={(e) => change("nombres", e.target.value)}
                      error={errors.nombres}
                      disabled={saving}
                    />
                    <TextField
                      id="perfil-apellidos"
                      label="Apellidos"
                      autoComplete="family-name"
                      value={form.apellidos}
                      onChange={(e) => change("apellidos", e.target.value)}
                      error={errors.apellidos}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
                    <fieldset disabled={saving}>
                      <legend className="mb-2 text-sm font-medium text-slate-300">
                        Elige un avatar
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {avatarOptions.map((avatar) => (
                          <label
                            key={avatar.id}
                            className={`flex size-12 cursor-pointer items-center justify-center rounded-full border-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-300 ${form.avatar === avatar.id ? "border-blue-300" : "border-transparent"}`}
                          >
                            <input
                              className="sr-only"
                              aria-label={`Avatar: ${avatar.label}`}
                              type="radio"
                              name="avatar"
                              value={avatar.id}
                              checked={form.avatar === avatar.id}
                              onChange={() => change("avatar", avatar.id)}
                            />
                            <Avatar value={avatar.id} className="size-10" />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <TextField
                      id="perfil-username"
                      label="Nombre de usuario"
                      autoComplete="username"
                      helpText="De 3 a 20 letras, números o guion bajo (_), sin espacios."
                      value={form.username}
                      onChange={(e) => change("username", e.target.value)}
                      error={errors.username}
                      disabled={saving}
                    />
                  </div>
                  <TextField
                    id="perfil-correo"
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    helpText="Se usa para invitaciones y recuperación de cuenta."
                    value={form.correo}
                    onChange={(e) => change("correo", e.target.value)}
                    error={errors.correo}
                    disabled={saving}
                  />
                  <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-5 sm:flex-row sm:justify-end">
                    <Button
                      variant="secondary"
                      onClick={cancelar}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Spinner />}
                      {saving
                        ? "Guardando cambios…"
                        : general
                          ? "Reintentar"
                          : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <EliminarCuenta />
          </>
        )}
      </div>
    </section>
  );
}
