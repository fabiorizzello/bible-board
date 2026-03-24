import { err, ok, type Result } from "@/features/shared/result";
import type { BoardError } from "@/features/board/board.errors";
import type { BoardView } from "@/features/board/board.model";

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
