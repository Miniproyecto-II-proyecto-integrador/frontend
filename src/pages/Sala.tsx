import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../auth/api";
import {
  deleteRoom,
  getRoomMessages,
  getRooms,
  updateRoom,
  type MensajeSala,
  type SalaRespuesta,
} from "../auth/rooms";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";
import TextField from "../components/TextField";

type MensajeUI = MensajeSala & {
  temporal?: boolean;
  estado?: "enviando" | "fallido";
};

type Participante = {
  uid: string;
  displayName: string;
  online: boolean;
};

export default function Sala() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const nearBottomRef = useRef(true);

  const [roomName, setRoomName] = useState("Sala de estudio");
  const [owner, setOwner] = useState(false);
  const [connection, setConnection] = useState<"conectando" | "conectado" | "reconectando" | "error">("conectando");
  const [roomError, setRoomError] = useState("");
  const [success, setSuccess] = useState("");
  const [participants, setParticipants] = useState<Participante[]>([]);
  const [panel, setPanel] = useState<"chat" | "participantes" | null>(null);
  const [messages, setMessages] = useState<MensajeUI[]>([]);
  const [historyState, setHistoryState] = useState<"cargando" | "listo" | "error">("cargando");
  const [historyError, setHistoryError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [newMessages, setNewMessages] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [savingRoom, setSavingRoom] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    document.title = "Sala | Study Room";
  }, []);

  useEffect(() => {
    let active = true;
    getRooms()
      .then((rooms: SalaRespuesta[]) => {
        if (!active) return;
        const owned = rooms.find((room) => room.id === id);
        if (owned) {
          setOwner(true);
          setRoomName(owned.nombre);
          setEditName(owned.nombre);
        }
      })
      .catch(() => {
        // El anfitrión se determina por la lista real; un fallo no concede permisos.
        if (active) setOwner(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function mergeUnique(existing: MensajeUI[], incoming: MensajeUI[]) {
    const ids = new Set(existing.map((message) => message.id));
    return [...existing, ...incoming.filter((message) => !ids.has(message.id))];
  }

  async function loadHistory() {
    setHistoryState("cargando");
    setHistoryError("");
    try {
      const result = await getRoomMessages(id, 50);
      setMessages((current) =>
        mergeUnique(result.messages, current.filter((message) => message.temporal)),
      );
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setHistoryState("listo");
      window.requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    } catch (error) {
      setHistoryError(error instanceof ApiError ? error.detail.mensaje : "No pudimos recuperar el historial.");
      setHistoryState("error");
    }
  }

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHistory();
    // El historial se recarga también al reconectar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function connect() {
      const realtimeUrl = import.meta.env.VITE_REALTIME_URL;
      if (!realtimeUrl) {
        setConnection("error");
        setRoomError("El servicio de tiempo real no está configurado.");
        return;
      }
      const token = await getIdToken();
      if (!token) {
        setConnection("error");
        setRoomError("Tu sesión no es válida. Inicia sesión de nuevo.");
        return;
      }
      if (!active) return;

      socketRef.current?.disconnect();
      const socket = io(realtimeUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnection("conectado");
        setRoomError("");
        socket.emit("room:join", { roomId: id });
      });

      socket.on("disconnect", () => {
        setConnection("reconectando");
      });

      socket.io.on("reconnect_attempt", () => setConnection("reconectando"));
      socket.io.on("reconnect", () => {
        setConnection("conectado");
        socket.emit("room:join", { roomId: id });
        void loadHistory();
      });

      socket.on("room:joined", (payload: { roomId: string; roomName: string; onlineUsers: { uid: string; displayName: string }[] }) => {
        if (payload.roomId !== id) return;
        setRoomName(payload.roomName);
        setEditName((current) => current || payload.roomName);
        setConnection("conectado");
        setParticipants(payload.onlineUsers.map((participant) => ({ ...participant, online: true })));
      });

      socket.on("room:error", (payload: { roomId?: string; code: string; message: string }) => {
        if (payload.roomId && payload.roomId !== id) return;
        setMessages((current) =>
          current.map((message) => message.estado === "enviando" ? { ...message, estado: "fallido" } : message),
        );
        setSending(false);
        if (payload.code === "ROOM_NOT_FOUND") {
          setConnection("error");
          setRoomError("Sala no encontrada. Verifica el ID e inténtalo de nuevo.");
        }
      });

      socket.on("room:deleted", (payload: { roomId: string }) => {
        if (payload.roomId !== id) return;
        socket.disconnect();
        navigate("/panel", { replace: true, state: { roomDeleted: true } });
      });

      socket.on("message:new", (message: MensajeSala) => {
        if (message.roomId !== id) return;
        setMessages((current) => {
          const persistedIndex = current.findIndex(
            (item) => item.temporal && item.estado === "enviando" &&
              item.senderUid === message.senderUid && item.content === message.content,
          );
          const reconciled = persistedIndex >= 0
            ? current.map((item, index) => index === persistedIndex ? message : item)
            : mergeUnique(current, [message]);
          return reconciled;
        });
        setSending(false);
        if (!nearBottomRef.current) setNewMessages(true);
      });

      socket.on("presence:update", (payload: { roomId: string; uid: string; displayName: string; status: "online" | "offline" }) => {
        if (payload.roomId !== id) return;
        setParticipants((current) => {
          if (payload.status === "online") {
            const exists = current.some((participant) => participant.uid === payload.uid);
            return exists
              ? current.map((participant) => participant.uid === payload.uid ? { ...participant, displayName: payload.displayName, online: true } : participant)
              : [...current, { uid: payload.uid, displayName: payload.displayName, online: true }];
          }
          return current.filter((participant) => participant.uid !== payload.uid);
        });
      });

      socket.on("connect_error", () => {
        setConnection("reconectando");
      });
    }

    void connect();
    return () => {
      active = false;
      const socket = socketRef.current;
      if (socket) {
        if (socket.connected) socket.emit("room:leave", { roomId: id });
        socket.removeAllListeners();
        socket.disconnect();
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (nearBottomRef.current && messages.length) {
      window.requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
      setNewMessages(false);
    }
  }, [messages.length]);

  async function loadOlder() {
    if (!nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    setOlderError("");
    const container = scrollRef.current;
    const oldHeight = container?.scrollHeight ?? 0;
    try {
      const result = await getRoomMessages(id, 50, nextCursor);
      setMessages((current) => mergeUnique(result.messages, current));
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
      window.requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - oldHeight;
      });
    } catch (error) {
      setOlderError(error instanceof ApiError ? error.detail.mensaje : "No pudimos cargar mensajes anteriores.");
    } finally {
      setLoadingOlder(false);
    }
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || connection !== "conectado" || sending) return;
    const socket = socketRef.current;
    if (!socket?.connected) return;

    const temporal: MensajeUI = {
      id: `temporal-${crypto.randomUUID()}`,
      roomId: id,
      senderUid: user?.uid ?? null,
      senderName: user?.displayName || user?.email?.split("@")[0] || "Tú",
      content,
      createdAt: new Date().toISOString(),
      temporal: true,
      estado: "enviando",
    };
    setMessages((current) => [...current, temporal]);
    setDraft("");
    setSending(true);
    socket.emit("message:send", { roomId: id, content });
  }

  function retryMessage(message: MensajeUI) {
    if (connection !== "conectado" || sending) return;
    const socket = socketRef.current;
    if (!socket?.connected) return;
    setMessages((current) =>
      current.map((item) => item.id === message.id ? { ...item, estado: "enviando" } : item),
    );
    setSending(true);
    socket.emit("message:send", { roomId: id, content: message.content });
  }

  function scrollToLatest() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    nearBottomRef.current = true;
    setNewMessages(false);
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    nearBottomRef.current = distance < 120;
    if (nearBottomRef.current) setNewMessages(false);
  }

  async function saveRoom(event: FormEvent) {
    event.preventDefault();
    const limpio = editName.trim();
    setEditError("");
    if (!limpio) {
      setEditError("Escribe un nombre para la sala.");
      return;
    }
    if (limpio.length > 50) {
      setEditError("El nombre no puede superar 50 caracteres.");
      return;
    }
    setSavingRoom(true);
    try {
      const updated = await updateRoom(id, limpio);
      setRoomName(updated.nombre);
      setEditName(updated.nombre);
      setEditOpen(false);
      setSuccess("Nombre de la sala actualizado.");
    } catch (error) {
      setEditError(
        error instanceof ApiError
          ? error.detail.campos?.nombre ?? error.detail.mensaje
          : "No pudimos guardar los cambios.",
      );
    } finally {
      setSavingRoom(false);
    }
  }

  async function confirmDeleteRoom() {
    setDeletingRoom(true);
    setDeleteError("");
    try {
      await deleteRoom(id);
      navigate("/panel", { replace: true, state: { roomDeleted: true, deletedByOwner: true } });
    } catch (error) {
      setDeleteError(
        error instanceof ApiError
          ? error.detail.mensaje
          : "No pudimos eliminar la sala.",
      );
      setDeletingRoom(false);
    }
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(id);
      setSuccess("ID de la sala copiado.");
    } catch {
      setSuccess("No se pudo copiar automáticamente. Selecciona el ID manualmente.");
    }
  }

  function leaveRoom() {
    const socket = socketRef.current;
    if (socket?.connected) socket.emit("room:leave", { roomId: id });
    socket?.disconnect();
    navigate("/panel", { replace: true });
  }

  const ownMessage = (message: MensajeUI) =>
    Boolean(user?.uid && message.senderUid === user.uid);

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    <section className="min-h-[calc(100vh-69px)] w-full bg-[#07111f]">
      <header className="border-b border-[#1c2b3c] bg-[#0b1627] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="secondary"
              className="shrink-0 !px-3"
              onClick={() => setLeaveOpen(true)}
            >
              ← <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                {roomName}
              </h1>
              <p className="truncate font-mono text-[11px] text-slate-400">
                ID: {id}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {owner && (
              <>
                <Button
                  variant="secondary"
                  className="!hidden !px-2 sm:!inline-flex"
                  onClick={() => setEditOpen(true)}
                >
                  Editar sala
                </Button>
                <Button
                  className="!hidden !bg-red-600 !px-2 hover:!bg-red-700 sm:!inline-flex"
                  onClick={() => setDeleteOpen(true)}
                >
                  Eliminar sala
                </Button>
              </>
            )}
          </div>
        </div>
        {owner && (
          <div className="mx-auto mt-2 flex max-w-[1600px] gap-2 sm:hidden">
            <Button
              variant="secondary"
              className="min-w-0 flex-1 !px-2"
              onClick={() => setEditOpen(true)}
            >
              Editar sala
            </Button>
            <Button
              className="min-w-0 flex-1 !bg-red-600 !px-2 hover:!bg-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar sala
            </Button>
          </div>
        )}
      </header>

      {success && (
        <div className="mx-auto max-w-[1600px] px-4 pt-3">
          <StatusMessage type="success">{success}</StatusMessage>
        </div>
      )}

      {roomError && (
        <div className="mx-auto max-w-[1600px] px-4 pt-3">
          <StatusMessage type="error">{roomError}</StatusMessage>
          {connection === "error" && (
            <div className="mt-3 flex gap-2">
              <Button onClick={() => window.location.reload()} variant="secondary">
                Reintentar
              </Button>
              <Button onClick={() => navigate("/panel", { replace: true })}>
                Volver al panel
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto grid h-[calc(100dvh-130px)] max-w-[1600px] grid-cols-1 gap-3 p-3 sm:h-[calc(100dvh-145px)] sm:p-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <aside
          className={`z-40 flex-col overflow-hidden rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] shadow-2xl ${
            panel === "chat"
              ? "fixed inset-x-3 bottom-[5.25rem] top-[6.25rem] flex"
              : "hidden"
          } lg:static lg:flex lg:h-full lg:w-auto lg:shadow-none`}
          aria-label="Chat de la sala"
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1c2b3c] px-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Chat de la sala</h2>
              <p className="text-[11px] text-slate-400" aria-live="polite">
                {connection === "conectado" ? "Conectado" : connection === "reconectando" ? "Reconectando…" : "Sin conexión"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="rounded-md px-2 py-1 text-slate-400 hover:bg-[#172236] hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400 lg:hidden"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          {historyState === "cargando" ? (
            <div role="status" className="flex flex-1 items-center justify-center gap-3 text-sm text-slate-300">
              <Spinner /> Cargando historial…
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="relative min-h-0 flex-1 overflow-y-auto px-3 py-3"
              aria-live="polite"
            >
              {hasMore && (
                <div className="mb-3 text-center">
                  {olderError && <p role="alert" className="mb-2 text-xs text-red-400">{olderError}</p>}
                  <Button variant="secondary" className="w-full !py-2" onClick={() => void loadOlder()} disabled={loadingOlder}>
                    {loadingOlder && <Spinner />}
                    {loadingOlder ? "Cargando…" : olderError ? "Reintentar carga anterior" : "Cargar mensajes anteriores"}
                  </Button>
                </div>
              )}
              {historyState === "error" && (
                <div className="mb-3 rounded-lg border border-red-500/20 p-3 text-center">
                  <p role="alert" className="text-xs text-red-300">{historyError}</p>
                  <Button variant="secondary" className="mt-2" onClick={() => void loadHistory()}>
                    Reintentar
                  </Button>
                </div>
              )}
              {messages.length === 0 && historyState === "listo" ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                  <div className="flex size-11 items-center justify-center rounded-full bg-blue-500/10 text-xl text-blue-300">💬</div>
                  <h3 className="mt-3 text-sm font-semibold text-white">Aún no hay mensajes</h3>
                  <p className="mt-1 max-w-52 text-xs text-slate-400">Sé la primera persona en iniciar la conversación.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const own = ownMessage(message);
                    return (
                      <article key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`} aria-label={`Mensaje de ${message.senderName || "usuario"}`}>
                        <div className={`max-w-[88%] rounded-lg px-3 py-2 ${own ? "bg-[#2563eb] text-white" : "border border-[#1c2b3c] bg-[#111c2f] text-slate-100"}`}>
                          <div className="mb-1 flex items-center gap-2 text-[10px]">
                            <span className="font-semibold">{own ? "Tú" : message.senderName || "Usuario eliminado"}</span>
                            <time className={own ? "text-blue-100" : "text-slate-400"} dateTime={message.createdAt}>
                              {formatTime(message.createdAt)}
                            </time>
                          </div>
                          <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
                          {message.estado === "enviando" && <p className="mt-1 text-[11px] text-blue-100">Enviando…</p>}
                          {message.estado === "fallido" && (
                            <div className="mt-1 flex items-center gap-2 text-[11px]">
                              <span>No enviado</span>
                              <button type="button" className="underline" onClick={() => retryMessage(message)}>Reintentar</button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {newMessages && (
            <button
              type="button"
              onClick={scrollToLatest}
              className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg"
            >
              Mensajes nuevos
            </button>
          )}

          <form onSubmit={sendMessage} className="shrink-0 border-t border-[#1c2b3c] p-2" aria-label="Enviar mensaje">
            <label htmlFor="mensaje-sala" className="sr-only">Escribe un mensaje</label>
            <div className="flex gap-2">
              <input
                id="mensaje-sala"
                ref={chatInputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribe un mensaje"
                disabled={connection !== "conectado"}
                maxLength={2000}
                className="min-w-0 flex-1 rounded-md border border-[#344458] bg-[#03111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-60"
              />
              <Button type="submit" className="shrink-0 !px-3" disabled={connection !== "conectado" || !draft.trim() || sending}>
                {sending && <Spinner />}
                Enviar
              </Button>
            </div>
          </form>
        </aside>

        <main className="relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#1c2b3c] bg-[#0d1c2d]">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1c2b3c] px-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className={`size-2 rounded-full ${connection === "conectado" ? "bg-emerald-400" : connection === "reconectando" ? "bg-amber-400" : "bg-red-400"}`} />
              {connection === "conectado" ? "Conectado" : connection === "reconectando" ? "Reconectando…" : "Sin conexión"}
            </div>
            <button type="button" onClick={() => setPanel("participantes")} className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-[#172236] lg:hidden">
              Participantes ({participants.length})
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-lg border border-[#1c2b3c] bg-[#051424]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-7 text-blue-400">
                <rect x="3" y="5" width="15" height="12" rx="2" />
                <path d="m18 10 3-2v8l-3-2" />
                <path d="M8 9h.01M12 9h.01" />
              </svg>
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-blue-300">Área de estudio colaborativo</p>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Área de colaboración y video</h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              La cuadrícula de video y estados de cámara/micrófono de participantes estará disponible próximamente.
            </p>
          </div>

          <div className="hidden shrink-0 border-t border-[#1c2b3c] p-3 sm:block">
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" disabled className="rounded-md border border-[#1c2b3c] px-3 py-2 text-xs text-slate-500">Micrófono</button>
              <button type="button" disabled className="rounded-md border border-[#1c2b3c] px-3 py-2 text-xs text-slate-500">Cámara</button>
              <button type="button" disabled className="rounded-md border border-[#1c2b3c] px-3 py-2 text-xs text-slate-500">Compartir pantalla</button>
              <button type="button" onClick={() => setPanel("chat")} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Chat</button>
              <button type="button" onClick={() => setPanel("participantes")} className="rounded-md border border-[#1c2b3c] px-3 py-2 text-xs font-semibold text-slate-300">Participantes ({participants.length})</button>
            </div>
          </div>
        </main>

        {panel === "participantes" && (
          <aside className="fixed bottom-[5.25rem] right-3 top-[6.25rem] z-40 flex w-[calc(100%-1.5rem)] max-w-sm flex-col rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] shadow-2xl sm:max-w-md xl:static xl:h-full xl:w-auto xl:max-w-none xl:shadow-none">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1c2b3c] px-4">
              <h2 className="text-sm font-semibold text-white">Participantes ({participants.length})</h2>
              <button type="button" onClick={() => setPanel(null)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-[#172236] hover:text-white" aria-label="Cerrar participantes">×</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {participants.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="font-semibold text-white">No hay otros participantes</p>
                  <p className="mt-1 text-xs text-slate-400">Comparte el ID para invitar compañeros.</p>
                  <Button className="mt-4" variant="secondary" onClick={() => void copyRoomId()}>
                    Copiar ID
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {participants.map((participant) => (
                    <li key={participant.uid} className="flex items-center gap-3 rounded-md border border-[#1c2b3c] bg-[#111c2f] p-3">
                      <Avatar value="avatar-1" className="size-9" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {participant.displayName || "Usuario"}
                          {participant.uid === user?.uid ? " (Tú)" : ""}
                        </p>
                        {owner && participant.uid === user?.uid && <p className="text-[11px] text-blue-300">Anfitrión</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        )}
      </div>

      <nav className="fixed bottom-3 left-1/2 z-20 grid w-[calc(100%-1.5rem)] max-w-md grid-cols-5 gap-1 rounded-lg border border-[#1c2b3c] bg-[#0d1c2d] p-1.5 shadow-xl -translate-x-1/2 sm:left-auto sm:right-4 sm:w-auto sm:max-w-none sm:translate-x-0">
        <button type="button" disabled title="Próximamente" className="min-w-0 rounded-md px-1 py-2 text-[10px] text-slate-500 sm:px-3 sm:text-xs">Micrófono</button>
        <button type="button" disabled title="Próximamente" className="min-w-0 rounded-md px-1 py-2 text-[10px] text-slate-500 sm:px-3 sm:text-xs">Cámara</button>
        <button type="button" disabled title="Próximamente" className="min-w-0 rounded-md px-1 py-2 text-[10px] text-slate-500 sm:px-3 sm:text-xs"><span className="hidden sm:inline">Compartir </span>Pantalla</button>
        <button
          type="button"
          onClick={() => setPanel(panel === "chat" ? null : "chat")}
          className={`min-w-0 rounded-md px-1 py-2 text-[10px] font-semibold sm:px-3 sm:text-xs ${panel === "chat" ? "bg-blue-600 text-white" : "text-slate-300"}`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "participantes" ? null : "participantes")}
          className={`min-w-0 rounded-md px-1 py-2 text-[10px] font-semibold sm:px-3 sm:text-xs ${panel === "participantes" ? "bg-blue-600 text-white" : "text-slate-300"}`}
        >
          Participantes
        </button>
      </nav>

      {owner && (
        <>
          <Modal
            open={editOpen}
            onClose={() => !savingRoom && setEditOpen(false)}
            dismissible={!savingRoom}
            title="Editar sala"
            description="Actualiza el nombre de tu sala de estudio."
          >
            <form onSubmit={saveRoom} noValidate className="space-y-4">
              {editError && <StatusMessage type="error">{editError}</StatusMessage>}
              <TextField
                id="editar-sala-nombre"
                label="Nombre de la sala"
                value={editName}
                maxLength={50}
                onChange={(event) => {
                  setEditName(event.target.value);
                  setEditError("");
                }}
                error={editError && !editName.trim() ? editError : undefined}
                disabled={savingRoom}
                helpText={`Máximo 50 caracteres (${editName.trim().length}/50).`}
              />
              <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={savingRoom}>Cancelar</Button>
                <Button type="submit" disabled={savingRoom}>
                  {savingRoom && <Spinner />}
                  {savingRoom ? "Guardando…" : editError ? "Reintentar" : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            open={deleteOpen}
            onClose={() => !deletingRoom && setDeleteOpen(false)}
            dismissible={!deletingRoom}
            tone="danger"
            title="¿Eliminar sala?"
            description="Esta acción es permanente e irreversible."
          >
            {deleteError && <StatusMessage type="error">{deleteError}</StatusMessage>}
            <p className="text-sm text-slate-300">
              Esta acción eliminará la sala y redirigirá a todos los participantes conectados al panel.
            </p>
            <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deletingRoom}>Cancelar</Button>
              <Button className="!bg-red-600 hover:!bg-red-700" onClick={() => void confirmDeleteRoom()} disabled={deletingRoom}>
                {deletingRoom && <Spinner />}
                {deletingRoom ? "Eliminando…" : deleteError ? "Reintentar" : "Eliminar sala"}
              </Button>
            </div>
          </Modal>
        </>
      )}

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        tone="danger"
        title="¿Salir de la sala?"
        description="Confirmación de desconexión"
      >
        <p className="text-sm text-slate-300">
          Si sales de la sala, se desconectará tu cámara y tu micrófono en tiempo real y tendrás que volver a ingresar con el código.
        </p>
        <div className="flex flex-col-reverse gap-2.5 border-t border-[#1c2b3c] pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Permanecer en la sala</Button>
          <Button className="!bg-red-600 hover:!bg-red-700" onClick={leaveRoom}>Confirmar salida</Button>
        </div>
      </Modal>
    </section>
  );
}

