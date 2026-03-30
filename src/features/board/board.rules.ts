import { err, ok, type Result } from "neverthrow";
import type { BoardError } from "@/features/board/board.errors";
import type {
  BoardView,
  SelezioneElementi,
  SelezioneDinamica,
} from "@/features/board/board.model";
import type { ElementoTipo } from "@/features/elemento/elemento.model";

const BOARD_VIEWS: readonly BoardView[] = ["timeline", "lista", "grafo", "genealogia"];

export function validateBoardName(nome: string): Result<string, BoardError> {
  const trimmed = nome.trim();

  if (!trimmed) {
    return err({ type: "board_nome_vuoto" });
  }

  return ok(trimmed);
}

export function normalizeBoardView(view: string | undefined): Result<BoardView, BoardError> {
  if (view && BOARD_VIEWS.includes(view as BoardView)) {
    return ok(view as BoardView);
  }

  return err({ type: "view_non_valida" });
}

// --- Selezione ---

export interface BoardInput {
  readonly nome: string;
  readonly selezione: SelezioneElementi;
  readonly ultimaVista?: BoardView;
}

export function validateSelezione(
  selezione: SelezioneElementi
): Result<SelezioneElementi, BoardError> {
  if (selezione.kind === "fissa" && selezione.elementiIds.length === 0) {
    return err({ type: "selezione_vuota" });
  }

  return ok(selezione);
}

export function normalizeBoardInput(
  input: BoardInput
): Result<BoardInput, BoardError> {
  const nomeResult = validateBoardName(input.nome);
  if (nomeResult.isErr()) {
    return err(nomeResult.error);
  }

  const selResult = validateSelezione(input.selezione);
  if (selResult.isErr()) {
    return err(selResult.error);
  }

  return ok({
    nome: nomeResult.value,
    selezione: selResult.value,
    ultimaVista: input.ultimaVista,
  });
}

// --- Dynamic filter matching ---

interface FilterableElemento {
  readonly id: string;
  readonly tags: readonly string[];
  readonly tipo: ElementoTipo;
}

export function matchDynamicSelection(
  elementi: readonly FilterableElemento[],
  selezione: SelezioneDinamica
): readonly FilterableElemento[] {
  return elementi.filter((el) => {
    if (selezione.tipi && selezione.tipi.length > 0) {
      if (!selezione.tipi.includes(el.tipo)) return false;
    }

    if (selezione.tags && selezione.tags.length > 0) {
      const elTagsLower = el.tags.map((t) => t.toLowerCase());
      const hasMatchingTag = selezione.tags.some((t) =>
        elTagsLower.includes(t.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

// --- Board Search ---

interface SearchableElemento {
  readonly id: string;
  readonly titolo: string;
  readonly note: string;
  readonly tags: readonly string[];
}

export function searchBoardElementi(
  elementi: readonly SearchableElemento[],
  query: string
): readonly SearchableElemento[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return elementi;

  return elementi.filter((el) => {
    if (el.titolo.toLowerCase().includes(trimmed)) return true;
    if (el.note.toLowerCase().includes(trimmed)) return true;
    if (el.tags.some((t) => t.toLowerCase().includes(trimmed))) return true;
    return false;
  });
}

// --- Genealogy Projection ---

interface GenealogyLink {
  readonly targetId: string;
  readonly tipo: string;
  readonly ruolo?: string;
}

interface GenealogyElemento {
  readonly id: string;
  readonly titolo: string;
  readonly links: readonly GenealogyLink[];
}

export function projectGenealogy(
  elementi: readonly GenealogyElemento[],
  rootId: string,
  maxDepth: number
): readonly string[] {
  const visited = new Set<string>();

  function walk(id: string, depth: number) {
    if (depth > maxDepth || visited.has(id)) return;
    visited.add(id);

    const el = elementi.find((e) => e.id === id);
    if (!el) return;

    const childLinks = el.links.filter(
      (l) => l.tipo === "parentela" && (l.ruolo === "padre" || l.ruolo === "madre")
    );

    for (const link of childLinks) {
      walk(link.targetId, depth + 1);
    }
  }

  walk(rootId, 0);
  return Array.from(visited);
}
