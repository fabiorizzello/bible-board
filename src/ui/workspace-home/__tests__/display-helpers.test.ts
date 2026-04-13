import { describe, it, expect } from "vitest";
import {
  TIPO_FILTERS,
  TIPO_ABBREV,
  formatElementDate,
  getElementsForView,
  resolveCollegamenti,
  resolveBoardsForElement,
  MOCK_FONTI,
  getFontiForElement,
  findElementById,
  getAnnotazioniForElement,
  CURRENT_AUTORE,
} from "../display-helpers";
import { ELEMENTI, ELEMENTO_IDS } from "@/mock/data";

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
    const result = getElementsForView("board-patriarchi", "", "Tutti");
    expect(result.length).toBe(7); // Fixed selection: 7 elements
    expect(result.map((e) => e.titolo)).toContain("Abraamo");
    expect(result.map((e) => e.titolo)).toContain("Giosuè");
  });

  it("returns board elements for board-profeti via dynamic selection", () => {
    const result = getElementsForView("board-profeti", "", "Tutti");
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
    expect(result.every((e) => e.titolo.toLowerCase().includes("isa"))).toBe(true);
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
    // "abr" + Personaggi matches only Abraamo. Deleting Abraamo leaves zero
    // results, proving the soft-delete filter composes with the others.
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
    const baseline = getElementsForView("board-patriarchi", "", "Tutti");
    const result = getElementsForView(
      "board-patriarchi",
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

describe("MOCK_FONTI", () => {
  it("has fonti for Abraamo", () => {
    const fonti = MOCK_FONTI.get(ELEMENTO_IDS.abraamo as string);
    expect(fonti).toBeDefined();
    expect(fonti!.length).toBe(4);
    expect(fonti).toContain("Genesi 12:1-3");
  });
});

describe("getFontiForElement", () => {
  it("returns fonti for Abraamo", () => {
    const abraamo = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.abraamo as string))!;
    const fonti = getFontiForElement(abraamo);
    expect(fonti.length).toBe(4);
    expect(fonti).toContain("Ebrei 11:8-10");
  });

  it("returns empty array for element without fonti", () => {
    const isacco = ELEMENTI.find((e) => e.id === (ELEMENTO_IDS.isacco as string))!;
    expect(getFontiForElement(isacco)).toEqual([]);
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
