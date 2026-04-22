import { beforeEach, describe, expect, it } from "vitest";
import {
  createBidirectionalLink,
  removeBidirectionalLink,
  resetWorkspaceUiState,
} from "../workspace-ui-store";
import { findElementById } from "../display-helpers";
import { ELEMENTO_IDS } from "@/mock/data";

beforeEach(() => {
  resetWorkspaceUiState();
});

// ── createBidirectionalLink — parentela ──

describe("createBidirectionalLink — parentela", () => {
  it("adds padre link on source and figlio inverse on target", () => {
    // gedeone and babilonia have no existing links to each other
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "parentela",
      "padre",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);

    expect(gedeone?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.babilonia as string, tipo: "parentela", ruolo: "padre" }),
    );
    expect(babilonia?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.gedeone as string, tipo: "parentela", ruolo: "figlio" }),
    );
  });

  it("inverts madre to figlia", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.sara as string,
      ELEMENTO_IDS.gedeone as string,
      "parentela",
      "madre",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    expect(gedeone?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.sara as string, tipo: "parentela", ruolo: "figlia" }),
    );
  });

  it("inverts figlio to padre", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "parentela",
      "figlio",
    );

    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);
    expect(babilonia?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.gedeone as string, tipo: "parentela", ruolo: "padre" }),
    );
  });

  it("inverts coniuge to coniuge (symmetric)", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "parentela",
      "coniuge",
    );

    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);
    expect(babilonia?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.gedeone as string, tipo: "parentela", ruolo: "coniuge" }),
    );
  });
});

// ── createBidirectionalLink — generic links ──

describe("createBidirectionalLink — generic links", () => {
  it("adds correlato on source and symmetric inverse on target", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);

    expect(gedeone?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.babilonia as string, tipo: "correlato" }),
    );
    expect(babilonia?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.gedeone as string, tipo: "correlato" }),
    );
  });

  it("adds successione on source and symmetric inverse on target", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.regnoDavide as string,
      "successione",
    );

    const regnoDavide = findElementById(ELEMENTO_IDS.regnoDavide as string);
    expect(regnoDavide?.link).toContainEqual(
      expect.objectContaining({ targetId: ELEMENTO_IDS.gedeone as string, tipo: "successione" }),
    );
  });

  it("does not modify the source's pre-existing unrelated links", () => {
    // Gedeone has no existing links in base mock data
    const gedeoneBase = findElementById(ELEMENTO_IDS.gedeone as string);
    const baseLinkCount = gedeoneBase?.link.length ?? 0;

    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    expect(gedeone?.link.length).toBe(baseLinkCount + 1);
  });
});

// ── createBidirectionalLink — idempotency ──

describe("createBidirectionalLink — idempotency", () => {
  it("does not duplicate forward link when called twice with same args", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    const links = gedeone?.link.filter(
      (l) => l.targetId === (ELEMENTO_IDS.babilonia as string) && l.tipo === "correlato",
    );
    expect(links?.length).toBe(1);
  });

  it("does not duplicate inverse link when called twice", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );

    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);
    const links = babilonia?.link.filter(
      (l) => l.targetId === (ELEMENTO_IDS.gedeone as string) && l.tipo === "correlato",
    );
    expect(links?.length).toBe(1);
  });
});

// ── removeBidirectionalLink ──

describe("removeBidirectionalLink", () => {
  it("removes forward and inverse parentela links built via createBidirectionalLink", () => {
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "parentela",
      "padre",
    );
    removeBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "parentela",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    const babilonia = findElementById(ELEMENTO_IDS.babilonia as string);

    expect(
      gedeone?.link.some(
        (l) => l.targetId === (ELEMENTO_IDS.babilonia as string) && l.tipo === "parentela",
      ),
    ).toBe(false);
    expect(
      babilonia?.link.some(
        (l) => l.targetId === (ELEMENTO_IDS.gedeone as string) && l.tipo === "parentela",
      ),
    ).toBe(false);
  });

  it("removes existing mock-data parentela link from both sides (abraamo→isacco)", () => {
    // abraamo has parentela/padre to isacco; isacco has parentela/figlio to abraamo
    removeBidirectionalLink(
      ELEMENTO_IDS.abraamo as string,
      ELEMENTO_IDS.isacco as string,
      "parentela",
    );

    const abraamo = findElementById(ELEMENTO_IDS.abraamo as string);
    const isacco = findElementById(ELEMENTO_IDS.isacco as string);

    expect(
      abraamo?.link.some(
        (l) => l.targetId === (ELEMENTO_IDS.isacco as string) && l.tipo === "parentela",
      ),
    ).toBe(false);
    expect(
      isacco?.link.some(
        (l) => l.targetId === (ELEMENTO_IDS.abraamo as string) && l.tipo === "parentela",
      ),
    ).toBe(false);
  });

  it("is a no-op when the link does not exist", () => {
    // gedeone has no link to regnoDavide
    const gedeoneBase = findElementById(ELEMENTO_IDS.gedeone as string);
    const baseLinkCount = gedeoneBase?.link.length ?? 0;

    removeBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.regnoDavide as string,
      "correlato",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    expect(gedeone?.link.length).toBe(baseLinkCount);
  });

  it("does not remove unrelated links on either side", () => {
    // Create two different links from gedeone
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );
    createBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.gerusalemme as string,
      "correlato",
    );

    // Remove only the babilonia link
    removeBidirectionalLink(
      ELEMENTO_IDS.gedeone as string,
      ELEMENTO_IDS.babilonia as string,
      "correlato",
    );

    const gedeone = findElementById(ELEMENTO_IDS.gedeone as string);
    expect(
      gedeone?.link.some(
        (l) => l.targetId === (ELEMENTO_IDS.gerusalemme as string) && l.tipo === "correlato",
      ),
    ).toBe(true);
  });
});
