import { describe, expect, it } from "vitest";
import { buildWolStudyEditionLink, parseScriptureReference, resolveWolStudyEditionUrl } from "@/features/elemento/wol-link-resolver";

describe("wol link resolver", () => {
  it("resolves Genesi 12:1-3 to the study-edition navigator path", () => {
    expect(resolveWolStudyEditionUrl("Genesi 12:1-3")._unsafeUnwrap()).toBe(
      "https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/1/12"
    );
  });

  it("resolves Matteo 5:3 to the study-edition navigator path", () => {
    expect(resolveWolStudyEditionUrl("Matteo 5:3")._unsafeUnwrap()).toBe(
      "https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/40/5"
    );
  });

  it("returns a typed error for invalid references", () => {
    expect(resolveWolStudyEditionUrl("Riferimento non valido").isErr()).toBe(true);
  });

  it("keeps the original label in the built contract", () => {
    const parsed = parseScriptureReference("Genesi 12:1-3")._unsafeUnwrap();
    const link = buildWolStudyEditionLink(parsed);

    expect(link.label).toBe("Genesi 12:1-3");
    expect(link.granularity).toBe("chapter");
  });
});
