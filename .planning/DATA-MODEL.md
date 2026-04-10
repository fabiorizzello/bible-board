# Data Model: Timeline Board App

> Versione: 2.0.0 | Aggiornato: 2026-03-30

## Overview

The product model has three aggregate roots:

- `Workspace`: top-level collaborative boundary and permission root
- `Elemento`: primary study object with typed metadata and links
- `Board`: saved selection and view configuration over a subset of elementi

Supporting value objects carry historical dates, sources, media references, tags, links, and action-log data.

---

## Branded Types (NewTypes)

All IDs and constrained primitives use Zod `.brand()` via jazz-tools `z` with `safeParse()` at the adapter boundary. No `as` cast — the branded type is proof of parsing.

| Type | Schema | Base |
|------|--------|------|
| `WorkspaceId` | `z.string().min(1).brand<"WorkspaceId">()` | string |
| `ElementoId` | `z.string().min(1).brand<"ElementoId">()` | string |
| `BoardId` | `z.string().min(1).brand<"BoardId">()` | string |
| `AzioneId` | `z.string().min(1).brand<"AzioneId">()` | string |
| `MediaId` | `z.string().min(1).brand<"MediaId">()` | string |
| `Tag` | `z.string().min(1).brand<"Tag">()` | string |
| `NonEmptyString` | `z.string().min(1).brand<"NonEmptyString">()` | string |

Defined in `src/features/shared/newtypes.ts`.

---

## Aggregate: Workspace

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `WorkspaceId` | Yes | Stable Jazz-backed identifier |
| `nome` | `string` | Yes | User-visible workspace name |
| `descrizione` | `string` | No | Optional description |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp |
| `boardIds` | `BoardId[]` | Yes | Saved views/selections |
| `tagRegistry` | `TagRegistration[]` | Yes | Registry of allowed/suggested tags |
| `elementi` | `Elemento[]` | Yes | Collection of all elementi in workspace |

### Jazz Schema

```ts
WorkspaceSchema = co.map({
  nome: z.string(),
  descrizione: z.string().optional(),
  createdAt: z.string(),
  boardIds: co.list(z.string()),
  tagRegistry: co.list(TagRegistrationSchema),
  elementi: co.list(ElementoSchema)
});
```

### Invariants

- One workspace per account.
- Permissions are defined at workspace scope only (Jazz group).
- Workspace content shares the same effective owner group.
- Tag registry entries remain even when no elemento currently uses the tag.

### Relationships

- Owns many `Elemento`
- Owns many `Board` (by ID reference)
- Owns many `TagRegistration`

### Error Types (`WorkspaceError`)

| Variant | Fields | Notes |
|---------|--------|-------|
| `workspace_missing` | — | No workspace found on account |
| `workspace_name_empty` | — | Name validation failed |
| `tag_vuoto` | — | Empty tag string |
| `tag_duplicato` | `tag: string` | Tag already in registry |
| `tag_non_trovato` | `tag: string` | Tag not in registry |
| `azione_non_trovata` | `id: string` | Action log lookup failed |
| `rollback_non_sicuro` | `motivo: string` | Rollback cannot be safely applied |

---

## Aggregate: Elemento

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `ElementoId` | Yes | Stable unique identifier |
| `titolo` | `string` (non-empty) | Yes | Primary label |
| `tipo` | `ElementoTipo` | Yes | Discriminated union by category |
| `date` | `DataTemporale` | No | At most one temporal value per elemento |
| `nascita` | `DataStorica` | No | Dedicated birth date, only for `personaggio` |
| `morte` | `DataStorica` | No | Dedicated death date, only for `personaggio` |
| `tags` | `string[]` | Yes | Zero or more registry-backed tags |
| `fonti` | `Fonte[]` | Yes | Source references |
| `media` | `MediaImmagine[]` | Yes | Image-only v1 media set |
| `note` | `string` | Yes | Free-form notes, can be empty string |
| `link` | `ElementoLink[]` | Yes | Bidirectional typed relations |

### Jazz Schema (Flattened DataTemporale)

In the Jazz CRDT schema, `DataTemporale` is flattened for storage:

```ts
ElementoSchema = co.map({
  titolo: z.string(),
  note: z.string(),
  dateKind: z.enum(["puntuale", "range"]).optional(),
  data: DataStoricaSchema.optional(),      // used when dateKind = "puntuale"
  inizio: DataStoricaSchema.optional(),    // used when dateKind = "range"
  fine: DataStoricaSchema.optional(),      // used when dateKind = "range"
  nascita: DataStoricaSchema.optional(),
  morte: DataStoricaSchema.optional(),
  tipo: z.enum([...ElementoTipo values...]),
  tags: co.list(z.string()),
  fonti: co.list(FonteSchema),
  media: co.list(MediaImmagineSchema)
});
```

Note: `link` is stored in the domain model but not yet persisted in the Jazz schema.

### ElementoTipo Variants

| Variant | Type-Specific Fields | Notes |
|---------|---------------------|-------|
| `personaggio` | `nascita?`, `morte?` | Biographical dates |
| `guerra` | — | |
| `profezia` | — | |
| `regno` | — | |
| `periodo` | — | |
| `luogo` | — | |
| `evento` | — | |
| `annotazione` | — | **NEW** -- no type-specific fields; specificity comes from mandatory video Fonte |

> **`annotazione` invariant**: An Elemento of type `annotazione` MUST have at least one Fonte of type `video`. The video Fonte carries the `SorgenteVideo` metadata.

#### Code status

Current code in `elemento.model.ts`:
```ts
export type ElementoTipo =
  | "personaggio" | "guerra" | "profezia"
  | "regno" | "periodo" | "luogo" | "evento";
```

Current Jazz schema `tipo` enum:
```ts
z.enum(["personaggio", "guerra", "profezia", "regno", "periodo", "luogo", "evento"])
```

> `annotazione` is NOT yet in code. **CODE DIVERGENCE** -- add `"annotazione"` to `ElementoTipo` union and Jazz schema enum.

### Invariants

- `titolo` is never empty.
- Each `Elemento` has zero or one general `DataTemporale`.
- `personaggio` may additionally carry dedicated `nascita` and `morte` `DataStorica` values.
- Non-`personaggio` types must NOT have `nascita` or `morte`.
- Multi-fulfillment prophecy modeling uses linked elementi, not multiple dates on one elemento.
- All links are stored in forward form on the owning elemento but MUST be mirrored by inverse link creation/removal rules.
- Deleting an elemento cascades link removal from connected elementi.
- `annotazione` MUST have at least one Fonte of type `video`.

### Relationships

- Belongs to one `Workspace`
- References many `TagRegistration` by tag value
- References many `Fonte`
- References many `MediaImmagine`
- Connects to many `Elemento` through `ElementoLink`

### Error Types (`ElementoError`)

| Variant | Notes |
|---------|-------|
| `titolo_vuoto` | Empty title |
| `elemento_non_trovato` | Lookup by ID failed |
| `data_non_valida` | Date validation failed |
| `fonte_non_valida` | Fonte validation failed |
| `link_non_valido` | Link validation failed |
| `link_duplicato` | Same target+tipo already exists |
| `link_auto_riferimento` | Link to self |
| `link_non_trovato` | Link removal target not found |
| `ruolo_mancante_per_parentela` | Parentela link without ruolo |

---

## Aggregate: Board

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `BoardId` | Yes | Stable unique identifier |
| `nome` | `string` (non-empty) | Yes | User-visible name |
| `selezione` | `SelezioneElementi` | Yes | Fixed or dynamic |
| `ultimaVista` | `BoardView` | No | Last used view |
| `configViste.timeline` | `TimelineConfig` | No | Present once used |
| `configViste.lista` | `ListaConfig` | No | Present once used |
| `configViste.grafo` | `GrafoConfig` | No | Present once used |
| `configViste.genealogia` | `GenealogiaConfig` | No | Present once used |

### BoardView

`"timeline" | "lista" | "grafo" | "genealogia"`

### SelezioneElementi

| Variant | Fields | Semantics |
|---------|--------|-----------|
| `Fissa` | `elementiIds: string[]` | Manual membership |
| `Dinamica` | `tags?: string[]`, `tipi?: ElementoTipo[]` | `AND` across categories, `OR` within multi-value |

### View Configs (Planned)

| Config | Fields |
|--------|--------|
| `TimelineConfig` | `scala`, `tagli[]`, `tagGroups[]` |
| `ListaConfig` | `ordinamento`, `colonneVisibili[]` |
| `GrafoConfig` | `layout`, `filtriLink[]` |
| `GenealogiaConfig` | `radice: ElementoId`, `profondita` |

### Jazz Schema

```ts
BoardSchema = co.map({
  nome: z.string(),
  ultimaVista: z.enum(["timeline", "lista", "grafo", "genealogia"]).optional()
});
```

Note: `selezione` and `configViste` are not yet in the Jazz schema.

### Invariants

- The board identity is the saved selection, not the current visual mode.
- Timeline `tagGroups` are visual-only configuration.
- Dynamic selection criteria are evaluated over current workspace data and update automatically.
- Deleting a board never deletes elementi.

### Relationships

- Belongs to one `Workspace`
- References many `Elemento` either directly (`Fissa`) or by rule (`Dinamica`)

### Error Types (`BoardError`)

| Variant | Notes |
|---------|-------|
| `board_nome_vuoto` | Empty board name |
| `board_non_trovato` | Lookup by ID failed |
| `view_non_valida` | Unknown view type |
| `selezione_vuota` | Fixed selection with zero IDs |

---

## Value Object: DataStorica

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `anno` | `number` (positive integer) | Yes | Stored positive in both eras |
| `era` | `"aev" \| "ev"` | Yes | Displayed as `a.e.v.` / `e.v.` |
| `mese` | `number` (1-12) | No | Optional month |
| `giorno` | `number` (1-31) | No | Optional day, valid only when `mese` is present |
| `precisione` | `"esatta" \| "circa"` | Yes | Historical precision |

### Validation

- `anno` must be a positive integer.
- `mese` must be 1-12 if present.
- `giorno` must be 1-31 if present, and requires `mese`.
- Cross-era comparisons: `aev` years sort as negative.

Defined in `src/features/shared/value-objects.ts`.

## Value Object: DataTemporale

| Variant | Fields |
|---------|--------|
| `Puntuale` | `data: DataStorica` |
| `Range` | `inizio: DataStorica`, `fine: DataStorica` |

### Invariants

- Range `inizio` must be chronologically before `fine`.
- Cross-era ranges are valid.
- Elements without dates remain valid but are excluded from timeline rendering.

## Value Object: TagRegistration

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `tag` | `string` | Yes | Unique within workspace (case-insensitive) |
| `colore` | `string` | No | Optional UI color hint |
| `elementoDescrittivoId` | `string` | No | Optional explanatory elemento |

### Jazz Schema

```ts
TagRegistrationSchema = co.map({
  tag: z.string(),
  colore: z.string().optional(),
  elementoDescrittivoId: z.string().optional()
});
```

## Value Object: Fonte

### Definitive FonteTipo

`"bibbia" | "articolo-wol" | "link" | "video" | "immagine"`

> **CODE DIVERGENCE** -- Current code uses `"scrittura" | "articolo" | "altro"`. Must be migrated to the new types below.

| Variant | Fields | Notes |
|---------|--------|-------|
| `bibbia` | `riferimento: string`, `urlCalcolata?: string` | Store scripture reference text, compute WOL Study Edition URL via `wol-link-resolver.ts` |
| `articolo-wol` | `url: string`, `sezione?: { da: number, a: number }` | WOL article URL; paragraph-level section range is future work |
| `link` | `url: string`, `etichetta?: string` | Generic external link |
| `video` | `sorgente: SorgenteVideo` | JW.org video with time range section; see dedicated value object below |
| `immagine` | *deferred* | To be defined in a future iteration |

### Current Code (OUTDATED)

```ts
// elemento.rules.ts
export type FonteTipo = "scrittura" | "articolo" | "altro";

// elemento.schema.ts (Jazz)
FonteSchema = co.map({
  tipo: z.enum(["scrittura", "articolo", "altro"]),
  valore: z.string(),
  urlCalcolata: z.string().optional()
});
```

### Target Schema Shape (after migration)

The flat `valore` + `urlCalcolata` structure needs to become variant-specific fields:

| FonteTipo | Stored Fields |
|-----------|---------------|
| `bibbia` | `tipo`, `riferimento`, `urlCalcolata?` |
| `articolo-wol` | `tipo`, `url` |
| `link` | `tipo`, `url`, `etichetta?` |
| `video` | `tipo`, `mediaKey`, `sezione?: {da, a}`, `titoloOriginale?`, `durataSecondi?`, `thumbnail?`, `qualita?[]` |
| `immagine` | `tipo` (deferred) |

> **CODE DIVERGENCE** -- `FonteTipo`, `FonteInput`, `NormalizedFonte`, `FonteSchema` all need migration.

## Value Object: SorgenteVideo (NEW)

Metadata cached from the JW Mediator API for a video source.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `mediaKey` | `string` | Yes | Natural key on JW.org (e.g. `pub-nwtsv_15_VIDEO`) |
| `sezione` | `{ da: number, a: number }` | No | Time range in seconds |
| `titoloOriginale` | `string` | No | Original video title from API |
| `durataSecondi` | `number` | No | Total duration in seconds |
| `thumbnail` | `string` | No | Thumbnail URL |
| `qualita` | `QualitaVideo[]` | No | Available MP4 quality variants |

### QualitaVideo

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `label` | `string` | Yes | e.g. `"240p"`, `"360p"`, `"480p"`, `"720p"` |
| `url` | `string` | Yes | Direct MP4 URL |
| `dimensioneBytes` | `number` | No | File size if known |

### Invariants

- `sezione.da` < `sezione.a` when sezione is present.
- `sezione.da` >= 0 and `sezione.a` <= `durataSecondi` when both sezione and durataSecondi are present.
- Video playback is online-only in v1; offline download deferred to v2.
- `qualita` array is populated by fetching from JW Mediator API.

### JW Mediator API

Endpoint: `https://b.jw-cdn.org/apis/mediator/v1/media-items/{lang}/{naturalKey}`

Returns: MP4 URLs (240p-720p), VTT subtitles, thumbnails, duration.

> **CODE DIVERGENCE** -- `SorgenteVideo` does not exist in code yet. Must be created and integrated into the Fonte variant for `video`.

## Value Object: MediaImmagine

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `nomeFile` | `string` | Yes | Display filename |
| `mimeType` | `string` | Yes | Derived from uploaded file |
| `dimensioneBytes` | `number` | Yes | Used for storage reporting |

### Jazz Schema

```ts
MediaImmagineSchema = co.map({
  nomeFile: z.string(),
  mimeType: z.string(),
  dimensioneBytes: z.number()
});
```

Note: Image upload is not yet implemented (adapter throws).

## Value Object: ElementoLink

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `targetId` | `string` | Yes | Linked elemento ID |
| `tipo` | `TipoLink` | Yes | Typed relationship |
| `ruolo` | `RuoloLink` | No | Required when `tipo` is `parentela` |
| `nota` | `string` | No | Optional annotation |

### TipoLink

`"adempimento" | "causa-effetto" | "parallelo" | "successione" | "parentela" | "localizzazione" | "residenza" | "correlato"`

### RuoloLink

`"padre" | "madre" | "figlio" | "figlia" | "coniuge"`

### Bidirectional Link Rules

| Forward Ruolo | Inverse Ruolo |
|---------------|---------------|
| `padre` | `figlio` |
| `madre` | `figlia` |
| `figlio` | `padre` |
| `figlia` | `madre` |
| `coniuge` | `coniuge` |

### Invariants

- Self-links are forbidden (`targetId !== sourceId`).
- Duplicate links (same `targetId` + `tipo`) are forbidden.
- `parentela` links MUST have a `ruolo`.
- Creating a link MUST automatically create the inverse on the target elemento.
- Removing a link MUST automatically remove the inverse.
- Deleting an elemento cascades link removal from all connected elementi.

## Value Object: ScriptureReference (WOL Link Resolver)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `bookNumber` | `number` | Yes | Bible book number (1-66) |
| `chapter` | `number` | Yes | Chapter number |
| `verseStart` | `number` | Yes | Starting verse |
| `verseEnd` | `number` | No | Ending verse for range |
| `originalLabel` | `string` | Yes | User-entered reference text |

Resolved to WOL Study Edition URL: `https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/{bookNumber}/{chapter}`

Supported books (subset, expandable): Genesi through Rivelazione via `BOOK_MAP` in `wol-link-resolver.ts`.

## Value Object: Azione

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` (UUID) | Yes | Stable action identifier |
| `timestamp` | `string` (ISO 8601) | Yes | Chronological ordering |
| `autoreId` | `string` | Yes | User/account that triggered the action |
| `tipo` | `TipoAzione` | Yes | Action category |
| `payload` | `RollbackPayload` | Yes | Minimal data for explanation/compensation |
| `targetId` | `string` | No | Related entity identifier |
| `compensatedBy` | `string` | No | ID of the rollback action that compensated this one |

### TipoAzione

`"creazione" | "modifica" | "eliminazione" | "link" | "rollback"`

### RollbackPayload

| Field | Type | Required |
|-------|------|----------|
| `descrizione` | `string` | Yes |
| `datiPrecedenti` | `Record<string, unknown>` | No |

### Invariants

- Rollback is modeled as a new compensating action, never as history mutation.
- A rollback action cannot itself be rolled back.
- An already-compensated action cannot be rolled back again.

---

## State Transitions

### Workspace

- `Created` -> `Populated`: after first elemento/board/tag creation
- `Shared`: after adding other accounts to the Jazz owner group

### Elemento

- `Created` -> `Updated`: normal edits
- `Updated` -> `Deleted`: explicit destructive action with undo toast
- `Deleted` -> `Restored`: through compensating rollback action

### Board

- `Created` -> `Configured`: first view/filter change
- `Configured` -> `Deleted`: board removed, underlying elementi untouched

### Azione

- `Recorded` -> `Compensated`: rollback action references and compensates the original
- `Recorded` -> `BlockedForRollback`: current state prevents safe reversal

---

## Validation Rules Summary

- Titles are non-empty (trimmed).
- `giorno` requires `mese` in every `DataStorica`.
- `nascita`/`morte` only allowed on `personaggio` tipo.
- Tags are unique in the registry (case-insensitive) and never auto-deleted.
- Dynamic board filters use `AND` across categories and `OR` within values.
- Search is simple case-insensitive text matching; empty query = no filter.
- Collaboration roles are only `lettura` and `scrittura` (Jazz group-level).
- `annotazione` MUST have at least one Fonte of type `video`.
- Video section: `da` < `a`, both <= `durataSecondi`.
- Video playback is online-only in v1; offline download deferred to v2.
- Self-links forbidden; duplicate links forbidden; parentela requires ruolo.

---

## Code Divergence Summary

Items marked below need code updates to match this data model:

| Area | Current Code | Target | Files to Update |
|------|-------------|--------|-----------------|
| `ElementoTipo` | 7 variants (no `annotazione`) | 8 variants (+ `annotazione`) | `elemento.model.ts`, `elemento.schema.ts`, `elemento.rules.ts` |
| `FonteTipo` | `scrittura \| articolo \| altro` | `bibbia \| articolo-wol \| link \| video \| immagine` | `elemento.rules.ts`, `elemento.schema.ts`, `elemento.adapter.ts` |
| `Fonte` structure | Flat `valore` + `urlCalcolata?` | Variant-specific fields per FonteTipo | `elemento.rules.ts`, `elemento.schema.ts` |
| `SorgenteVideo` | Does not exist | New value object + `QualitaVideo` | New file or in `value-objects.ts` |
| `annotazione` validation | None | Must enforce >= 1 video Fonte | `elemento.rules.ts` |
| Video sezione validation | None | `da` < `a`, both <= `durataSecondi` | `elemento.rules.ts` |
