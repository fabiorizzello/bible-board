import { useState } from "react";

interface ElementoDeleteActionProps {
  readonly linkCount: number;
  readonly onConfirm: () => void;
}

export function ElementoDeleteAction({
  linkCount,
  onConfirm
}: ElementoDeleteActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-12 items-center rounded-2xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50"
      >
        Elimina
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-4 md:items-center">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-primary/12 bg-white p-6 shadow-2xl shadow-ink/15">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
              Conferma eliminazione
            </p>
            <h2 className="mt-3 font-heading text-2xl text-ink">
              Vuoi eliminare questo Elemento?
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/75">
              Questo elemento ha {linkCount} link che verranno rimossi.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                }}
                className="inline-flex min-h-12 items-center rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Conferma eliminazione
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-12 items-center rounded-2xl border border-primary/15 px-5 py-3 font-semibold text-ink transition hover:bg-surface"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
