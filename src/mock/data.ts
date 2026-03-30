/**
 * Mock data module — typed domain data for development and testing.
 *
 * All IDs are branded via safeParse (parse-don't-validate).
 * Biblical data mirrors the existing WorkspacePreviewPage but uses proper domain types.
 */

import type { Elemento, ElementoTipo, ElementoLink } from "@/features/elemento/elemento.model";
import type { Board, SelezioneElementi } from "@/features/board/board.model";
import type { Workspace, TagRegistration } from "@/features/workspace/workspace.model";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";
import {
  parseElementoId,
  parseBoardId,
  parseWorkspaceId,
  parseTag,
  type ElementoId,
  type BoardId,
  type WorkspaceId,
  type Tag,
} from "@/features/shared/newtypes";

// ── Helpers ──

/** Parse a branded ID, throwing on failure (mock data must be valid by construction). */
function eid(v: string): ElementoId {
  const r = parseElementoId(v);
  if (r.isErr()) throw new Error(`Invalid ElementoId: ${v}`);
  return r.value;
}

function bid(v: string): BoardId {
  const r = parseBoardId(v);
  if (r.isErr()) throw new Error(`Invalid BoardId: ${v}`);
  return r.value;
}

function wid(v: string): WorkspaceId {
  const r = parseWorkspaceId(v);
  if (r.isErr()) throw new Error(`Invalid WorkspaceId: ${v}`);
  return r.value;
}

function tag(v: string): Tag {
  const r = parseTag(v);
  if (r.isErr()) throw new Error(`Invalid Tag: ${v}`);
  return r.value;
}

/** Shorthand for DataStorica creation */
function ds(anno: number, era: "aev" | "ev", precisione: "esatta" | "circa" = "esatta"): DataStorica {
  return { anno, era, precisione };
}

/** Shorthand for a puntuale DataTemporale */
function puntuale(anno: number, era: "aev" | "ev", precisione: "esatta" | "circa" = "esatta"): DataTemporale {
  return { kind: "puntuale", data: ds(anno, era, precisione) };
}

/** Shorthand for a range DataTemporale */
function range(
  inizioAnno: number,
  inizioEra: "aev" | "ev",
  fineAnno: number,
  fineEra: "aev" | "ev",
): DataTemporale {
  return {
    kind: "range",
    inizio: ds(inizioAnno, inizioEra),
    fine: ds(fineAnno, fineEra),
  };
}

// ── Element IDs ──

export const ELEMENTO_IDS = {
  abraamo: eid("elem-abraamo"),
  babilonia: eid("elem-babilonia"),
  diluvio: eid("elem-diluvio"),
  esodo: eid("elem-esodo"),
  gerusalemme: eid("elem-gerusalemme"),
  isacco: eid("elem-isacco"),
  monteSinai: eid("elem-monte-sinai"),
  mose: eid("elem-mose"),
  profeziaIsaia53: eid("elem-profezia-isaia-53"),
  regnoDavide: eid("elem-regno-davide"),
  sara: eid("elem-sara"),
  torreBabele: eid("elem-torre-babele"),
  giacobbe: eid("elem-giacobbe"),
  giuseppe: eid("elem-giuseppe"),
  giosue: eid("elem-giosue"),
  gedeone: eid("elem-gedeone"),
} as const;

export const BOARD_IDS = {
  patriarchi: bid("board-patriarchi-giudici"),
  profeti: bid("board-profeti-israele"),
} as const;

export const WORKSPACE_ID = wid("workspace-default");

// ── Tags ──

const TAGS = {
  patriarchi: tag("patriarchi"),
  esilio: tag("esilio"),
  liberazione: tag("liberazione"),
  legge: tag("legge"),
  messianico: tag("messianico"),
} as const;

// ── Elementi ──

function makeLink(
  targetId: ElementoId,
  tipo: ElementoLink["tipo"],
  ruolo?: ElementoLink["ruolo"],
  nota?: string,
): ElementoLink {
  return { targetId: targetId as string, tipo, ruolo, nota };
}

export const ELEMENTI: readonly Elemento[] = [
  {
    id: ELEMENTO_IDS.abraamo,
    titolo: "Abraamo",
    tipo: "personaggio",
    nascita: ds(2018, "aev"),
    morte: ds(1843, "aev"),
    tags: [TAGS.patriarchi as string],
    note: "Patriarca di Israele. Abraamo lasciò Ur dei Caldei per la Terra Promessa. Padre di Isacco attraverso Sara e di Ismaele attraverso Agar. La promessa divina di una discendenza numerosa come le stelle del cielo e la sabbia del mare.",
    link: [
      makeLink(ELEMENTO_IDS.isacco, "parentela", "padre"),
      makeLink(ELEMENTO_IDS.sara, "parentela", "coniuge"),
      makeLink(ELEMENTO_IDS.gerusalemme, "localizzazione"),
    ],
  },
  {
    id: ELEMENTO_IDS.babilonia,
    titolo: "Babilonia",
    tipo: "luogo",
    tags: [TAGS.esilio as string],
    note: "",
    link: [],
  },
  {
    id: ELEMENTO_IDS.diluvio,
    titolo: "Diluvio universale",
    tipo: "evento",
    date: puntuale(2370, "aev"),
    tags: [],
    note: "",
    link: [],
  },
  {
    id: ELEMENTO_IDS.esodo,
    titolo: "Esodo dall'Egitto",
    tipo: "evento",
    date: puntuale(1513, "aev"),
    tags: [TAGS.liberazione as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.mose, "correlato"),
      makeLink(ELEMENTO_IDS.monteSinai, "localizzazione"),
    ],
  },
  {
    id: ELEMENTO_IDS.gerusalemme,
    titolo: "Gerusalemme",
    tipo: "luogo",
    tags: [],
    note: "",
    link: [],
  },
  {
    id: ELEMENTO_IDS.isacco,
    titolo: "Isacco",
    tipo: "personaggio",
    nascita: ds(1918, "aev"),
    morte: ds(1738, "aev"),
    tags: [TAGS.patriarchi as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.abraamo, "parentela", "figlio"),
      makeLink(ELEMENTO_IDS.sara, "parentela", "figlio"),
      makeLink(ELEMENTO_IDS.giacobbe, "parentela", "padre"),
    ],
  },
  {
    id: ELEMENTO_IDS.monteSinai,
    titolo: "Monte Sinai",
    tipo: "luogo",
    tags: [TAGS.legge as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.esodo, "localizzazione"),
    ],
  },
  {
    id: ELEMENTO_IDS.mose,
    titolo: "Mosè",
    tipo: "personaggio",
    nascita: ds(1593, "aev"),
    morte: ds(1473, "aev"),
    tags: [TAGS.legge as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.esodo, "correlato"),
      makeLink(ELEMENTO_IDS.monteSinai, "localizzazione"),
    ],
  },
  {
    id: ELEMENTO_IDS.profeziaIsaia53,
    titolo: "Profezia Isaia 53",
    tipo: "profezia",
    date: puntuale(732, "aev", "circa"),
    tags: [TAGS.messianico as string],
    note: "",
    link: [],
  },
  {
    id: ELEMENTO_IDS.regnoDavide,
    titolo: "Regno di Davide",
    tipo: "regno",
    date: range(1077, "aev", 1037, "aev"),
    tags: [],
    note: "",
    link: [],
  },
  {
    id: ELEMENTO_IDS.sara,
    titolo: "Sara",
    tipo: "personaggio",
    nascita: ds(1919, "aev"),
    morte: ds(1881, "aev"),
    tags: [TAGS.patriarchi as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.abraamo, "parentela", "coniuge"),
      makeLink(ELEMENTO_IDS.isacco, "parentela", "madre"),
    ],
  },
  {
    id: ELEMENTO_IDS.torreBabele,
    titolo: "Torre di Babele",
    tipo: "evento",
    date: puntuale(2269, "aev", "circa"),
    tags: [],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.babilonia, "localizzazione"),
    ],
  },
  // Additional elementi for board coverage
  {
    id: ELEMENTO_IDS.giacobbe,
    titolo: "Giacobbe",
    tipo: "personaggio",
    nascita: ds(1858, "aev"),
    morte: ds(1711, "aev"),
    tags: [TAGS.patriarchi as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.isacco, "parentela", "figlio"),
      makeLink(ELEMENTO_IDS.giuseppe, "parentela", "padre"),
    ],
  },
  {
    id: ELEMENTO_IDS.giuseppe,
    titolo: "Giuseppe",
    tipo: "personaggio",
    nascita: ds(1767, "aev"),
    morte: ds(1657, "aev"),
    tags: [TAGS.patriarchi as string],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.giacobbe, "parentela", "figlio"),
    ],
  },
  {
    id: ELEMENTO_IDS.giosue,
    titolo: "Giosuè",
    tipo: "personaggio",
    nascita: ds(1543, "aev", "circa"),
    tags: [],
    note: "",
    link: [
      makeLink(ELEMENTO_IDS.mose, "successione"),
    ],
  },
  {
    id: ELEMENTO_IDS.gedeone,
    titolo: "Gedeone",
    tipo: "personaggio",
    date: puntuale(1210, "aev", "circa"),
    tags: [],
    note: "",
    link: [],
  },
];

// ── Boards ──

export const BOARDS: readonly Board[] = [
  {
    id: BOARD_IDS.patriarchi as string,
    nome: "Patriarchi e Giudici",
    selezione: {
      kind: "fissa",
      elementiIds: [
        ELEMENTO_IDS.abraamo,
        ELEMENTO_IDS.isacco,
        ELEMENTO_IDS.giacobbe,
        ELEMENTO_IDS.giuseppe,
        ELEMENTO_IDS.mose,
        ELEMENTO_IDS.giosue,
        ELEMENTO_IDS.gedeone,
      ] as string[],
    } satisfies SelezioneElementi,
    ultimaVista: "lista",
  },
  {
    id: BOARD_IDS.profeti as string,
    nome: "Profeti di Israele",
    selezione: {
      kind: "dinamica",
      tags: [TAGS.messianico as string],
      tipi: ["profezia" as const],
    } satisfies SelezioneElementi,
    ultimaVista: "timeline",
  },
];

// ── Tag registry ──

const TAG_REGISTRY: readonly TagRegistration[] = [
  { tag: TAGS.patriarchi as string, colore: "#0d9488" },
  { tag: TAGS.esilio as string, colore: "#dc2626" },
  { tag: TAGS.liberazione as string, colore: "#16a34a" },
  { tag: TAGS.legge as string, colore: "#7c3aed" },
  { tag: TAGS.messianico as string, colore: "#d97706" },
];

// ── Workspace ──

export const WORKSPACE: Workspace = {
  id: WORKSPACE_ID,
  nome: "Il mio workspace",
  descrizione: "Workspace di studio biblico personale",
  boardIds: [BOARD_IDS.patriarchi, BOARD_IDS.profeti],
  tagRegistry: TAG_REGISTRY,
  createdAt: "2025-01-15T10:00:00.000Z",
};

/** Empty workspace variant for testing empty state UI */
export const EMPTY_WORKSPACE: Workspace = {
  id: wid("workspace-empty"),
  nome: "Il mio workspace",
  boardIds: [],
  tagRegistry: [],
  createdAt: "2025-06-01T10:00:00.000Z",
};

// ── Recenti (max 8) ──

export interface Recente {
  readonly id: string;
  readonly titolo: string;
  readonly tipo: "elemento" | "board";
  readonly elementoTipo?: ElementoTipo;
  readonly tempo: string;
}

export const RECENTI: readonly Recente[] = [
  { id: ELEMENTO_IDS.abraamo as string, titolo: "Abraamo", tipo: "elemento", elementoTipo: "personaggio", tempo: "5 min fa" },
  { id: BOARD_IDS.patriarchi as string, titolo: "Patriarchi e Giudici", tipo: "board", tempo: "12 min fa" },
  { id: ELEMENTO_IDS.esodo as string, titolo: "Esodo dall'Egitto", tipo: "elemento", elementoTipo: "evento", tempo: "1h fa" },
  { id: ELEMENTO_IDS.profeziaIsaia53 as string, titolo: "Profezia Isaia 53", tipo: "elemento", elementoTipo: "profezia", tempo: "ieri" },
  { id: ELEMENTO_IDS.isacco as string, titolo: "Isacco", tipo: "elemento", elementoTipo: "personaggio", tempo: "ieri" },
  { id: ELEMENTO_IDS.monteSinai as string, titolo: "Monte Sinai", tipo: "elemento", elementoTipo: "luogo", tempo: "2 gg fa" },
  { id: ELEMENTO_IDS.sara as string, titolo: "Sara", tipo: "elemento", elementoTipo: "personaggio", tempo: "3 gg fa" },
  { id: BOARD_IDS.profeti as string, titolo: "Profeti di Israele", tipo: "board", tempo: "4 gg fa" },
];

// ── Helper re-exports for convenience ──

/** All DataStorica values in the mock data, for validation testing */
export function getAllDataStoriche(): DataStorica[] {
  const result: DataStorica[] = [];
  for (const el of ELEMENTI) {
    if (el.nascita) result.push(el.nascita);
    if (el.morte) result.push(el.morte);
    if (el.date) {
      if (el.date.kind === "puntuale") {
        result.push(el.date.data);
      } else {
        result.push(el.date.inizio);
        result.push(el.date.fine);
      }
    }
  }
  return result;
}

/** Lookup map: ElementoId → Elemento */
export const ELEMENTI_MAP: ReadonlyMap<string, Elemento> = new Map(
  ELEMENTI.map((el) => [el.id as string, el]),
);
