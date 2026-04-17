import { createBrowserRouter } from "react-router";
import { DemoAuthPage } from "@/ui/auth/DemoAuthPage";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";
import { RequireAuth, RedirectIfAuth } from "@/app/auth-guards";
import { NotFoundPage } from "@/ui/not-found/NotFoundPage";
import { CompositeVitaMockup } from "@/ui/mockups/CompositeVitaMockup";

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
        <WorkspacePreviewPage />
      </RequireAuth>
    ),
  },
  // ── Dev-only mockup routes (sketch validation per S02/R005) ─────────────
  // Bypassano auth per accesso diretto al review. Da rimuovere prima di prod.
  { path: "/dev/mockup-composite-vita", Component: CompositeVitaMockup },
  { path: "*", Component: NotFoundPage },
]);
