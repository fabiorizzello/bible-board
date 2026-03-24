import { describe, expect, it } from "vitest";
import { matchAppRoutes, normalizeBoardQueryParam, normalizeBoardViewParam } from "@/app/router";

describe("navigation routes contract", () => {
  it("matches the canonical root and entity routes", () => {
    expect(matchAppRoutes("/")?.[0]?.route.path).toBe("/");
    expect(matchAppRoutes("/board/abc")?.[0]?.route.path).toBe("/board/:boardId");
    expect(matchAppRoutes("/elemento/xyz/modifica")?.[0]?.route.path).toBe(
      "/elemento/:elementoId/modifica"
    );
    expect(matchAppRoutes("/elemento/xyz")?.[0]?.route.path).toBe("/elemento/:elementoId");
  });

  it("normalizes invalid board views to timeline", () => {
    expect(normalizeBoardViewParam("lista")).toBe("lista");
    expect(normalizeBoardViewParam("unknown")).toBe("timeline");
    expect(normalizeBoardViewParam(undefined)).toBe("timeline");
  });

  it("treats blank board query as no filter", () => {
    expect(normalizeBoardQueryParam(" abraamo ")).toBe("abraamo");
    expect(normalizeBoardQueryParam("   ")).toBeUndefined();
    expect(normalizeBoardQueryParam(null)).toBeUndefined();
  });
});
