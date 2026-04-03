import { createBrowserRouter } from "react-router";
import { DemoAuthPage } from "@/ui/auth/DemoAuthPage";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";
import { RequireAuth, RedirectIfAuth } from "@/app/auth-guards";
import { NotFoundPage } from "@/ui/not-found/NotFoundPage";

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
  { path: "*", Component: NotFoundPage },
]);
