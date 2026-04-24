import { co, z } from "jazz-tools";
import { BoardSchema } from "@/features/board/board.schema";
import { validateBoardName } from "@/features/board/board.rules";
import { err, ok, type Result } from "neverthrow";
import type { BoardError } from "@/features/board/board.errors";
import type { Board, BoardView } from "@/features/board/board.model";

const VALID_VIEWS: BoardView[] = ["timeline", "lista", "grafo", "genealogia"];

/** Convert a Jazz BoardSchema CoMap to a pure domain Board. */
export function coMapToBoard(coMap: any): Board | null {
  if (!coMap?.id || !coMap.nome) return null;
  const elementiIds: string[] = coMap.elementiIds
    ? [...coMap.elementiIds].filter(Boolean)
    : [];
  const ultimaVista =
    coMap.ultimaVista && VALID_VIEWS.includes(coMap.ultimaVista as BoardView)
      ? (coMap.ultimaVista as BoardView)
      : undefined;
  return {
    id: coMap.id as string,
    nome: coMap.nome as string,
    selezione: { kind: "fissa", elementiIds },
    ultimaVista,
  };
}

export function createBoard(
  account: any,
  nome: string
): Result<any, BoardError> {
  const workspace = account.root?.workspace;
  if (!workspace?.boards) return err({ type: "board_non_trovato" });

  const validatedNome = validateBoardName(nome);
  if (validatedNome.isErr()) return validatedNome;

  const board = BoardSchema.create(
    {
      nome: validatedNome.value,
      elementiIds: co.list(z.string()).create([], account),
    },
    account
  );

  workspace.boards.push(board);

  console.debug("[board] board-creato", { id: board.id, nome: validatedNome.value });

  return ok(board);
}

export function renameBoard(
  account: any,
  boardId: string,
  newNome: string
): Result<void, BoardError> {
  const workspace = account.root?.workspace;
  if (!workspace?.boards) return err({ type: "board_non_trovato" });

  const board = [...workspace.boards].find((b: any) => b?.id === boardId);
  if (!board) return err({ type: "board_non_trovato" });

  const validatedNome = validateBoardName(newNome);
  if (validatedNome.isErr()) return validatedNome;

  board.nome = validatedNome.value;

  console.debug("[board] board-rinominato", { id: boardId, nome: validatedNome.value });

  return ok(undefined);
}

export function deleteBoard(
  account: any,
  boardId: string
): Result<void, BoardError> {
  const workspace = account.root?.workspace;
  if (!workspace?.boards) return err({ type: "board_non_trovato" });

  const index = [...workspace.boards].findIndex((b: any) => b?.id === boardId);
  if (index === -1) return err({ type: "board_non_trovato" });

  workspace.boards.splice(index, 1);

  console.debug("[board] board-eliminato", { id: boardId });

  return ok(undefined);
}
