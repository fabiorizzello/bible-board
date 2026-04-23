import { describe, expect, it } from "vitest";
import { getInverseLink } from "@/features/elemento/elemento.rules";
import type { ElementoLink } from "@/features/elemento/elemento.model";

// ── getInverseLink — parentela inversions ──

describe("getInverseLink — parentela", () => {
  it("inverts padre to figlio", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "padre" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.targetId).toBe("source-b");
    expect(inverse.tipo).toBe("parentela");
    expect(inverse.ruolo).toBe("figlio");
  });

  it("inverts madre to figlia", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "madre" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.ruolo).toBe("figlia");
  });

  it("inverts figlio to padre", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "figlio" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.ruolo).toBe("padre");
  });

  it("inverts figlia to madre", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "figlia" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.ruolo).toBe("madre");
  });

  it("inverts coniuge to coniuge (symmetric)", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "coniuge" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.ruolo).toBe("coniuge");
  });

  it("preserves targetId as source id", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "parentela", ruolo: "padre" };
    const inverse = getInverseLink("source-xyz", link);
    expect(inverse.targetId).toBe("source-xyz");
  });
});

// ── getInverseLink — non-parentela links (symmetric) ──

describe("getInverseLink — non-parentela links", () => {
  it("returns correlato with no ruolo (symmetric)", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "correlato" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.tipo).toBe("correlato");
    expect(inverse.ruolo).toBeUndefined();
  });

  it("returns localizzazione symmetric", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "localizzazione" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.tipo).toBe("localizzazione");
    expect(inverse.ruolo).toBeUndefined();
  });

  it("returns successione symmetric", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "successione" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.tipo).toBe("successione");
    expect(inverse.ruolo).toBeUndefined();
  });

  it("preserves nota on inverse", () => {
    const link: ElementoLink = { targetId: "target-a", tipo: "correlato", nota: "testo nota" };
    const inverse = getInverseLink("source-b", link);
    expect(inverse.nota).toBe("testo nota");
  });
});

// ── getInverseLink — double inversion ──

describe("getInverseLink — double inversion", () => {
  it("padre → figlio → padre (applying twice returns to origin)", () => {
    const original: ElementoLink = { targetId: "b", tipo: "parentela", ruolo: "padre" };
    const once = getInverseLink("a", original);
    const twice = getInverseLink("b", once);
    expect(twice.ruolo).toBe("padre");
  });

  it("correlato symmetric double inversion stays correlato", () => {
    const original: ElementoLink = { targetId: "b", tipo: "correlato" };
    const once = getInverseLink("a", original);
    const twice = getInverseLink("b", once);
    expect(twice.tipo).toBe("correlato");
    expect(twice.ruolo).toBeUndefined();
  });
});
