/**
 * Display helpers — bridge between domain-typed mock data and UI components.
 *
 * Functions here adapt Elemento (branded IDs, DataStorica, ElementoLink)
 * to the display shapes the UI needs (formatted dates, resolved names, etc.).
 */

import type { Elemento, ElementoTipo } from "@/features/elemento/elemento.model";
import type { Board } from "@/features/board/board.model";
import { formatHistoricalEra } from "@/features/shared/value-objects";
import type { DataStorica } from "@/features/shared/value-objects";
import type { NormalizedFonte, FonteTipo } from "@/features/elemento/elemento.rules";
import { ELEMENTI, BOARDS, ELEMENTI_MAP, ELEMENTO_IDS } from "@/mock/data";

import type { ElementoSessionPatch, ViewId } from "./workspace-ui-store";
import { workspaceUi$ } from "./workspace-ui-store";

export type { NormalizedFonte, FonteTipo };

// Re-export ViewId for convenience — single import point for UI modules
export type { ViewId };

// ── Constants ──

/** Simulated current user identity for the mock prototype. */
export const CURRENT_AUTORE = "utente-corrente";

/** Filter labels shown in the tipo filter bar. */
export const TIPO_FILTERS = [
  "Tutti",
  "Personaggi",
  "Eventi",
  "Luoghi",
  "Profezie",
] as const;

export type TipoFilter = (typeof TIPO_FILTERS)[number];

/** Abbreviated tipo labels for compact display (badges, list items). */
export const TIPO_ABBREV: Record<string, string> = {
  personaggio: "pers.",
  evento: "evento",
  luogo: "luogo",
  profezia: "prof.",
  regno: "regno",
  periodo: "periodo",
  guerra: "guerra",
  annotazione: "nota",
};

/** Maps filter UI labels to domain ElementoTipo values. */
const tipoFilterMap: Record<string, ElementoTipo> = {
  Personaggi: "personaggio",
  Eventi: "evento",
  Luoghi: "luogo",
  Profezie: "profezia",
};

function mergeElemento(
  element: Elemento,
  patch?: ElementoSessionPatch,
): Elemento {
  if (!patch) {
    return element;
  }

  return {
    ...element,
    ...patch,
  };
}

function getResolvedElements(): Elemento[] {
  const overrides = workspaceUi$.elementOverrides.peek();
  return ELEMENTI.map((element) => mergeElemento(element, overrides[element.id as string]));
}

function getResolvedElementMap(): Map<string, Elemento> {
  return new Map(getResolvedElements().map((element) => [element.id as string, element]));
}

// ── Date formatting ──

/** Format a DataStorica to a display string like "2018 a.e.v." or "~732 a.e.v." */
function formatDataStorica(d: DataStorica): string {
  const prefix = d.precisione === "circa" ? "~" : "";
  return `${prefix}${d.anno} ${formatHistoricalEra(d.era)}`;
}

/**
 * Extract the primary display date from an Elemento.
 *
 * Priority: nascita → date (puntuale: single date, range: inizio) → undefined
 */
export function formatElementDate(el: Elemento): string | undefined {
  if (el.nascita) {
    return formatDataStorica(el.nascita);
  }
  if (el.date) {
    if (el.date.kind === "puntuale") {
      return formatDataStorica(el.date.data);
    }
    // range — show start date
    return formatDataStorica(el.date.inizio);
  }
  return undefined;
}

// ── Element filtering ──

/**
 * Get the elements for a board based on its selezione criteria.
 * For "fissa" boards: filter ELEMENTI by IDs in the selection.
 * For "dinamica" boards: filter ELEMENTI by tags/tipi.
 */
function getBoardElements(board: Board): Elemento[] {
  const resolvedElements = getResolvedElements();
  const selezione = board.selezione;
  if (selezione.kind === "fissa") {
    const idSet = new Set(selezione.elementiIds);
    return resolvedElements.filter((el) => idSet.has(el.id as string));
  }
  // dinamica
  return resolvedElements.filter((el) => {
    const matchesTag =
      !selezione.tags?.length ||
      el.tags.some((t) => selezione.tags!.includes(t));
    const matchesTipo =
      !selezione.tipi?.length ||
      selezione.tipi.includes(el.tipo);
    return matchesTag || matchesTipo;
  });
}

/**
 * Get filtered elements for a given view, search text, and tipo filter.
 *
 * Replaces the monolith's useCallback-wrapped getElementsForView.
 *
 * @param deletedIds Optional list of soft-deleted element ids (string form
 *   of branded ElementoId). Matching elements are filtered out so they
 *   disappear from the visible list during the toast undo window.
 */
export function getElementsForView(
  viewId: ViewId,
  filterText: string,
  activeTipo: string,
  deletedIds: readonly string[] = [],
): Elemento[] {
  let items: Elemento[];

  switch (viewId) {
    case "recenti":
      // recenti view doesn't show the element list
      return [];

    case "tutti":
      items = getResolvedElements();
      break;

    default: {
      // board-patriarchi → find matching board
      const board = BOARDS.find((b) => {
        if (viewId === "board-patriarchi") return b.nome === "Patriarchi e Giudici";
        if (viewId === "board-profeti") return b.nome === "Profeti di Israele";
        return false;
      });
      items = board ? getBoardElements(board) : [];
      break;
    }
  }

  // Soft-deleted filter — applied first so it composes with text/tipo filters
  if (deletedIds.length > 0) {
    const deletedSet = new Set(deletedIds);
    items = items.filter((el) => !deletedSet.has(el.id as string));
  }

  // Text search filter
  if (filterText) {
    const q = filterText.toLowerCase();
    items = items.filter((el) => el.titolo.toLowerCase().includes(q));
  }

  // Tipo filter
  if (activeTipo !== "Tutti") {
    const mappedTipo = tipoFilterMap[activeTipo];
    if (mappedTipo) {
      items = items.filter((el) => el.tipo === mappedTipo);
    }
  }

  return items;
}

// ── Board display data ──

/** Display-ready board info for the NavSidebar. */
export interface BoardDisplayItem {
  readonly id: string;
  readonly nome: string;
  readonly viewId: ViewId;
  readonly count: number;
}

/** Map a domain Board to a ViewId (used for nav selection). */
function boardToViewId(board: Board): ViewId {
  if (board.nome === "Patriarchi e Giudici") return "board-patriarchi";
  if (board.nome === "Profeti di Israele") return "board-profeti";
  // Fallback for unknown boards — shouldn't happen with current mock data
  return `board-${board.id}` as ViewId;
}

/** Get display-ready board items with viewId and element count. */
export function getBoardDisplayItems(): BoardDisplayItem[] {
  return BOARDS.map((board) => ({
    id: board.id,
    nome: board.nome,
    viewId: boardToViewId(board),
    count: getBoardElements(board).length,
  }));
}

// ── Link resolution ──

/** Resolved link for display — titolo, tipo, targetId and optional ruolo. */
export interface ResolvedLink {
  readonly titolo: string;
  readonly tipo: string;
  readonly targetId: string;
  readonly ruolo?: string;
}

/**
 * Resolve an Elemento's link targetIds to display names.
 * Falls back to the raw targetId if the target isn't found.
 */
export function resolveCollegamenti(el: Elemento): ResolvedLink[] {
  const resolvedMap = getResolvedElementMap();
  return el.link.map((link) => {
    const target = resolvedMap.get(link.targetId) ?? ELEMENTI_MAP.get(link.targetId);
    return {
      titolo: target?.titolo ?? link.targetId,
      tipo: link.tipo,
      targetId: link.targetId,
      ruolo: link.ruolo,
    };
  });
}

// ── Board resolution ──

/**
 * Find which boards contain a given element.
 * Returns board names for display.
 */
export function resolveBoardsForElement(el: Elemento): string[] {
  return BOARDS.filter((board) => {
    const selezione = board.selezione;
    if (selezione.kind === "fissa") {
      return selezione.elementiIds.includes(el.id as string);
    }
    // dinamica
    const matchesTag =
      selezione.tags?.some((t) => el.tags.includes(t)) ?? false;
    const matchesTipo =
      selezione.tipi?.includes(el.tipo) ?? false;
    return matchesTag || matchesTipo;
  }).map((b) => b.nome);
}

// ── Fonti ──

/** Human-readable labels for FonteTipo values shown in the UI. */
export const FONTE_TIPO_LABEL: Record<FonteTipo, string> = {
  scrittura: "Scrittura",
  "articolo-wol": "Articolo WOL",
  pubblicazione: "Pubblicazione",
  link: "Link",
  altro: "Altro",
};

/** FonteTipo values in scope for M001 (video deferred to M004). */
export const FONTE_TIPI_IN_SCOPE: readonly FonteTipo[] = [
  "scrittura",
  "articolo-wol",
  "pubblicazione",
  "link",
  "altro",
];

/**
 * Baseline mock fonti — only Abraamo has fonti seeded in the preview.
 * Keyed by ElementoId string value.
 */
const MOCK_FONTI: ReadonlyMap<string, readonly NormalizedFonte[]> = new Map([
  [
    ELEMENTO_IDS.abraamo as string,
    [
      { tipo: "scrittura", valore: "Genesi 12:1-3" },
      { tipo: "scrittura", valore: "Genesi 15:5-6" },
      { tipo: "scrittura", valore: "Genesi 22:1-18" },
      { tipo: "scrittura", valore: "Ebrei 11:8-10" },
    ] satisfies NormalizedFonte[],
  ],
]);

/**
 * Get fonti for an elemento, applying session overrides over MOCK_FONTI.
 * Returns an empty array if no fonti are registered.
 */
export function getFontiForElement(el: Elemento): readonly NormalizedFonte[] {
  const overrides = workspaceUi$.fontiOverrides.peek();
  const override = overrides[el.id as string];
  if (override !== undefined) return override;
  return MOCK_FONTI.get(el.id as string) ?? [];
}

/**
 * Get fonti for an elemento grouped by FonteTipo.
 * Returns a Map preserving insertion order within each group.
 */
export function getFontiGroupedByTipo(el: Elemento): Map<FonteTipo, readonly NormalizedFonte[]> {
  const fonti = getFontiForElement(el);
  const groups = new Map<FonteTipo, NormalizedFonte[]>();
  for (const fonte of fonti) {
    const existing = groups.get(fonte.tipo);
    if (existing) {
      existing.push(fonte);
    } else {
      groups.set(fonte.tipo, [fonte]);
    }
  }
  return groups;
}

// ── Annotazioni ──

/** Result of annotation lookup for an element. */
export interface AnnotazioniResult {
  readonly mie: readonly Elemento[];
  readonly altreCount: number;
}

/**
 * Get annotations linked to an element, split by authorship.
 *
 * Filters ELEMENTI where tipo === "annotazione" AND at least one
 * link[].targetId matches the given elementId.
 */
export function getAnnotazioniForElement(
  elementId: string,
  currentAutore: string,
): AnnotazioniResult {
  const annotations = getResolvedElements().filter(
    (el) =>
      el.tipo === "annotazione" &&
      el.link.some((l) => l.targetId === elementId),
  );

  const mie = annotations.filter((a) => a.autore === currentAutore);
  const altreCount = annotations.filter((a) => a.autore !== currentAutore).length;

  return { mie, altreCount };
}

// ── Element lookup ──

/**
 * Find an element by ID across all data sources (ELEMENTI).
 * Used by the detail pane to resolve the selected element.
 */
export function findElementById(id: string): Elemento | undefined {
  const overrides = workspaceUi$.elementOverrides.peek();
  const base = ELEMENTI_MAP.get(id);
  return base ? mergeElemento(base, overrides[id]) : undefined;
}
