import { createBrowserRouter, Navigate } from "react-router";
import { DemoAuthPage } from "@/ui/auth/DemoAuthPage";
import { WorkspaceHomePage } from "@/ui/workspace-home/WorkspaceHomePage";
import { WorkspaceLayout } from "@/ui/workspace-layout/WorkspaceLayout";
import { useAuth } from "@/app/auth-context";

/**
 * Auth guard — redirects to /auth when unauthenticated.
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  if (!nome) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

/**
 * Redirect authenticated users away from /auth.
 */
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  if (nome) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function NotFoundRoute() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-6">
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
  {
    path: "/auth",
    element: (
      <RedirectIfAuth>
        <DemoAuthPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <WorkspaceHomePage />
      </RequireAuth>
    ),
  },
  {
    path: "/workspace",
    element: (
      <RequireAuth>
        <WorkspaceLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: null },
      { path: "tutti", element: null },
      { path: "elemento/:elementoId", element: null },
      { path: "board/:boardId", element: null },
    ],
  },
  { path: "*", Component: NotFoundRoute },
]);
