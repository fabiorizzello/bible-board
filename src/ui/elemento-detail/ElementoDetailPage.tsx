import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  deleteWorkspaceElemento,
  deserializeDataTemporale,
  findWorkspaceElementoById,
  restoreWorkspaceElemento,
  useWorkspaceElementiState
} from "@/features/elemento/elemento.adapter";
import { formatHistoricalEra, type DataStorica } from "@/features/shared/value-objects";
import { ElementoDeleteAction } from "@/ui/elemento-detail/ElementoDeleteAction";

function formatHistoricalDate(value: DataStorica | null | undefined) {
  if (!value) {
    return "Non indicata";
  }

  const precisionMap: Record<string, string> = {
    esatta: "",
    circa: "circa "
  };

  const monthMap = [
    "",
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic"
  ];

  const daySegment = value.giorno ? `${value.giorno} ` : "";
  const monthSegment = value.mese ? `${monthMap[value.mese]} ` : "";

  return `${precisionMap[value.precisione] ?? ""}${daySegment}${monthSegment}${value.anno} ${formatHistoricalEra(value.era)}`.trim();
}

function formatTemporalDate(elemento: any) {
  const date = deserializeDataTemporale(elemento);

  if (!date) {
    return "Non indicata";
  }

  if (date.kind === "puntuale") {
    return formatHistoricalDate(date.data);
  }

  return `${formatHistoricalDate(date.inizio)} - ${formatHistoricalDate(date.fine)}`;
}

export function ElementoDetailPage() {
  const navigate = useNavigate();
  const { elementoId } = useParams();
  const { account, workspace } = useWorkspaceElementiState();
  const elemento = findWorkspaceElementoById(workspace, elementoId);
  const [deletedPayload, setDeletedPayload] = useState<{ elemento: any; index: number } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-ink/80">Caricamento elemento...</p>
      </div>
    );
  }

  if (!elemento) {
    if (deletedPayload) {
      return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_42%),linear-gradient(180deg,_#f0fdfa_0%,_#ffffff_55%,_#ecfeff_100%)] px-6 py-10">
          <section className="mx-auto flex max-w-4xl flex-col gap-6">
            <article className="rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-xl shadow-primary/10 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Elemento eliminato
              </p>
              <h1 className="mt-4 font-heading text-3xl text-ink">
                L&apos;elemento è stato rimosso dal workspace
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Puoi annullare subito l&apos;operazione oppure tornare alla home del workspace.
              </p>
            </article>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!account.me) {
                    return;
                  }

                  restoreWorkspaceElemento(account.me, deletedPayload);
                  setDeletedPayload(null);
                }}
                className="inline-flex min-h-12 items-center rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90"
              >
                Annulla eliminazione
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex min-h-12 items-center rounded-2xl border border-primary/15 px-5 py-3 font-semibold text-ink transition hover:bg-surface"
              >
                Torna al workspace
              </button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-[1.5rem] border border-accent/20 bg-white px-5 py-4 shadow-2xl shadow-primary/10">
                <p className="text-sm text-ink/75">
                  Elemento eliminato. Undo immediato disponibile finché resti su questa schermata.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!account.me) {
                      return;
                    }

                    restoreWorkspaceElemento(account.me, deletedPayload);
                    setDeletedPayload(null);
                  }}
                  className="inline-flex min-h-12 items-center rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90"
                >
                  Undo
                </button>
              </div>
            </div>
          </section>
        </main>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-700 shadow-lg shadow-red-100">
          Elemento non trovato.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_42%),linear-gradient(180deg,_#f0fdfa_0%,_#ffffff_55%,_#ecfeff_100%)] px-6 py-10">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <article className="rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-xl shadow-primary/10 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Elemento salvato
          </p>
          <h1 className="mt-4 font-heading text-3xl text-ink">{elemento.titolo}</h1>
          <p className="mt-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {elemento.tipo}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5">
          <h2 className="font-heading text-xl text-ink">Note</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/75">
            {elemento.note || "Nessuna nota inserita."}
          </p>
        </article>

        {elemento.tipo === "personaggio" ? (
          <article className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5">
            <h2 className="font-heading text-xl text-ink">Cronologia personale</h2>
            <dl className="mt-4 space-y-3 text-sm text-ink/75">
              <div className="flex items-center justify-between gap-4">
                <dt>Nascita</dt>
                <dd className="font-semibold text-ink">{formatHistoricalDate(elemento.nascita)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Morte</dt>
                <dd className="font-semibold text-ink">{formatHistoricalDate(elemento.morte)}</dd>
              </div>
            </dl>
          </article>
        ) : null}

        {elemento.tipo !== "personaggio" ? (
          <article className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5">
            <h2 className="font-heading text-xl text-ink">Collocazione storica</h2>
            <dl className="mt-4 space-y-3 text-sm text-ink/75">
              <div className="flex items-center justify-between gap-4">
                <dt>Data o periodo</dt>
                <dd className="font-semibold text-ink">{formatTemporalDate(elemento)}</dd>
              </div>
            </dl>
          </article>
        ) : null}

        {deleteError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/elemento/${elemento.id}/modifica`)}
            className="inline-flex min-h-12 items-center rounded-2xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            Modifica
          </button>
          <button
            type="button"
            onClick={() => navigate("/elemento/nuovo")}
            className="inline-flex min-h-12 items-center rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90"
          >
            Crea un altro Elemento
          </button>
          <ElementoDeleteAction
            linkCount={0}
            onConfirm={() => {
              if (!account.me || !elemento) {
                return;
              }

              const result = deleteWorkspaceElemento(account.me, elemento.id);
              if (result.isErr()) {
                setDeleteError("Impossibile eliminare l'Elemento.");
                return;
              }

              setDeleteError(null);
              setDeletedPayload(result.value);
            }}
          />
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex min-h-12 items-center rounded-2xl border border-primary/15 px-5 py-3 font-semibold text-ink transition hover:bg-surface"
          >
            Torna al workspace
          </button>
        </div>
      </section>
    </main>
  );
}
