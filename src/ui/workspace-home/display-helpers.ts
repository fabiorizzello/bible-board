/**
 * Display helpers — bridge between Jazz-backed domain objects and UI components.
 *
 * Functions here adapt Elemento (branded IDs, DataStorica, ElementoLink)
 * to the display shapes the UI needs (formatted dates, resolved names, etc.).
 *
 * Element data is read from the Jazz-backed store (syncJazzState feeds it on
 * every WorkspacePreviewPage render). Boards still use mock data pending S04.
 */

import type { Elemento, ElementoTipo } from "@/features/elemento/elemento.model";
import type { Board } from "@/features/board/board.model";
import { formatHistoricalEra } from "@/features/shared/value-objects";
import type { DataStorica } from "@/features/shared/value-objects";
import type { NormalizedFonte, FonteTipo } from "@/features/elemento/elemento.rules";
import type { ViewId } from "./workspace-ui-store";
import { getJazzElementi, getJazzFontiForElement, getJazzBoards } from "./workspace-ui-store";

export type { NormalizedFonte, FonteTipo };

// Re-export ViewId for convenience — single import point for UI modules
export type { ViewId };

// ── Constants ──

/** Simulated current user identity (session). */
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

function getResolvedElements(): readonly Elemento[] {
  return getJazzElementi();
}

function getResolvedElementMap(): Map<string, Elemento> {
  return new Map(getJazzElementi().map((el) => [el.id as string, el]));
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
 */
function getBoardElements(board: Board): Elemento[] {
  const resolvedElements = getResolvedElements();
  const selezione = board.selezione;
  if (selezione.kind === "fissa") {
    const idSet = new Set(selezione.elementiIds);
    return [...resolvedElements].filter((el) => idSet.has(el.id as string));
  }
  // dinamica
  return [...resolvedElements].filter((el) => {
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
 * @param deletedIds Optional IDs to additionally filter out (for compatibility;
 *   Jazz-deleted elements are already excluded from the store via deletedAt flag).
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
      // recenti view uses a separate recent-items display, not this filter
      return [];

    case "tutti":
      items = [...getResolvedElements()];
      break;

    default: {
      const boardId = viewId.replace(/^board-/, "");
      const board = getJazzBoards().find((b) => b.id === boardId);
      items = board ? getBoardElements(board) : [];
      break;
    }
  }

  // Extra deleted-IDs filter (no-op when Jazz handles deletion via deletedAt)
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

/** Get display-ready board items with viewId and element count. */
export function getBoardDisplayItems(): BoardDisplayItem[] {
  return getJazzBoards().map((board) => ({
    id: board.id,
    nome: board.nome,
    viewId: `board-${board.id}` as ViewId,
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
    const target = resolvedMap.get(link.targetId);
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
  return getJazzBoards()
    .filter((board) => {
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
    })
    .map((b) => b.nome);
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
 * Get fonti for an elemento from the Jazz-backed store.
 * Returns an empty array if no fonti are registered.
 */
export function getFontiForElement(el: Elemento): readonly NormalizedFonte[] {
  return getJazzFontiForElement(el.id as string);
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
 */
export function getAnnotazioniForElement(
  elementId: string,
  currentAutore: string,
): AnnotazioniResult {
  const annotations = [...getResolvedElements()].filter(
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
 * Find an element by ID in the Jazz-backed store.
 */
export function findElementById(id: string): Elemento | undefined {
  return getJazzElementi().find((el) => (el.id as string) === id);
}
