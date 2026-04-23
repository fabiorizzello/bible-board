import { describe, it, expect } from "vitest";
import {
  coMapToElementoDomain,
  deserializeDataTemporale
} from "@/features/elemento/elemento.adapter";

// ---------------------------------------------------------------------------
// Fixtures — plain objects that mimic Jazz CoMap shape for testing
// ---------------------------------------------------------------------------

function makeElementoCoMap(overrides: Record<string, unknown> = {}) {
  return {
    id: "co:test123",
    titolo: "Abraamo",
    descrizione: "Patriarca di Israele",
    tipo: "personaggio",
    tags: ["patriarca", "fede"],
    links: [],
    fonti: [],
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// coMapToElementoDomain
// ---------------------------------------------------------------------------

describe("coMapToElementoDomain — happy path", () => {
  it("converts a minimal CoMap to a domain Elemento", () => {
    const result = coMapToElementoDomain(makeElementoCoMap());
    expect(result).not.toBeNull();
    expect(result!.titolo).toBe("Abraamo");
    expect(result!.tipo).toBe("personaggio");
    expect(result!.descrizione).toBe("Patriarca di Israele");
    expect(result!.tags).toEqual(["patriarca", "fede"]);
    expect(result!.link).toEqual([]);
  });

  it("maps tipo-specific fields for personaggio", () => {
    const coMap = makeElementoCoMap({ tribu: "levi", ruoliStr: "patriarca,profeta" });
    const result = coMapToElementoDomain(coMap);
    expect(result).not.toBeNull();
    expect(result!.tribu).toBe("levi");
    expect(result!.ruoli).toEqual(["patriarca", "profeta"]);
  });

  it("returns undefined ruoli when ruoliStr is absent", () => {
    const result = coMapToElementoDomain(makeElementoCoMap());
    expect(result!.ruoli).toBeUndefined();
  });

  it("maps guerra tipo-specific fields", () => {
    const coMap = makeElementoCoMap({
      tipo: "guerra",
      fazioni: "Israele vs Filistei",
      esito: "Vittoria"
    });
    const result = coMapToElementoDomain(coMap);
    expect(result).not.toBeNull();
    expect(result!.fazioni).toBe("Israele vs Filistei");
    expect(result!.esito).toBe("Vittoria");
  });

  it("maps links with tipo and ruolo", () => {
    const coMap = makeElementoCoMap({
      links: [
        { targetId: "co:target1", tipo: "parentela", ruolo: "figlio" }
      ]
    });
    const result = coMapToElementoDomain(coMap);
    expect(result).not.toBeNull();
    expect(result!.link).toHaveLength(1);
    expect(result!.link[0].targetId).toBe("co:target1");
    expect(result!.link[0].tipo).toBe("parentela");
    expect(result!.link[0].ruolo).toBe("figlio");
  });

  it("filters null entries from links list", () => {
    const coMap = makeElementoCoMap({
      links: [null, { targetId: "co:target1", tipo: "correlato" }, null]
    });
    const result = coMapToElementoDomain(coMap);
    expect(result!.link).toHaveLength(1);
  });
});

describe("coMapToElementoDomain — invalid input", () => {
  it("returns null for missing or empty id and emits console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = coMapToElementoDomain({ ...makeElementoCoMap(), id: "" });
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("invalid ElementoId"),
      ""
    );
    warnSpy.mockRestore();
  });

  it("returns null for unknown tipo", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = coMapToElementoDomain(makeElementoCoMap({ tipo: "unknown_type" }));
    expect(result).toBeNull();
    warnSpy.mockRestore();
  });

  it("returns null for null input", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = coMapToElementoDomain(null);
    expect(result).toBeNull();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// deserializeDataTemporale
// ---------------------------------------------------------------------------

describe("deserializeDataTemporale", () => {
  it("deserializes a puntuale date", () => {
    const coMap = {
      dateKind: "puntuale",
      data: { anno: 2370, era: "aev", precisione: "esatta" }
    };
    const result = deserializeDataTemporale(coMap);
    expect(result?.kind).toBe("puntuale");
    if (result?.kind === "puntuale") {
      expect(result.data.anno).toBe(2370);
      expect(result.data.era).toBe("aev");
    }
  });

  it("deserializes a range date", () => {
    const coMap = {
      dateKind: "range",
      inizio: { anno: 1010, era: "aev", precisione: "esatta" },
      fine: { anno: 970, era: "aev", precisione: "esatta" }
    };
    const result = deserializeDataTemporale(coMap);
    expect(result?.kind).toBe("range");
  });

  it("returns undefined when dateKind is absent", () => {
    expect(deserializeDataTemporale({})).toBeUndefined();
    expect(deserializeDataTemporale(undefined)).toBeUndefined();
  });

  it("returns undefined when puntuale data is missing", () => {
    expect(deserializeDataTemporale({ dateKind: "puntuale" })).toBeUndefined();
  });
});
