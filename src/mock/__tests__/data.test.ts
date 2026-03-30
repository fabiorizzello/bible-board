import { describe, it, expect } from "vitest";
import {
  ELEMENTI,
  ELEMENTI_MAP,
  ELEMENTO_IDS,
  BOARDS,
  BOARD_IDS,
  WORKSPACE,
  WORKSPACE_ID,
  EMPTY_WORKSPACE,
  RECENTI,
  getAllDataStoriche,
} from "@/mock/data";
import { parseElementoId, parseBoardId, parseWorkspaceId } from "@/features/shared/newtypes";
import { validateDataStorica } from "@/features/shared/value-objects";

describe("Mock data — branded IDs", () => {
  it("all ELEMENTO_IDS parse successfully", () => {
    for (const [key, id] of Object.entries(ELEMENTO_IDS)) {
      const result = parseElementoId(id as string);
      expect(result.isOk(), `ElementoId "${key}" (${id}) should parse`).toBe(true);
    }
  });

  it("all BOARD_IDS parse successfully", () => {
    for (const [key, id] of Object.entries(BOARD_IDS)) {
      const result = parseBoardId(id as string);
      expect(result.isOk(), `BoardId "${key}" (${id}) should parse`).toBe(true);
    }
  });

  it("WORKSPACE_ID parses successfully", () => {
    const result = parseWorkspaceId(WORKSPACE_ID as string);
    expect(result.isOk()).toBe(true);
  });

  it("workspace.id matches WORKSPACE_ID", () => {
    expect(WORKSPACE.id).toBe(WORKSPACE_ID);
  });

  it("EMPTY_WORKSPACE has valid branded ID", () => {
    const result = parseWorkspaceId(EMPTY_WORKSPACE.id as string);
    expect(result.isOk()).toBe(true);
  });
});

describe("Mock data — DataStorica validation", () => {
  const allDates = getAllDataStoriche();

  it("has at least 10 DataStorica values", () => {
    expect(allDates.length).toBeGreaterThanOrEqual(10);
  });

  it("all DataStorica values validate successfully", () => {
    for (const ds of allDates) {
      const result = validateDataStorica(ds);
      expect(
        result.isOk(),
        `DataStorica { anno: ${ds.anno}, era: ${ds.era} } should validate`,
      ).toBe(true);
    }
  });
});

describe("Mock data — structural integrity", () => {
  it("has 12+ Elementi", () => {
    expect(ELEMENTI.length).toBeGreaterThanOrEqual(12);
  });

  it("has 2+ Boards", () => {
    expect(BOARDS.length).toBeGreaterThanOrEqual(2);
  });

  it("RECENTI has at most 8 entries", () => {
    expect(RECENTI.length).toBeLessThanOrEqual(8);
  });

  it("RECENTI references existing elementi or boards", () => {
    const elementIds = new Set(ELEMENTI.map((el) => el.id as string));
    const boardIds = new Set(BOARDS.map((b) => b.id));

    for (const rec of RECENTI) {
      if (rec.tipo === "elemento") {
        expect(elementIds.has(rec.id), `Recente "${rec.titolo}" should reference existing elemento`).toBe(true);
      } else {
        expect(boardIds.has(rec.id), `Recente "${rec.titolo}" should reference existing board`).toBe(true);
      }
    }
  });

  it("boards with fissa selezione reference valid element IDs", () => {
    const elementIds = new Set(ELEMENTI.map((el) => el.id as string));

    for (const board of BOARDS) {
      if (board.selezione.kind === "fissa") {
        for (const eId of board.selezione.elementiIds) {
          expect(
            elementIds.has(eId),
            `Board "${board.nome}" references unknown element ID: ${eId}`,
          ).toBe(true);
        }
      }
    }
  });

  it("workspace boardIds reference valid boards", () => {
    const boardIds = new Set(BOARDS.map((b) => b.id));
    for (const bId of WORKSPACE.boardIds) {
      expect(boardIds.has(bId as string), `Workspace references unknown board: ${bId}`).toBe(true);
    }
  });

  it("ELEMENTI_MAP has same count as ELEMENTI array", () => {
    expect(ELEMENTI_MAP.size).toBe(ELEMENTI.length);
  });

  it("workspace tagRegistry tags are non-empty strings", () => {
    for (const reg of WORKSPACE.tagRegistry) {
      expect(reg.tag.length).toBeGreaterThan(0);
    }
  });

  it("element link targetIds reference existing elements", () => {
    const elementIds = new Set(ELEMENTI.map((el) => el.id as string));
    for (const el of ELEMENTI) {
      for (const link of el.link) {
        expect(
          elementIds.has(link.targetId),
          `${el.titolo} links to unknown element: ${link.targetId}`,
        ).toBe(true);
      }
    }
  });
});
