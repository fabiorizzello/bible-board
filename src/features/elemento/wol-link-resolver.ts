import { err, ok, type Result } from "@/features/shared/result";

const BOOK_MAP: Record<string, number> = {
  genesi: 1,
  esodo: 2,
  levitico: 3,
  numeri: 4,
  deuteronomio: 5,
  giosuè: 6,
  giosue: 6,
  giudici: 7,
  rut: 8,
  "1samuele": 9,
  "2samuele": 10,
  "1re": 11,
  "2re": 12,
  isaia: 23,
  geremia: 24,
  ezechiele: 26,
  daniele: 27,
  matteo: 40,
  marco: 41,
  luca: 42,
  giovanni: 43,
  atti: 44,
  romani: 45,
  rivelazione: 66
};

export type WolResolverError =
  | { type: "invalid_reference" }
  | { type: "unknown_book" };

export interface ScriptureReference {
  readonly bookNumber: number;
  readonly chapter: number;
  readonly verseStart: number;
  readonly verseEnd?: number;
  readonly originalLabel: string;
}

export interface WolLink {
  readonly href: string;
  readonly label: string;
  readonly target: "wol";
  readonly granularity: "chapter";
}

export function parseScriptureReference(reference: string): Result<ScriptureReference, WolResolverError> {
  const normalized = reference.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^([\dA-Za-zÀ-ÿ ]+)\s+(\d+):(\d+)(?:-(\d+))?$/u);

  if (!match) {
    return err({ type: "invalid_reference" });
  }

  const bookKey = match[1].toLowerCase().replace(/\s+/g, "");
  const bookNumber = BOOK_MAP[bookKey];

  if (!bookNumber) {
    return err({ type: "unknown_book" });
  }

  return ok({
    bookNumber,
    chapter: Number(match[2]),
    verseStart: Number(match[3]),
    verseEnd: match[4] ? Number(match[4]) : undefined,
    originalLabel: normalized
  });
}

export function buildWolStudyEditionLink(reference: ScriptureReference): WolLink {
  return {
    href: `https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/${reference.bookNumber}/${reference.chapter}`,
    label: reference.originalLabel,
    target: "wol",
    granularity: "chapter"
  };
}

export function resolveWolStudyEditionUrl(reference: string): Result<string, WolResolverError> {
  return parseScriptureReference(reference).map((parsed) => buildWolStudyEditionLink(parsed).href);
}
