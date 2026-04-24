import { co, z } from "jazz-tools";

export const MediaImmagineSchema = co.map({
  nomeFile: z.string(),
  mimeType: z.string(),
  dimensioneBytes: z.number(),
});

export const FonteSchema = co.map({
  tipo: z.enum(["scrittura", "articolo-wol", "pubblicazione", "link", "altro"]),
  valore: z.string(),
  urlCalcolata: z.string().optional()
});

export const LinkSchema = co.map({
  targetId: z.string(),
  tipo: z.enum([
    "adempimento",
    "causa-effetto",
    "parallelo",
    "successione",
    "parentela",
    "localizzazione",
    "residenza",
    "correlato"
  ]),
  ruolo: z.enum(["padre", "madre", "figlio", "figlia", "coniuge"]).optional(),
  nota: z.string().optional()
});

const DataStoricaSchema = z
  .object({
    anno: z.number().int().positive(),
    era: z.enum(["aev", "ev"]),
    precisione: z.enum(["esatta", "circa"]),
    mese: z.number().int().min(1).max(12).optional(),
    giorno: z.number().int().min(1).max(31).optional()
  })
  .superRefine((value, ctx) => {
    if (value.giorno !== undefined && value.mese === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Il giorno richiede un mese."
      });
    }
  });

export const ElementoSchema = co.map({
  titolo: z.string(),
  descrizione: z.string(),
  dateKind: z.enum(["puntuale", "range"]).optional(),
  data: DataStoricaSchema.optional(),
  inizio: DataStoricaSchema.optional(),
  fine: DataStoricaSchema.optional(),
  nascita: DataStoricaSchema.optional(),
  morte: DataStoricaSchema.optional(),
  tipo: z.enum([
    "personaggio",
    "guerra",
    "profezia",
    "regno",
    "periodo",
    "luogo",
    "evento",
    "annotazione"
  ]),
  tags: co.list(z.string()),
  fonti: co.list(FonteSchema),
  links: co.list(LinkSchema),
  media: co.list(MediaImmagineSchema),
  // Tipo-specific optional fields (serialized as plain strings)
  tribu: z.string().optional(),
  ruoliStr: z.string().optional(),      // personaggio: CSV of ruoli array
  fazioni: z.string().optional(),
  esito: z.string().optional(),
  statoProfezia: z.string().optional(),
  dettagliRegno: z.string().optional(),
  regione: z.string().optional(),
  autore: z.string().optional(),
  // Soft delete
  deletedAt: z.string().optional()
});
