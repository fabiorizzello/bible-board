---
phase: complete
phase_name: milestone-completion
project: bible-board
generated: "2026-04-23T12:30:00Z"
counts:
  decisions: 8
  lessons: 8
  patterns: 6
  surprises: 4
missing_artifacts: []
---

### Decisions

- **editingFieldId replaces page-level isEditing.** Chose per-field inline editing (editingFieldId discriminated union) over a page-level mode toggle (isEditing boolean). Rationale: multiple fields can be in different states without a full page-mode switch; drawer/popover for composite flows, body-native for scalars — matches UnifiedEditorMockup canon.
  Source: S02-SUMMARY.md/key_decisions

- **Blur-to-save + 5s toast undo as unified commit grammar.** Every field mutation emits an Annulla toast whose closure re-normalizes and re-commits the pre-snapshot value. No explicit Save/Cancel buttons anywhere. Rationale: single reversible pattern, zero cognitive overhead, consistent with native app feel.
  Source: S02-SUMMARY.md/key_decisions

- **FonteTipo union = scrittura|articolo-wol|pubblicazione|link|altro for M001.** Video deferred to M004; old `articolo` removed. Rationale: minimal viable set for biblical study; video requires Mediator API work.
  Source: S03-SUMMARY.md/key_decisions

- **Atomic bidirectional link writes via single observable.set().** Both source and target entity overrides are patched in a single `observable.set(...)` call. Rationale: prevents reactive subscribers from observing half-patched state (only forward link exists momentarily).
  Source: S03-SUMMARY.md/key_decisions

- **Boards stored as co.list(BoardSchema) (first-class Jazz CoMaps) in WorkspaceSchema.** Not string ID list. Rationale: allows inline resolution and CRDT ownership; enables per-board metadata without extra lookups.
  Source: S04-SUMMARY.md/key_decisions

- **D3 manages all SVG DOM in timeline-d3.ts; Timeline.tsx is a pure React lifecycle shell.** No React-rendered SVG elements per Principio IV. Rationale: D3 needs direct DOM control for transitions, scales, zoom, and pan; React interference causes stuttering.
  Source: S05-SUMMARY.md (inferred from ROADMAP + git diff)

- **Jazz persistence migration as a dedicated slice (S08) after UI demo (S03).** Delivering UI features and Jazz wiring together in S03 created scope overload risk. Rationale: demo contract on mock store first, then dedicated Jazz migration slice.
  Source: S03-SUMMARY.md/key_decisions + S03-SUMMARY.md/Deviations

- **syncJazzX() + lastModified bump as canonical Jazz→LegendState sync pattern.** Jazz CoValue mutations do not propagate automatically to Legend State computed values. Rationale: explicit bridge required; bump triggers Legend State selector re-evaluation.
  Source: S04-SUMMARY.md/patterns_established

### Lessons

- **HeroUI v3 Chip does not expose onClose.** Replace with `<button><X/></button>` inside children. Training data on HeroUI v3 is sparse and unreliable — always read local .heroui-docs/ before assuming API shape.
  Source: S02-SUMMARY.md/key_decisions

- **buildElementoInput must use spread, not mutation.** ElementoInput fields are readonly; direct assignment produces TS2540 errors. Spread-based construction is the correct pattern.
  Source: S02-SUMMARY.md/key_decisions

- **ScalarChip blur-to-save needs a skipBlur ref to distinguish Escape from blur.** Without the ref, pressing Escape triggers a blur event that commits the cancelled value. skipBlur must be set synchronously in the keydown handler before the blur fires.
  Source: S02-SUMMARY.md/patterns_established

- **Filter link parentela by predicate on link.tipo, never by array index.** Index-based filtering breaks silently when link order changes (new links prepended or sorted). Type predicate is invariant.
  Source: S02-SUMMARY.md/key_decisions

- **Stale worktree symlinks in .gsd/worktrees/ cause phantom vitest failures.** After a worktree is cleaned up, remaining symlinks make vitest discover test files whose module paths no longer resolve, producing "Cannot find module" failures. Fix: add .gsd/worktrees to vitest test.exclude.
  Source: S02-SUMMARY.md/Known Limitations + S03-SUMMARY.md/Verification

- **Jazz→LegendState reactivity requires explicit lastModified bump after CoValue mutations.** Jazz observable changes do not automatically propagate to Legend State computed values (useSelector/computed). Without the bump, UI stays stale after Jazz writes.
  Source: S04-SUMMARY.md/patterns_established

- **FONTE_TIPO_LABEL and FONTE_TIPI_IN_SCOPE must be colocated with their rendering helper.** Separate constants drift from the picker. Single source of truth: colocate picker constants with getFontiGroupedByTipo in display-helpers.ts.
  Source: S03-SUMMARY.md/patterns_established

- **Annotazione as first-class Elemento (not a separate entity) simplifies the domain.** A "tipo" discriminator on the same Elemento struct avoids parallel entity trees, allows the same CRUD, editor, and fonti infrastructure to apply uniformly.
  Source: S02-SUMMARY.md/patterns_established

### Patterns

- **Commit-and-undo grammar for collection mutations.** Pure helper on readonly array → atomic store commit → 5s Annulla toast whose closure calls the inverse helper. Consistent at both field level (S02) and collection level (S03 fonti/links). Extend to any future mutable collection.
  Source: S03-SUMMARY.md/patterns_established

- **Atomic bidirectional writes pattern.** A single observable.set(...) returns a top-level record patched for both affected entity IDs. Never two sequential writes for bidirectional mutations. Prevents intermediate reactive state.
  Source: S03-SUMMARY.md/patterns_established

- **Compile-time exhaustiveness guard on ElementoTipo switches.** `const _exhaustive: never = tipo` at the default branch of every switch on the discriminated union. Zero runtime overhead; TypeScript catches missing variants at build time.
  Source: S02-SUMMARY.md/patterns_established

- **Board.CRUD returns Result<_, BoardError> with console.debug event emission.** Typed errors + observable side effects for future action log (M004). Pattern for all domain mutations that need an audit trail.
  Source: S04-SUMMARY.md/patterns_established

- **D3 standalone module + React lifecycle shell.** `timeline-d3.ts` is a pure D3 module (class or function) holding refs and D3 state. `Timeline.tsx` is a React component that owns the DOM ref, mounts/unmounts the module, and bridges lifecycle events. No React inside D3, no D3 inside React render.
  Source: S05 (ROADMAP + git diff evidence: timeline-d3.ts + Timeline.tsx)

- **sortElementi: BC dates normalized to negative numbers.** BC `DataStorica` values become negative numbers for sort comparison; undated elements use `Infinity` sentinel (sorted last). Avoids string comparison errors on the timeline axis.
  Source: S04-SUMMARY.md/patterns_established

### Surprises

- **S03 Jazz migration scope was silently dropped by executors.** The S03 goal explicitly stated Jazz CRDT migration (schema, adapter, provider). Executors delivered UI-only on mock store. The deviation wasn't surfaced until slice completion. Detection: cross-reference Must-Have checklist with delivered files before marking a slice done.
  Source: S03-SUMMARY.md/Deviations

- **HeroUI v3 API differs substantially from v2 and training data.** Multiple components (Chip, TagGroup, ListBox) had breaking API changes. `onClose` removed from Chip; ListBox intercepts keyboard/focus incompatibly with inline rename. Must read local .heroui-docs/ before any HeroUI usage.
  Source: S02-SUMMARY.md/key_decisions + S04-SUMMARY.md/key_decisions

- **Monolith decomposition unlocked feature delivery.** Splitting the 785-line WorkspacePreviewPage in S01 made every subsequent slice straightforward to implement in isolation. The architectural investment in S01 paid compound returns in S02–S08.
  Source: S01-SUMMARY.md/What was delivered

- **ruoliStr CSV serialization for optional CoMap list fields.** Jazz `co.list()` optional fields create schema complexity. Serializing role arrays as CSV strings in CoMap fields sidesteps optional-nested-list typing issues in Jazz schema definitions.
  Source: S04-SUMMARY.md/patterns_established (inferred from PROJECT.md architecture notes)
