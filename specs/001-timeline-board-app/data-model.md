# Data Model: Timeline Board App

## Overview

The product model has three aggregate roots:

- `Workspace`: top-level collaborative boundary and permission root
- `Elemento`: primary study object with typed metadata and links
- `Board`: saved selection and view configuration over a subset of elementi

Supporting value objects carry historical dates, sources, media references, tags, links, and action-log data.

## Aggregate: Workspace

### Fields

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `WorkspaceId` | Yes | Stable Jazz-backed identifier |
| `nome` | `NonEmptyString` | Yes | User-visible workspace name |
| `membri` | `Group` | Yes | Jazz group owning the workspace and all shared content |
| `tagRegistry` | `TagRegistration[]` | Yes | Registry of allowed/suggested tags |
| `elementi` | `ElementoId[]` | Yes | Collection membership, loaded through adapters |
| `board` | `BoardId[]` | Yes | Saved views/selections |
| `logAzioni` | `AzioneId[]` | Yes | Chronological action history |

### Invariants

- One workspace per account.
- Permissions are defined at workspace scope only.
- Workspace content shares the same effective owner group unless explicitly justified by adapter rules.
- Tag registry entries remain even when no elemento currently uses the tag.

### Relationships

- Owns many `Elemento`
- Owns many `Board`
- Owns many `Azione`
- Owns many `TagRegistration`

## Aggregate: Elemento

### Fields

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `ElementoId` | Yes | Stable unique identifier |
| `titolo` | `NonEmptyString` | Yes | Primary label |
| `date` | `DataTemporale` | No | At most one temporal value per elemento |
| `nascita` | `DataStorica` | No | Dedicated birth date for `personaggio` |
| `morte` | `DataStorica` | No | Dedicated death date for `personaggio` |
| `tags` | `Tag[]` | Yes | Zero or more registry-backed tags |
| `fonti` | `Fonte[]` | Yes | Scripture/article/other references |
| `media` | `MediaImmagine[]` | Yes | Image-only v1 media set |
| `note` | `string` | Yes | Free-form notes, can be empty string |
| `link` | `ElementoLink[]` | Yes | Bidirectional typed relations |
| `tipoElemento` | `TipoElemento` | Yes | Discriminated union by category |

### TipoElemento variants

| Variant | Additional Fields |
|------|------|
| `personaggio` | `nascita?`, `morte?`, `tribu?`, `ruoli?[]` |
| `guerra` | `fazioni?[]`, `esito?` |
| `profezia` | `stato: attesa | adempiuta | parziale` |
| `regno` | `dettagli?` |
| `periodo` | none |
| `luogo` | `regione?` |
| `evento` | none |

### Invariants

- `titolo` is never empty.
- Each `Elemento` has zero or one general `DataTemporale`.
- `personaggio` may additionally carry dedicated `nascita` and `morte` `DataStorica` values.
- Multi-fulfillment prophecy modeling uses linked elementi, not multiple dates on one elemento.
- All links are stored in forward form on the owning elemento but must be mirrored by inverse link creation/removal rules.
- Deleting an elemento cascades link removal from connected elementi.

### Relationships

- Belongs to one `Workspace`
- References many `TagRegistration` by tag value
- References many `Fonte`
- References many `MediaImmagine`
- Connects to many `Elemento` through `ElementoLink`

## Aggregate: Board

### Fields

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `BoardId` | Yes | Stable unique identifier |
| `nome` | `NonEmptyString` | Yes | User-visible name |
| `selezione` | `SelezioneElementi` | Yes | Fixed or dynamic |
| `ultimaVista` | `BoardView` | No | Last used view |
| `configViste.timeline` | `TimelineConfig` | No | Present once used |
| `configViste.lista` | `ListaConfig` | No | Present once used |
| `configViste.grafo` | `GrafoConfig` | No | Present once used |
| `configViste.genealogia` | `GenealogiaConfig` | No | Present once used |

### SelezioneElementi

| Variant | Fields | Semantics |
|------|------|------|
| `Fissa` | `elementiIds: ElementoId[]` | Manual membership |
| `Dinamica` | `dateFrom?`, `dateTo?`, `tags?[]`, `tipi?[]` | `AND` across categories, `OR` within multi-value categories |

### View Configs

| Config | Fields |
|------|------|
| `TimelineConfig` | `scala`, `tagli[]`, `tagGroups[]` |
| `ListaConfig` | `ordinamento`, `colonneVisibili[]` |
| `GrafoConfig` | `layout`, `filtriLink[]` |
| `GenealogiaConfig` | `radice: ElementoId`, `profondita` |

### Invariants

- The board identity is the saved selection, not the current visual mode.
- Timeline `tagGroups` are visual-only configuration; they do not create a separate persistent domain entity.
- Dynamic selection criteria are evaluated over current workspace data and update automatically.
- Deleting a board never deletes elementi.

### Relationships

- Belongs to one `Workspace`
- References many `Elemento` either directly (`Fissa`) or by rule (`Dinamica`)

## Value Object: DataStorica

| Field | Type | Required | Notes |
|------|------|----------|------|
| `anno` | `PositiveInt` | Yes | Stored positive in both eras |
| `era` | `"aev" | "ev"` | Yes | Displayed as `a.e.v.` / `e.v.` |
| `mese` | `number` | No | Optional month |
| `giorno` | `number` | No | Optional day, valid only when `mese` is present |
| `precisione` | `PrecisioneStorica` | Yes | `esatta`, `circa` |

## Value Object: DataTemporale

| Variant | Fields |
|------|------|
| `Puntuale` | `data: DataStorica` |
| `Range` | `inizio: DataStorica`, `fine: DataStorica` |

### Invariants

- Range start and end are both required when the variant is `Range`.
- Cross-era ranges are valid.
- Elements without dates remain valid but are excluded from timeline rendering.
- `giorno` cannot be stored without `mese`.

## Value Object: TagRegistration

| Field | Type | Required | Notes |
|------|------|----------|------|
| `tag` | `Tag` | Yes | Unique within workspace |
| `elementoDescrittivo` | `ElementoId` | No | Optional explanatory elemento |
| `colore` | `HexColor` | No | Optional UI color hint |

## Value Object: Fonte

| Variant | Fields | Notes |
|------|------|------|
| `scrittura` | `riferimento`, `urlCalcolata` | Store reference text, compute WOL URL |
| `articolo` | `url` | URL only, no offline article body |
| `altro` | `descrizione` | Free-form citation |

## Value Object: MediaImmagine

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `MediaId` | Yes | Stable media identifier |
| `image` | Jazz `co.image()` reference | Yes | Progressive/offline image primitive |
| `nomeFile` | `string` | No | Display metadata |
| `mimeType` | `string` | No | Derived from uploaded file |
| `dimensioneBytes` | `number` | Yes | Used for storage reporting |

## Value Object: ElementoLink

| Field | Type | Required | Notes |
|------|------|----------|------|
| `targetId` | `ElementoId` | Yes | Linked elemento |
| `tipo` | `TipoLink` | Yes | Typed relationship |
| `ruolo` | `RuoloLink` | No | Required for parentela variants |
| `nota` | `string` | No | Optional annotation |

### Supported link types

- `adempimento`
- `causa-effetto`
- `parallelo`
- `successione`
- `parentela`
- `localizzazione`
- `residenza`
- `correlato`

## Value Object: Azione

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `AzioneId` | Yes | Stable action identifier |
| `timestamp` | `IsoDateTime` | Yes | Chronological ordering |
| `autoreId` | `AccountId` | Yes | User that triggered the action |
| `tipo` | `TipoAzione` | Yes | Create/update/delete/link/rollback |
| `payload` | `RollbackPayload` | Yes | Minimal data needed to explain or compensate the action |
| `targetId` | `ElementoId | BoardId | LinkKey` | No | Related entity identifier |

### Invariants

- Rollback is modeled as a new compensating action.
- An unsafe rollback must be rejected with an explicit reason rather than mutating history invisibly.

## State Transitions

### Workspace

- `Created` -> `Populated`: after first elemento/board/tag creation
- `Shared`: after adding other accounts to the owner group

### Elemento

- `Created` -> `Updated`: normal edits
- `Updated` -> `Deleted`: explicit destructive action with undo toast
- `Deleted` -> `Restored`: through compensating rollback action

### Board

- `Created` -> `Configured`: first view/filter change
- `Configured` -> `Deleted`: board removed, underlying elementi untouched

### Azione

- `Recorded` -> `Compensated`: rollback action references and compensates the original action
- `Recorded` -> `BlockedForRollback`: current state prevents safe reversal

## Validation Rules Summary

- Titles are non-empty.
- `giorno` requires `mese` in every `DataStorica`.
- Tags are unique in the registry and never auto-deleted.
- Dynamic board filters use `AND` across categories and `OR` within values.
- Search is simple case-insensitive text matching with empty query = no filter.
- Collaboration roles are only `lettura` and `scrittura`.
- Video media are out of scope for v1.
