/**
 * workspace-ui-store — Legend State observable for shared workspace UI state.
 *
 * Module-level singleton (not React context) for fine-grained reactivity across
 * decomposed workspace components.
 */

import { observable } from "@legendapp/state";

export type ViewId = "recenti" | "tutti" | "board-patriarchi" | "board-profeti";

export interface WorkspaceUIState {
  currentView: ViewId;
  selectedElementId: string | null;
  filterText: string;
  activeTipo: string;
  sidebarOpen: boolean;
  fullscreen: boolean;
  isEditing: boolean;
  lastModified: number;
}

const initialState: WorkspaceUIState = {
  currentView: "recenti",
  selectedElementId: null,
  filterText: "",
  activeTipo: "Tutti",
  sidebarOpen: true,
  fullscreen: false,
  isEditing: false,
  lastModified: Date.now(),
};

export const workspaceUi$ = observable<WorkspaceUIState>(initialState);

export function navigateToView(viewId: ViewId): void {
  workspaceUi$.currentView.set(viewId);
}

export function selectElement(id: string): void {
  workspaceUi$.selectedElementId.set(id);
}

export function startEditing(): void {
  workspaceUi$.isEditing.set(true);
}

export function stopEditing(): void {
  workspaceUi$.isEditing.set(false);
}
