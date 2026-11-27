import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  titleIcon?: ReactNode;
  onClose: () => void;
  /** false mientras hay una acción en curso: bloquea Esc y clic fuera */
  dismissible?: boolean;
  tone?: "default" | "danger";
  children: ReactNode;
};

export default function Modal({
  open,
  title,
  description,
  titleIcon,
  onClose,
  dismissible = true,
  tone = "default",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
      opener.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto bg-transparent p-0 text-slate-200 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div
          className={`flex flex-col gap-4 rounded-lg border bg-[#0d1c2d] p-6 shadow-2xl ${tone === "danger" ? "border-red-500/40" : "border-[#1c2b3c]"}`}
        >
          <div className="flex items-start gap-3">
            {titleIcon}
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-white">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-slate-300">
                  {description}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
