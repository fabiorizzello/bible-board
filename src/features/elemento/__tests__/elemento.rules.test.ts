import { describe, it, expect } from "vitest";
import { normalizeElementoInput } from "@/features/elemento/elemento.rules";
import type { DataStorica } from "@/features/shared/value-objects";

const DS = (anno: number, era: "aev" | "ev" = "aev"): DataStorica => ({
  anno,
  era,
  precisione: "esatta",
});

describe("normalizeElementoInput — shared validation", () => {
  it("rejects empty titolo with titolo_vuoto", () => {
    const result = normalizeElementoInput({ titolo: "   ", tipo: "evento" });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("titolo_vuoto");
  });

  it("accepts an annotazione with only shared fields", () => {
    const result = normalizeElementoInput({
      titolo: "Riflessione",
      descrizione: "Nota personale",
      tags: ["fede"],
      tipo: "annotazione",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.titolo).toBe("Riflessione");
      expect(result.value.tipo).toBe("annotazione");
      expect(result.value.tribu).toBeUndefined();
    }
  });
});

describe("normalizeElementoInput — tipo/field consistency", () => {
  it("accepts tribu + ruoli on a personaggio", () => {
    const result = normalizeElementoInput({
      titolo: "Abraamo",
      tipo: "personaggio",
      tribu: "levi",
      ruoli: ["patriarca"],
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.tribu).toBe("levi");
      expect(result.value.ruoli).toEqual(["patriarca"]);
    }
  });

  it("rejects tribu on a guerra with tipo_specifico_non_ammesso", () => {
    const result = normalizeElementoInput({
      titolo: "Guerra dei sei giorni",
      tipo: "guerra",
      tribu: "levi",
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("tipo_specifico_non_ammesso");
  });

  it("rejects nascita on an evento with tipo_specifico_non_ammesso", () => {
    const result = normalizeElementoInput({
      titolo: "Diluvio",
      tipo: "evento",
      nascita: DS(2370),
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("tipo_specifico_non_ammesso");
  });

  it("accepts fazioni + esito on a guerra", () => {
    const result = normalizeElementoInput({
      titolo: "Battaglia",
      tipo: "guerra",
      fazioni: "Israele vs Filistei",
      esito: "Vittoria di Davide",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.fazioni).toBe("Israele vs Filistei");
      expect(result.value.esito).toBe("Vittoria di Davide");
    }
  });

  it("accepts statoProfezia on a profezia", () => {
    const result = normalizeElementoInput({
      titolo: "Isaia 53",
      tipo: "profezia",
      statoProfezia: "adempiuta",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value.statoProfezia).toBe("adempiuta");
  });

  it("accepts dettagliRegno on a regno", () => {
    const result = normalizeElementoInput({
      titolo: "Regno di Salomone",
      tipo: "regno",
      dettagliRegno: "40 anni di pace",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value.dettagliRegno).toBe("40 anni di pace");
  });

  it("accepts regione on a luogo", () => {
    const result = normalizeElementoInput({
      titolo: "Gerusalemme",
      tipo: "luogo",
      regione: "Giudea",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value.regione).toBe("Giudea");
  });
});

describe("normalizeElementoInput — date validation", () => {
  it("rejects a personaggio with an invalid nascita year (NaN) as data_non_valida", () => {
    const result = normalizeElementoInput({
      titolo: "Abraamo",
      tipo: "personaggio",
      nascita: { anno: Number.NaN, era: "aev", precisione: "esatta" },
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("data_non_valida");
  });

  it("accepts an evento with a puntuale date", () => {
    const result = normalizeElementoInput({
      titolo: "Diluvio",
      tipo: "evento",
      date: { kind: "puntuale", data: DS(2370) },
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value.date?.kind).toBe("puntuale");
  });

  it("accepts a periodo with a valid range", () => {
    const result = normalizeElementoInput({
      titolo: "Regno di Davide",
      tipo: "periodo",
      date: { kind: "range", inizio: DS(1010), fine: DS(970) },
    });
    // Note: with aev, anno 1010 is more ancient than anno 970, so this is valid order.
    expect(result.isOk()).toBe(true);
  });

  it("rejects a periodo with a range_order violation as data_non_valida", () => {
    const result = normalizeElementoInput({
      titolo: "Periodo invalido",
      tipo: "periodo",
      // inizio "ev" 100 is AFTER fine "aev" 100 → range_order
      date: {
        kind: "range",
        inizio: DS(100, "ev"),
        fine: DS(100, "aev"),
      },
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("data_non_valida");
  });
});
