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
  /**
   * IDs of elements that have been soft-deleted in this session.
   * In-memory only — no Jazz persistence in the prototype. The list pane
   * filters them out, and the detail pane is reset when the selected element
   * is soft-deleted. Restored via the toast undo action.
   */
  deletedElementIds: string[];
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
  deletedElementIds: [],
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

/**
 * Soft delete an element: mark it as deleted (filtered out of lists) and
 * clear the current selection so the detail pane returns to its empty state.
 * Also exits fullscreen mode and edit mode if active.
 */
export function softDeleteElement(id: string): void {
  const current = workspaceUi$.deletedElementIds.peek();
  if (!current.includes(id)) {
    workspaceUi$.deletedElementIds.set([...current, id]);
  }
  workspaceUi$.selectedElementId.set(null);
  workspaceUi$.isEditing.set(false);
  workspaceUi$.fullscreen.set(false);
}

/**
 * Restore a soft-deleted element back into the visible list and re-select it
 * so the user lands on the item they accidentally deleted.
 */
export function restoreElement(id: string): void {
  const current = workspaceUi$.deletedElementIds.peek();
  if (current.includes(id)) {
    workspaceUi$.deletedElementIds.set(current.filter((d) => d !== id));
  }
  workspaceUi$.selectedElementId.set(id);
}

/**
 * Finalize a soft delete after the toast undo window has expired. In the
 * mock-data prototype the element stays in `deletedElementIds` (visual-only
 * removal). A future Jazz-backed implementation would mutate persistence here.
 */
export function finalizeDelete(id: string): void {
  // No-op in the prototype: the id remains in deletedElementIds so the list
  // continues to filter it out. Kept as a named entry point so the future
  // Jazz adapter can hook persistence without refactoring callers.
  void id;
}
