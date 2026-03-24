import { ArrowRight, BookOpenText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useWorkspaceHomeState } from "@/features/workspace/workspace.adapter";

export function WorkspaceHomePage() {
  const { account, workspaceResult } = useWorkspaceHomeState();
  const navigate = useNavigate();
  const me = account.me;

  if (!me || !me.root?.workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-ink/80">Caricamento workspace...</p>
      </div>
    );
  }

  if (workspaceResult.isErr()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-700 shadow-lg shadow-red-100">
          Workspace non disponibile.
        </div>
      </div>
    );
  }

  const workspace = workspaceResult.value;
  const displayName = me.profile?.name ?? "Studente";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_42%),linear-gradient(180deg,_#f0fdfa_0%,_#ffffff_55%,_#ecfeff_100%)] px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-[2rem] border border-primary/15 bg-white/85 p-8 shadow-xl shadow-primary/10 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Workspace pronto
              </span>
              <h1 className="font-heading text-3xl text-ink">
                {workspace.nome}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/80">
                Ciao {displayName}. Il tuo workspace personale è stato creato e
                sincronizzato. Da qui partiranno elementi, board e relazioni di
                studio.
              </p>
            </div>
            <BookOpenText className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5">
            <h2 className="font-heading text-xl text-ink">Inizia da qui</h2>
            <p className="mt-3 text-sm leading-6 text-ink/75">
              Crea il primo Elemento per iniziare a costruire timeline,
              genealogie e collegamenti bidirezionali.
            </p>
            <button
              type="button"
              onClick={() => navigate("/elemento/nuovo")}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/25"
            >
              Crea il primo Elemento
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>

          <article className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5">
            <h2 className="font-heading text-xl text-ink">Stato iniziale</h2>
            <dl className="mt-4 space-y-3 text-sm text-ink/75">
              <div className="flex items-center justify-between gap-4">
                <dt>Tag censiti</dt>
                <dd className="font-semibold text-ink">{workspace.tagRegistry?.length ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Board salvati</dt>
                <dd className="font-semibold text-ink">{workspace.boardIds?.length ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Creato il</dt>
                <dd className="font-semibold text-ink">
                  {new Date(workspace.createdAt).toLocaleDateString("it-IT")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Elementi</dt>
                <dd className="font-semibold text-ink">{workspace.elementi?.length ?? 0}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </main>
  );
}
