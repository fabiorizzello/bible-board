/**
 * Legend State observable store for workspace UI state.
 *
 * Module-level singleton — components subscribe via @legendapp/state/react hooks.
 * Replaces the 7 useState calls in the monolith WorkspacePreviewPage.
 */

import { observable } from "@legendapp/state";

export type ViewId =
  | "recenti"
  | "tutti"
  | "board-patriarchi"
  | "board-profeti";

export interface WorkspaceUiState {
  currentView: ViewId;
  selectedElementId: string | null;
  filterText: string;
  activeTipo: string;
  sidebarOpen: boolean;
  fullscreen: boolean;
  detailFullscreen: boolean;
}

export const workspaceUi$ = observable<WorkspaceUiState>({
  currentView: "recenti",
  selectedElementId: null,
  filterText: "",
  activeTipo: "Tutti",
  sidebarOpen: true,
  fullscreen: false,
  detailFullscreen: false,
});

/** Reset filters and selection when navigating to a new view. */
export function navigateToView(viewId: ViewId): void {
  workspaceUi$.currentView.set(viewId);
  workspaceUi$.selectedElementId.set(null);
  workspaceUi$.filterText.set("");
  workspaceUi$.activeTipo.set("Tutti");
}

/** Select an element and collapse sidebar on small viewports. */
export function selectElement(id: string): void {
  workspaceUi$.selectedElementId.set(id);
  workspaceUi$.sidebarOpen.set(false);
}
