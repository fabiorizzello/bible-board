import { createBrowserRouter } from "react-router";
import { DemoAuthPage } from "@/ui/auth/DemoAuthPage";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";
import { RequireAuth, RedirectIfAuth } from "@/app/auth-guards";
import { NotFoundPage } from "@/ui/not-found/NotFoundPage";
import { CollegamentoPickerMockup } from "@/ui/mockups/CollegamentoPickerMockup";
import { CommitInteractionMockup } from "@/ui/mockups/CommitInteractionMockup";
import { CompositeVitaMockup } from "@/ui/mockups/CompositeVitaMockup";
import { EmptyFieldsMockup } from "@/ui/mockups/EmptyFieldsMockup";
import { MarkdownDescrizioneMockup } from "@/ui/mockups/MarkdownDescrizioneMockup";
import { ValidationUxMockup } from "@/ui/mockups/ValidationUxMockup";

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
  { path: "/dev/mockup-commit-interaction", Component: CommitInteractionMockup },
  { path: "/dev/mockup-empty-fields", Component: EmptyFieldsMockup },
  { path: "/dev/mockup-collegamento-picker", Component: CollegamentoPickerMockup },
  { path: "/dev/mockup-markdown-descrizione", Component: MarkdownDescrizioneMockup },
  { path: "/dev/mockup-composite-vita", Component: CompositeVitaMockup },
  { path: "/dev/mockup-validation-ux", Component: ValidationUxMockup },
  { path: "*", Component: NotFoundPage },
]);
