import { describe, expect, it } from "vitest";
import { validateDataStorica, validateDataTemporale } from "@/features/shared/value-objects";

describe("historical date value objects", () => {
  it("accepts a point date with month and day", () => {
    const result = validateDataStorica({
      anno: 33,
      era: "ev",
      mese: 4,
      giorno: 14,
      precisione: "esatta"
    });

    expect(result.isOk()).toBe(true);
  });

  it("rejects a day without month", () => {
    const result = validateDataStorica({
      anno: 33,
      era: "ev",
      giorno: 14,
      precisione: "esatta"
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ type: "day_requires_month" });
  });

  it("accepts cross-era ranges", () => {
    const result = validateDataTemporale({
      kind: "range",
      inizio: {
        anno: 100,
        era: "aev",
        precisione: "circa"
      },
      fine: {
        anno: 50,
        era: "ev",
        precisione: "esatta"
      }
    });

    expect(result.isOk()).toBe(true);
  });

  it("rejects inverted ranges", () => {
    const result = validateDataTemporale({
      kind: "range",
      inizio: {
        anno: 10,
        era: "ev",
        precisione: "esatta"
      },
      fine: {
        anno: 100,
        era: "aev",
        precisione: "esatta"
      }
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ type: "range_order" });
  });
});
