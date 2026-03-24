import { describe, expect, it } from "vitest";
import { normalizeElementoInput, validateElementoTitle } from "@/features/elemento/elemento.rules";

describe("elemento CRUD rules", () => {
  it("normalizes a valid personaggio payload", () => {
    const result = normalizeElementoInput({
      titolo: "  Abraamo  ",
      note: "  Patriarca  ",
      tipo: "personaggio",
      nascita: {
        anno: 2018,
        era: "aev",
        precisione: "circa"
      }
    });

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      return;
    }

    expect(result.value).toEqual({
      titolo: "Abraamo",
      note: "Patriarca",
      tipo: "personaggio",
      date: undefined,
      nascita: {
        anno: 2018,
        era: "aev",
        precisione: "circa"
      },
      morte: undefined
    });
  });

  it("normalizes a valid non-personaggio payload with a general temporal range", () => {
    const result = normalizeElementoInput({
      titolo: "Regno di Davide",
      tipo: "regno",
      date: {
        kind: "range",
        inizio: {
          anno: 1077,
          era: "aev",
          precisione: "esatta"
        },
        fine: {
          anno: 1037,
          era: "aev",
          precisione: "esatta"
        }
      }
    });

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      return;
    }

    expect(result.value.date).toEqual({
      kind: "range",
      inizio: {
        anno: 1077,
        era: "aev",
        precisione: "esatta"
      },
      fine: {
        anno: 1037,
        era: "aev",
        precisione: "esatta"
      }
    });
  });

  it("rejects an empty title", () => {
    const result = validateElementoTitle("   ");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ type: "titolo_vuoto" });
  });

  it("rejects person dates with day but no month", () => {
    const result = normalizeElementoInput({
      titolo: "Mosè",
      tipo: "personaggio",
      nascita: {
        anno: 1593,
        era: "aev",
        precisione: "esatta",
        giorno: 7
      }
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ type: "data_non_valida" });
  });

  it("rejects dedicated birth or death dates for non-personaggio types", () => {
    const result = normalizeElementoInput({
      titolo: "Esodo",
      tipo: "evento",
      nascita: {
        anno: 1513,
        era: "aev",
        precisione: "esatta"
      }
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ type: "data_non_valida" });
  });
});
