import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import "@/styles/index.css";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";

function DevBootOverlay({
  stalled,
  onOpenPreview
}: {
  stalled: boolean;
  onOpenPreview: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,_rgba(240,253,250,0.96),_rgba(255,255,255,0.96))] px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Bible Board
        </p>
        <h1 className="mt-4 font-heading text-3xl text-ink">
          Inizializzazione workspace
        </h1>
        <p className="mt-4 text-base leading-7 text-ink/80">
          Sto preparando provider, autenticazione e storage locale.
        </p>
        {stalled ? (
          <>
            <p className="mt-4 text-sm leading-6 text-ink/75">
              Il bootstrap sta impiegando piu del previsto nel browser corrente.
              Puoi aprire un&apos;anteprima locale dei componenti senza auth.
            </p>
            <button
              type="button"
              onClick={onOpenPreview}
              className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90"
            >
              Apri anteprima locale
            </button>
          </>
        ) : (
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

function Root() {
  const previewMode = useMemo(
    () => import.meta.env.DEV && window.location.pathname === "/preview",
    []
  );
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStalled(true);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (previewMode) {
    return (
      <React.StrictMode>
        <WorkspacePreviewPage />
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      {!ready ? (
        <DevBootOverlay
          stalled={stalled}
          onOpenPreview={() => {
            window.location.href = "/preview";
          }}
        />
      ) : null}
      <AppProviders>
        <App onReady={() => setReady(true)} />
      </AppProviders>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
