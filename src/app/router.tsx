import { createBrowserRouter } from "react-router";
import { DemoAuthPage } from "@/ui/auth/DemoAuthPage";
import { WorkspacePreviewPage } from "@/ui/workspace-home/WorkspacePreviewPage";
import { RequireAuth, RedirectIfAuth } from "@/app/auth-guards";
import { NotFoundPage } from "@/ui/not-found/NotFoundPage";
import { AddFieldFlowMockup } from "@/ui/mockups/AddFieldFlowMockup";
import { CommitInteractionMockup } from "@/ui/mockups/CommitInteractionMockup";
import { CompositeVitaMockup } from "@/ui/mockups/CompositeVitaMockup";
import { MarkdownDescrizioneMockup } from "@/ui/mockups/MarkdownDescrizioneMockup";
import { MockupsIndex } from "@/ui/mockups/MockupsIndex";
import { MultiValueChipMockup } from "@/ui/mockups/MultiValueChipMockup";
import { SingleValuePickerMockup } from "@/ui/mockups/SingleValuePickerMockup";
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
  { path: "/dev/mockups", Component: MockupsIndex },
  { path: "/dev/mockup-commit-interaction", Component: CommitInteractionMockup },
  { path: "/dev/mockup-add-field-flow", Component: AddFieldFlowMockup },
  { path: "/dev/mockup-multi-value-chip", Component: MultiValueChipMockup },
  { path: "/dev/mockup-single-value-picker", Component: SingleValuePickerMockup },
  { path: "/dev/mockup-markdown-descrizione", Component: MarkdownDescrizioneMockup },
  { path: "/dev/mockup-composite-vita", Component: CompositeVitaMockup },
  { path: "/dev/mockup-validation-ux", Component: ValidationUxMockup },
  { path: "*", Component: NotFoundPage },
]);
