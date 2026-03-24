import { createBrowserRouter, matchRoutes } from "react-router";
import { AuthGate } from "@/ui/auth-gate/AuthGate";
import { ElementoDetailPage } from "@/ui/elemento-detail/ElementoDetailPage";
import { ElementoEditorPage } from "@/ui/elemento-editor/ElementoEditorPage";
import { WorkspaceHomePage } from "@/ui/workspace-home/WorkspaceHomePage";

const BOARD_VIEWS = ["timeline", "lista", "grafo", "genealogia"] as const;

export type BoardView = (typeof BOARD_VIEWS)[number];

export function normalizeBoardViewParam(view: string | null | undefined): BoardView {
  if (view && BOARD_VIEWS.includes(view as BoardView)) {
    return view as BoardView;
  }

  return "timeline";
}

export function normalizeBoardQueryParam(query: string | null | undefined) {
  const trimmed = query?.trim();
  return trimmed ? trimmed : undefined;
}

function RootRoute() {
  return (
    <AuthGate>
      <WorkspaceHomePage />
    </AuthGate>
  );
}

function BoardRoute() {
  return (
    <AuthGate>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-6 py-8">
        <h1 className="font-heading text-2xl text-ink">Board</h1>
        <p className="text-ink/80">
          Shell iniziale del board. Le viste timeline, lista, grafo e genealogia
          verranno implementate nelle fasi successive.
        </p>
      </div>
    </AuthGate>
  );
}

function ElementoRoute() {
  return (
    <AuthGate>
      <ElementoDetailPage />
    </AuthGate>
  );
}

function NuovoElementoRoute() {
  return (
    <AuthGate>
      <ElementoEditorPage />
    </AuthGate>
  );
}

function ModificaElementoRoute() {
  return (
    <AuthGate>
      <ElementoEditorPage />
    </AuthGate>
  );
}

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

export const appRoutes = [
  { path: "/", Component: RootRoute },
  { path: "/board/:boardId", Component: BoardRoute },
  { path: "/elemento/nuovo", Component: NuovoElementoRoute },
  { path: "/elemento/:elementoId/modifica", Component: ModificaElementoRoute },
  { path: "/elemento/:elementoId", Component: ElementoRoute },
  { path: "*", Component: NotFoundRoute }
] as const;

export const appRouter = createBrowserRouter(appRoutes as unknown as Parameters<typeof createBrowserRouter>[0]);

export function matchAppRoutes(pathname: string) {
  return matchRoutes(appRoutes as unknown as Parameters<typeof matchRoutes>[0], pathname);
}
