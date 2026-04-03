/**
 * workspace-ui-store — Legend State observable for shared workspace UI state.
 *
 * Module-level singleton (not React context) for fine-grained reactivity across
 * decomposed workspace components.
 */

import { observable } from "@legendapp/state";

/** View identifier union (recenti, tutti, or board-{id}) */
export type ViewId = "recenti" | "tutti" | "board-patriarchi" | "board-profeti";

/** Workspace UI state shape */
export interface WorkspaceUIState {
  /** Current active view */
  currentView: ViewId;
  /** Selected element ID (null if none selected) */
  selectedElementId: string | null;
  /** Search/filter text input */
  filterText: string;
  /** Active tipo filter label */
  activeTipo: string;
  /** Sidebar open/collapsed state */
  sidebarOpen: boolean;
  /** Fullscreen detail overlay active */
  fullscreen: boolean;
  /** Last modified timestamp for cache invalidation */
  lastModified: number;
}

/** Initial state */
const initialState: WorkspaceUIState = {
  currentView: "recenti",
  selectedElementId: null,
  filterText: "",
  activeTipo: "Tutti",
  sidebarOpen: true,
  fullscreen: false,
  lastModified: Date.now(),
};

/** Global observable store */
export const workspaceUI$ = observable<WorkspaceUIState>(initialState);
