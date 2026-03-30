import { createBrowserRouter } from "react-router";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";

function NotFoundRoute() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="max-w-md rounded-3xl border border-primary/10 bg-white p-8 shadow-lg shadow-primary/10">
        <h1 className="font-heading text-2xl text-ink">Pagina non trovata</h1>
        <p className="mt-3 text-ink/80">
          Il percorso richiesto non esiste o non è più valido.
        </p>
      </div>
    </div>
  );
}

export const appRouter = createBrowserRouter([
  { path: "/", Component: WorkspacePreviewPage },
  { path: "/workspace-v4", Component: WorkspacePreviewPage },
  { path: "*", Component: NotFoundRoute },
]);
