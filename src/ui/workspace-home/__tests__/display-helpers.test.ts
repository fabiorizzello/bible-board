import { beforeEach, describe, expect, it } from "vitest";
import {
  TIPO_FILTERS,
  TIPO_ABBREV,
  formatElementDate,
  getElementsForView,
  sortElementi,
  isElementMatchingSearch,
  resolveCollegamenti,
  resolveBoardsForElement,
  getFontiForElement,
  getFontiGroupedByTipo,
  findElementById,
  getAnnotazioniForElement,
  CURRENT_AUTORE,
} from "../display-helpers";
import { ELEMENTI, ELEMENTO_IDS, BOARDS, BOARD_IDS } from "@/mock/data";
import {
  resetWorkspaceUiState,
  syncJazzElementiForTest,
  syncJazzBoardsForTest,
} from "../workspace-ui-store";
import type { Board } from "@/features/board/board.model";
import type { NormalizedFonte } from "../display-helpers";
import type { Elemento } from "@/features/elemento/elemento.model";

const MOCK_TEST_FONTI: ReadonlyMap<string, readonly NormalizedFonte[]> = new Map([
  [
    ELEMENTO_IDS.abraamo as string,
    [
      { tipo: "scrittura", valore: "Genesi 12:1-3" },
      { tipo: "scrittura", valore: "Genesi 15:1-6" },
      { tipo: "scrittura", valore: "Genesi 22:1-18" },
      { tipo: "scrittura", valore: "Ebrei 11:8-10" },
    ],
  ],
]);

beforeEach(() => {
  resetWorkspaceUiState();
  syncJazzElementiForTest(ELEMENTI as unknown as Elemento[], MOCK_TEST_FONTI);
  syncJazzBoardsForTest(BOARDS as unknown as Board[]);
});

// ── Constants ──

describe("TIPO_FILTERS", () => {
  it("has 5 filter labels starting with Tutti", () => {
    expect(TIPO_FILTERS).toHaveLength(5);
    expect(TIPO_FILTERS[0]).toBe("Tutti");
  });

  it("includes all expected labels", () => {
    expect(TIPO_FILTERS).toContain("Personaggi");
    expect(TIPO_FILTERS).toContain("Eventi");
    expect(TIPO_FILTERS).toContain("Luoghi");
    expect(TIPO_FILTERS).toContain("Profezie");
  });
});

describe("TIPO_ABBREV", () => {
  it("maps all ElementoTipo values to abbreviations", () => {
    expect(TIPO_ABBREV["personaggio"]).toBe("pers.");
    expect(TIPO_ABBREV["evento"]).toBe("evento");
    expect(TIPO_ABBREV["luogo"]).toBe("luogo");
    expect(TIPO_ABBREV["profezia"]).toBe("prof.");
    expect(TIPO_ABBREV["annotazione"]).toBe("nota");
  });
});

// ── Date formatting ──

describe("formatElementDate", () => {
  it("formats nascita date for personaggio (Abraamo: 2018 a.e.v.)", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    expect(formatElementDate(abraamo)).toBe("2018 a.e.v.");
  });

  it("formats puntuale date for evento (Diluvio: 2370 a.e.v.)", () => {
    const diluvio = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.diluvio as string))!;
    expect(formatElementDate(diluvio)).toBe("2370 a.e.v.");
  });

  it("formats circa date with ~ prefix (Profezia Isaia 53: ~732 a.e.v.)", () => {
    const profezia = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.profeziaIsaia53 as string))!;
    expect(formatElementDate(profezia)).toBe("~732 a.e.v.");
  });

  it("formats range date using start (Regno di Davide: 1077 a.e.v.)", () => {
    const regno = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.regnoDavide as string))!;
    expect(formatElementDate(regno)).toBe("1077 a.e.v.");
  });

  it("returns undefined for element without any date (Babilonia)", () => {
    const babilonia = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.babilonia as string))!;
    expect(formatElementDate(babilonia)).toBeUndefined();
  });

  it("prefers nascita over date for personaggi (Isacco has both nascita)", () => {
    const isacco = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.isacco as string))!;
    expect(formatElementDate(isacco)).toBe("1918 a.e.v.");
  });
});

// ── Element filtering ──

describe("getElementsForView", () => {
  it('returns empty array for "recenti" view', () => {
    expect(getElementsForView("recenti", "", "Tutti")).toEqual([]);
  });

  it('returns all ELEMENTI for "tutti" view with no filters', () => {
    const result = getElementsForView("tutti", "", "Tutti");
    expect(result.length).toBe(ELEMENTI.length);
  });

  it("returns board elements for board-patriarchi", () => {
    const result = getElementsForView(`board-${BOARD_IDS.patriarchi as string}`, "", "Tutti");
    expect(result.length).toBe(7); // Fixed selection: 7 elements
    expect(result.map((e) => e.titolo)).toContain("Abraamo");
    expect(result.map((e) => e.titolo)).toContain("Giosuè");
  });

  it("returns board elements for board-profeti via dynamic selection", () => {
    const result = getElementsForView(`board-${BOARD_IDS.profeti as string}`, "", "Tutti");
    expect(result.length).toBeGreaterThan(0);
    // Should include Profezia Isaia 53 (tag messianico + tipo profezia)
    expect(result.map((e) => e.titolo)).toContain("Profezia Isaia 53");
  });

  it("filters by text search (case-insensitive)", () => {
    const result = getElementsForView("tutti", "abr", "Tutti");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.titolo).toBe("Abraamo");
  });

  it("filters by tipo", () => {
    const result = getElementsForView("tutti", "", "Personaggi");
    expect(result.every((e) => e.tipo === "personaggio")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("combines text and tipo filters", () => {
    const result = getElementsForView("tutti", "isa", "Personaggi");
    expect(result.every((e) => e.tipo === "personaggio")).toBe(true);
    // Search now covers titolo + descrizione + tags, so all results must match in at least one
    expect(result.every((e) => isElementMatchingSearch(e, "isa"))).toBe(true);
  });

  it("returns empty when filters match nothing", () => {
    const result = getElementsForView("tutti", "zzzznonexistent", "Tutti");
    expect(result).toEqual([]);
  });

  it("filters out soft-deleted elements by id", () => {
    const baseline = getElementsForView("tutti", "", "Tutti");
    const deletedIds = [ELEMENTO_IDS.abraamo as string];
    const result = getElementsForView("tutti", "", "Tutti", deletedIds);
    expect(result.length).toBe(baseline.length - 1);
    expect(result.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))).toBeUndefined();
  });

  it("filters out multiple soft-deleted elements", () => {
    const baseline = getElementsForView("tutti", "", "Tutti");
    const deletedIds = [
      ELEMENTO_IDS.abraamo as string,
      ELEMENTO_IDS.isacco as string,
    ];
    const result = getElementsForView("tutti", "", "Tutti", deletedIds);
    expect(result.length).toBe(baseline.length - 2);
    expect(result.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))).toBeUndefined();
    expect(result.find((e) => e.id === (ELEMENTO_IDS.isacco as string))).toBeUndefined();
  });

  it("ignores deletedIds entries that match no element", () => {
    const baseline = getElementsForView("tutti", "", "Tutti");
    const result = getElementsForView("tutti", "", "Tutti", ["nonexistent-id"]);
    expect(result.length).toBe(baseline.length);
  });

  it("composes deletedIds with text + tipo filters", () => {
    const baseline = getElementsForView("tutti", "abr", "Personaggi");
    expect(baseline.map((e) => e.id)).toContain(ELEMENTO_IDS.abraamo as string);

    const result = getElementsForView(
      "tutti",
      "abr",
      "Personaggi",
      [ELEMENTO_IDS.abraamo as string],
    );
    expect(result.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))).toBeUndefined();
    expect(result.every((e) => e.tipo === "personaggio")).toBe(true);
    expect(result.every((e) => e.titolo.toLowerCase().includes("abr"))).toBe(true);
  });

  it("filters soft-deleted elements from board views", () => {
    const patriarchiViewId = `board-${BOARD_IDS.patriarchi as string}`;
    const baseline = getElementsForView(patriarchiViewId, "", "Tutti");
    const result = getElementsForView(
      patriarchiViewId,
      "",
      "Tutti",
      [ELEMENTO_IDS.abraamo as string],
    );
    expect(result.length).toBe(baseline.length - 1);
    expect(result.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))).toBeUndefined();
  });

  it("treats omitted deletedIds as empty (no filtering)", () => {
    const withoutArg = getElementsForView("tutti", "", "Tutti");
    const withEmpty = getElementsForView("tutti", "", "Tutti", []);
    expect(withoutArg.length).toBe(withEmpty.length);
  });
});

// ── Link resolution ──

describe("resolveCollegamenti", () => {
  it("resolves Abraamo's links to display names", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const links = resolveCollegamenti(abraamo);
    expect(links.length).toBe(3); // isacco, sara, gerusalemme
    expect(links.map((l) => l.titolo)).toContain("Isacco");
    expect(links.map((l) => l.titolo)).toContain("Sara");
    expect(links.map((l) => l.titolo)).toContain("Gerusalemme");
  });

  it("includes link tipo", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const links = resolveCollegamenti(abraamo);
    const isaccoLink = links.find((l) => l.titolo === "Isacco");
    expect(isaccoLink?.tipo).toBe("parentela");
  });

  it("returns empty array for element with no links", () => {
    const gerusalemme = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.gerusalemme as string))!;
    expect(resolveCollegamenti(gerusalemme)).toEqual([]);
  });
});

// ── Board resolution ──

describe("resolveBoardsForElement", () => {
  it("finds boards containing Abraamo", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const boards = resolveBoardsForElement(abraamo);
    expect(boards).toContain("Patriarchi e Giudici");
  });

  it("finds boards for Profezia Isaia 53 (dynamic selection)", () => {
    const profezia = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.profeziaIsaia53 as string))!;
    const boards = resolveBoardsForElement(profezia);
    expect(boards).toContain("Profeti di Israele");
  });

  it("returns empty for element in no board (Babilonia)", () => {
    const babilonia = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.babilonia as string))!;
    const boards = resolveBoardsForElement(babilonia);
    expect(boards).toEqual([]);
  });
});

// ── Fonti ──

describe("getFontiForElement", () => {
  it("returns typed NormalizedFonte list for Abraamo (4 scrittura fonti seeded)", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const fonti = getFontiForElement(abraamo);
    expect(fonti.length).toBe(4);
    expect(fonti.every((f) => f.tipo === "scrittura")).toBe(true);
    expect(fonti.some((f) => f.valore === "Ebrei 11:8-10")).toBe(true);
  });

  it("returns empty array for element without fonti", () => {
    const isacco = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.isacco as string))!;
    expect(getFontiForElement(isacco)).toEqual([]);
  });
});

describe("getFontiGroupedByTipo", () => {
  it("groups Abraamo fonti under scrittura key", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const grouped = getFontiGroupedByTipo(abraamo);
    expect(grouped.has("scrittura")).toBe(true);
    expect(grouped.get("scrittura")!.length).toBe(4);
    expect(grouped.get("scrittura")!.some((f) => f.valore === "Genesi 12:1-3")).toBe(true);
  });

  it("returns empty Map for element without fonti", () => {
    const isacco = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.isacco as string))!;
    expect(getFontiGroupedByTipo(isacco).size).toBe(0);
  });
});

// ── Annotazioni ──

describe("CURRENT_AUTORE", () => {
  it("is the mock current user identity", () => {
    expect(CURRENT_AUTORE).toBe("utente-corrente");
  });
});

describe("getAnnotazioniForElement", () => {
  it("returns 1 mia annotazione for Abraamo (utente-corrente)", () => {
    const result = getAnnotazioniForElement(ELEMENTO_IDS.abraamo as string, CURRENT_AUTORE);
    expect(result.mie).toHaveLength(1);
    expect(result.mie[0]!.titolo).toBe("Riflessione sulla fede di Abraamo");
    expect(result.altreCount).toBe(0);
  });

  it("returns 0 mie and 1 altra for Esodo (annotazione by utente-altro)", () => {
    const result = getAnnotazioniForElement(ELEMENTO_IDS.esodo as string, CURRENT_AUTORE);
    expect(result.mie).toHaveLength(0);
    expect(result.altreCount).toBe(1);
  });

  it("returns 1 mia annotazione for profeziaIsaia53 (utente-corrente)", () => {
    const result = getAnnotazioniForElement(ELEMENTO_IDS.profeziaIsaia53 as string, CURRENT_AUTORE);
    expect(result.mie).toHaveLength(1);
    expect(result.mie[0]!.titolo).toBe("Adempimento messianico di Isaia 53");
    expect(result.altreCount).toBe(0);
  });

  it("returns 0 mie and 0 altre for Isacco (no annotations linked)", () => {
    const result = getAnnotazioniForElement(ELEMENTO_IDS.isacco as string, CURRENT_AUTORE);
    expect(result.mie).toHaveLength(0);
    expect(result.altreCount).toBe(0);
  });
});

// ── Element lookup ──

describe("findElementById", () => {
  it("finds Abraamo by ID", () => {
    const result = findElementById(ELEMENTO_IDS.abraamo as string);
    expect(result).toBeDefined();
    expect(result!.titolo).toBe("Abraamo");
  });

  it("returns undefined for nonexistent ID", () => {
    expect(findElementById("nonexistent-id")).toBeUndefined();
  });
});

// ── Search matching ──

describe("isElementMatchingSearch", () => {
  const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
  const babilonia = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.babilonia as string))!;

  it("returns true for empty query (always match)", () => {
    expect(isElementMatchingSearch(abraamo, "")).toBe(true);
    expect(isElementMatchingSearch(babilonia, "")).toBe(true);
  });

  it("matches on titolo (case-insensitive)", () => {
    expect(isElementMatchingSearch(abraamo, "abr")).toBe(true);
    expect(isElementMatchingSearch(abraamo, "ABR")).toBe(true);
    expect(isElementMatchingSearch(babilonia, "abr")).toBe(false);
  });

  it("matches on descrizione", () => {
    // Abraamo has descrizione containing 'Patriarca'
    expect(isElementMatchingSearch(abraamo, "patriarca")).toBe(true);
    // Babilonia has empty descrizione
    expect(isElementMatchingSearch(babilonia, "patriarca")).toBe(false);
  });

  it("matches on tags", () => {
    // Abraamo has tag 'patriarchi'
    expect(isElementMatchingSearch(abraamo, "patriarchi")).toBe(true);
    // Babilonia has tag 'esilio'
    expect(isElementMatchingSearch(babilonia, "esilio")).toBe(true);
    expect(isElementMatchingSearch(abraamo, "esilio")).toBe(false);
  });

  it("returns false when nothing matches", () => {
    expect(isElementMatchingSearch(abraamo, "zzznomatch")).toBe(false);
  });
});

describe("getElementsForView - search covers descrizione and tags", () => {
  it("finds Abraamo via tag 'patriarchi'", () => {
    const result = getElementsForView("tutti", "patriarchi", "Tutti");
    expect(result.map((e) => e.titolo)).toContain("Abraamo");
  });

  it("finds Abraamo via descrizione keyword 'ur dei caldei'", () => {
    const result = getElementsForView("tutti", "ur dei caldei", "Tutti");
    expect(result.map((e) => e.titolo)).toContain("Abraamo");
  });

  it("excludes elements that don't match descrizione/tags/titolo", () => {
    const result = getElementsForView("tutti", "zzznomatch", "Tutti");
    expect(result).toHaveLength(0);
  });
});

// ── Sort helpers ──

describe("sortElementi", () => {
  it("sorts ascending by titolo", () => {
    const elementi = getElementsForView("tutti", "", "Tutti");
    const sorted = sortElementi(elementi, "titolo", "asc");
    for (let i = 1; i < sorted.length; i++) {
      expect(
        sorted[i - 1]!.titolo.toLowerCase() <= sorted[i]!.titolo.toLowerCase()
      ).toBe(true);
    }
  });

  it("sorts descending by titolo (reverses order)", () => {
    const elementi = getElementsForView("tutti", "", "Tutti");
    const asc = sortElementi(elementi, "titolo", "asc");
    const desc = sortElementi(elementi, "titolo", "desc");
    expect(desc[0]!.titolo).toBe(asc[asc.length - 1]!.titolo);
  });

  it("sorts ascending by tipo groups same-tipo elements together", () => {
    const elementi = getElementsForView("tutti", "", "Tutti");
    const sorted = sortElementi(elementi, "tipo", "asc");
    // Collect types in order — they should be monotonically non-decreasing alphabetically
    const types = sorted.map((e) => e.tipo);
    for (let i = 1; i < types.length; i++) {
      expect(types[i - 1]!.localeCompare(types[i]!)).toBeLessThanOrEqual(0);
    }
  });

  it("sorts ascending by data puts BC dates first (earliest first)", () => {
    const boardElementi = getElementsForView(`board-${BOARD_IDS.patriarchi as string}`, "", "Tutti");
    const sorted = sortElementi(boardElementi, "data", "asc");
    // Abraamo 2018 aev should come before Isacco 1918 aev (larger BC year = older)
    const abraamoIdx = sorted.findIndex((e) => e.titolo === "Abraamo");
    const isaccoIdx = sorted.findIndex((e) => e.titolo === "Isacco");
    expect(abraamoIdx).toBeLessThan(isaccoIdx);
  });

  it("sorts descending by data puts newest first", () => {
    const boardElementi = getElementsForView(`board-${BOARD_IDS.patriarchi as string}`, "", "Tutti");
    const asc = sortElementi(boardElementi, "data", "asc");
    const desc = sortElementi(boardElementi, "data", "desc");
    // First element of desc should be last of asc (excluding undated)
    const ascDated = asc.filter((e) => e.nascita || e.date);
    const descDated = desc.filter((e) => e.nascita || e.date);
    expect(ascDated[0]!.titolo).toBe(descDated[descDated.length - 1]!.titolo);
  });

  it("does not mutate input array", () => {
    const elementi = getElementsForView("tutti", "", "Tutti");
    const originalOrder = elementi.map((e) => e.titolo);
    sortElementi(elementi, "titolo", "asc");
    expect(elementi.map((e) => e.titolo)).toEqual(originalOrder);
  });

  it("elements without dates are sorted last in ascending order", () => {
    const elementi = getElementsForView("tutti", "", "Tutti");
    const sorted = sortElementi(elementi, "data", "asc");
    const undated = sorted.filter((e) => !e.nascita && !e.date);
    const dated = sorted.filter((e) => e.nascita || e.date);
    if (undated.length > 0 && dated.length > 0) {
      const lastDatedIdx = sorted.lastIndexOf(dated[dated.length - 1]!);
      const firstUndatedIdx = sorted.indexOf(undated[0]!);
      expect(firstUndatedIdx).toBeGreaterThan(lastDatedIdx);
    }
  });
});
