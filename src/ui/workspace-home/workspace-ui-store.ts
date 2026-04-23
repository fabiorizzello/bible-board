/**
 * workspace-ui-store — Legend State observable for shared workspace UI state.
 *
 * Module-level singleton (not React context) for fine-grained reactivity across
 * decomposed workspace components.
 *
 * Jazz mutations are surfaced here as thin wrappers so call sites in UI
 * components don't need direct adapter imports. Raw Jazz state is kept in
 * module-level refs (not in the observable) to avoid Jazz proxy serialization.
 */

import type { Elemento, TipoLink, RuoloLink } from "@/features/elemento/elemento.model";
import type { SortBy, SortDir } from "./display-helpers";
import type { NormalizedElementoInput, NormalizedFonte, FonteTipo } from "@/features/elemento/elemento.rules";
import type { Board } from "@/features/board/board.model";
import { observable } from "@legendapp/state";
import {
  updateWorkspaceElemento,
  addBidirectionalLink,
  removeBidirectionalLink as removeBidirectionalLinkAdapter,
  softDeleteWorkspaceElemento,
  restoreSoftDeletedElemento,
} from "@/features/elemento/elemento.adapter";
import {
  createBoard as createBoardAdapter,
  renameBoard as renameBoardAdapter,
  deleteBoard as deleteBoardAdapter,
} from "@/features/board/board.adapter";

export type ViewId = "recenti" | "tutti" | `board-${string}`;

export type BoardViewMode = "lista" | "timeline";

export type EditableFieldId =
  | "titolo"
  | "tipo"
  | "vita"
  | "origine"
  | "tribu"
  | "descrizione"
  | "ruoli"
  | "tags"
  | "fonti"
  | "collegamenti-famiglia"
  | "collegamenti-generici"
  | "add-field"
  | "review";

// Legacy type — kept for backward compatibility with existing call sites
export type ElementoSessionPatch = Partial<Omit<Elemento, "id">>;

export interface WorkspaceUIState {
  currentView: ViewId;
  selectedElementId: string | null;
  filterText: string;
  activeTipo: string;
  sortBy: SortBy;
  sortDir: SortDir;
  sidebarOpen: boolean;
  fullscreen: boolean;
  editingFieldId: EditableFieldId | null;
  lastModified: number;
  activeBoardView: BoardViewMode;
}

export type { SortBy, SortDir };

// ── Module-level Jazz state refs ──
// Kept outside the observable to avoid Legend State attempting to deeply
// observe Jazz reactive proxies (which would break the Jazz reactivity model).

let _jazzMe: any = null;
let _jazzElementi: readonly Elemento[] = [];
let _jazzBoards: readonly Board[] = [];
const _fontiBacking = new Map<string, readonly NormalizedFonte[]>();

export function getJazzMe(): any {
  return _jazzMe;
}

export function getJazzElementi(): readonly Elemento[] {
  return _jazzElementi;
}

export function getJazzBoards(): readonly Board[] {
  return _jazzBoards;
}

export function getJazzFontiForElement(elementoId: string): readonly NormalizedFonte[] {
  return _fontiBacking.get(elementoId) ?? [];
}

/**
 * Called by WorkspacePreviewPage on every Jazz-triggered render.
 * Populates the module-level refs so all display-helper functions read fresh data.
 */
export function syncJazzState(
  me: any,
  rawCoMaps: any[],
  domainElementi: Elemento[],
): void {
  _jazzMe = me;
  _jazzElementi = domainElementi;

  _fontiBacking.clear();
  for (const coMap of rawCoMaps) {
    if (!coMap?.id) continue;
    const fonti: NormalizedFonte[] = coMap.fonti
      ? Array.from(coMap.fonti as any[])
          .filter(Boolean)
          .map((f: any) => ({
            tipo: f.tipo as FonteTipo,
            valore: f.valore as string,
            ...(f.urlCalcolata ? { urlCalcolata: f.urlCalcolata as string } : {}),
          }))
      : [];
    _fontiBacking.set(coMap.id as string, fonti);
  }
}

/**
 * Test-only: seed the Jazz element store with inline fixtures.
 * Call in beforeEach to make display-helper functions work without a real Jazz runtime.
 */
export function syncJazzElementiForTest(
  elementi: Elemento[],
  fontiBacking?: ReadonlyMap<string, readonly NormalizedFonte[]>,
): void {
  _jazzMe = null;
  _jazzElementi = [...elementi];
  _fontiBacking.clear();
  if (fontiBacking) {
    for (const [id, fonti] of fontiBacking) {
      _fontiBacking.set(id, fonti);
    }
  }
}

/**
 * Called by WorkspacePreviewPage on every Jazz-triggered render.
 * Updates the module-level boards ref and bumps lastModified to trigger
 * NavSidebar re-reads of getBoardDisplayItems().
 */
export function syncJazzBoards(boards: readonly Board[]): void {
  _jazzBoards = boards;
  workspaceUi$.lastModified.set(Date.now());
}

/**
 * Test-only: seed the Jazz boards store with inline fixtures.
 */
export function syncJazzBoardsForTest(boards: readonly Board[]): void {
  _jazzBoards = [...boards];
}

// ── Observable UI state ──

const initialState: WorkspaceUIState = {
  currentView: "recenti",
  selectedElementId: null,
  filterText: "",
  activeTipo: "Tutti",
  sortBy: "titolo",
  sortDir: "asc",
  sidebarOpen: true,
  fullscreen: false,
  editingFieldId: null,
  lastModified: 0,
  activeBoardView: "lista",
};

export const workspaceUi$ = observable<WorkspaceUIState>(initialState);

export function navigateToView(viewId: ViewId): void {
  workspaceUi$.currentView.set(viewId);
  // Reset board view mode to list when navigating to non-board views
  if (!viewId.startsWith("board-")) {
    workspaceUi$.activeBoardView.set("lista");
  }
}

export function setActiveBoardView(view: BoardViewMode): void {
  workspaceUi$.activeBoardView.set(view);
}

export function selectElement(id: string): void {
  workspaceUi$.selectedElementId.set(id);
  closeFieldEditor();
}

export function openFieldEditor(fieldId: EditableFieldId): void {
  workspaceUi$.editingFieldId.set(fieldId);
}

export function closeFieldEditor(): void {
  workspaceUi$.editingFieldId.set(null);
}

export function isFieldEditing(fieldId: EditableFieldId): boolean {
  return workspaceUi$.editingFieldId.peek() === fieldId;
}

/**
 * No-op kept for backward compat. All field patches now go through
 * commitNormalizedElement → Jazz adapter. Link patches are handled by
 * createBidirectionalLink / removeBidirectionalLink.
 */
export function commitElementPatch(
  _elementId: string,
  _patch: ElementoSessionPatch,
): void {
  void _elementId;
  void _patch;
}

/**
 * Persist a normalized element update to the Jazz CoMap.
 */
export function commitNormalizedElement(
  elementId: string,
  normalized: NormalizedElementoInput,
): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("commitNormalizedElement: Jazz account non disponibile");
    return;
  }
  const result = updateWorkspaceElemento(me, elementId, normalized);
  if (result.isErr()) {
    console.warn("commitNormalizedElement failed:", result.error);
  }
}

/**
 * No-op kept for backward compat. Fonti are now persisted via Jazz
 * (addFonteToElemento / removeFonteFromElemento in ElementoEditor).
 */
export function commitFontiOverride(
  _elementId: string,
  _fonti: readonly NormalizedFonte[],
): void {
  void _elementId;
  void _fonti;
}

/**
 * Soft-delete via Jazz deletedAt flag. Clears the selection immediately so
 * the detail pane returns to its empty state before the Jazz re-render.
 */
export function softDeleteElement(id: string): void {
  const me = getJazzMe();
  if (me) {
    const result = softDeleteWorkspaceElemento(me, id);
    if (result.isErr()) {
      console.warn("softDeleteElement failed:", result.error);
    }
  }
  workspaceUi$.selectedElementId.set(null);
  closeFieldEditor();
  workspaceUi$.fullscreen.set(false);
}

/**
 * Restore a soft-deleted element and re-select it.
 */
export function restoreElement(id: string): void {
  const me = getJazzMe();
  if (me) {
    const result = restoreSoftDeletedElemento(me, id);
    if (result.isErr()) {
      console.warn("restoreElement failed:", result.error);
    }
  }
  workspaceUi$.selectedElementId.set(id);
}

/** No-op: soft delete via deletedAt is already persisted in Jazz. */
export function finalizeDelete(_id: string): void {
  void _id;
}

export function resetWorkspaceUiState(): void {
  workspaceUi$.set({ ...initialState });
  _jazzMe = null;
  _jazzElementi = [];
  _jazzBoards = [];
  _fontiBacking.clear();
}

export function createBoardInWorkspace(nome: string): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("createBoardInWorkspace: Jazz account non disponibile");
    return;
  }
  const result = createBoardAdapter(me, nome);
  if (result.isErr()) {
    console.warn("createBoardInWorkspace failed:", result.error);
  }
}

export function renameBoardInWorkspace(boardId: string, newNome: string): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("renameBoardInWorkspace: Jazz account non disponibile");
    return;
  }
  const result = renameBoardAdapter(me, boardId, newNome);
  if (result.isErr()) {
    console.warn("renameBoardInWorkspace failed:", result.error);
  }
}

export function deleteBoardFromWorkspace(boardId: string): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("deleteBoardFromWorkspace: Jazz account non disponibile");
    return;
  }
  const result = deleteBoardAdapter(me, boardId);
  if (result.isErr()) {
    console.warn("deleteBoardFromWorkspace failed:", result.error);
  }
  if (workspaceUi$.currentView.peek() === `board-${boardId}`) {
    workspaceUi$.currentView.set("recenti");
  }
}

/**
 * Create a bidirectional link between two elementi via the Jazz adapter.
 */
export function createBidirectionalLink(
  sourceId: string,
  targetId: string,
  tipo: TipoLink,
  ruolo?: RuoloLink,
): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("createBidirectionalLink: Jazz account non disponibile");
    return;
  }
  const result = addBidirectionalLink(me, sourceId, targetId, tipo, ruolo);
  if (result.isErr()) {
    console.warn("createBidirectionalLink failed:", result.error);
  }
}

/**
 * Remove a bidirectional link between two elementi via the Jazz adapter.
 */
export function removeBidirectionalLink(
  sourceId: string,
  targetId: string,
  tipo: TipoLink,
): void {
  const me = getJazzMe();
  if (!me) {
    console.warn("removeBidirectionalLink: Jazz account non disponibile");
    return;
  }
  const result = removeBidirectionalLinkAdapter(me, sourceId, targetId, tipo);
  if (result.isErr()) {
    console.warn("removeBidirectionalLink failed:", result.error);
  }
}
