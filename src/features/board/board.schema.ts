import { co, z } from "jazz-tools";

export const BoardSchema = co.map({
  nome: z.string(),
  ultimaVista: z.enum(["timeline", "lista", "grafo", "genealogia"]).optional()
});
