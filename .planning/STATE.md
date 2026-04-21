---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-04-17T20:20:17.356Z"
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 8
  completed_plans: 3
  percent: 38
---

# GSD State

**Active Milestone:** M002: Prototipo completo su layout 3-pane consolidato
**Active Slice:** S02: Editor inline per-campo, annotazioni, soft delete
**Phase:** in-progress (R001-R004 verified, R005 inline per-campo refactor pending via plan 02-03)
**Requirements Status:** 11 active · 4 validated · 4 deferred · 0 out of scope

## Milestone Registry

- 🔄 **M002:** Prototipo completo su layout 3-pane consolidato
  - ✅ S01: Recupero layout 3-pane consolidato con dark mode (UAT PASS 2026-04-03)
  - 🔄 S02: Editor inline per-campo, annotazioni, soft delete — R001-R004 consegnati via plan 02-01/02-02 (VERIFIED 3/3 2026-04-13); R005 (inline per-campo refactor) pending via nuovo plan 02-03
  - ⬜ S03: Fonti e link editor inline
  - ⬜ S04: Board CRUD e ricerca
  - ⬜ S05: Timeline D3 SVG con zoom/pan e popup
  - ⬜ S06: Polish iPad-native e UAT finale

## Recent Decisions

- 2026-04-17: Discuss S02 completed for R005 replan. `src/ui/mockups/UnifiedEditorMockup.tsx` is now the primary canonical reference for `02-03`; prior R005 sketches remain supporting rationale only. `02-03` should map the unified mockup directly, exclude S03 scope explicitly, and keep dev-only mockups available through milestone M002.
- 2026-04-15: Fold S02.1 back into S02. The inline per-campo refactor is UX polish on the same editor capability S02 already delivers, not a new slice boundary, so it becomes R005 in S02's scope — executed via a new plan 02-03. S02.1 phase row removed from ROADMAP; sketch HTML artifacts moved to `.planning/phases/02-editor-annotazioni/sketches/`. S02 reopens with R001-R004 verified + R005 pending.
- 2026-04-15: [SUPERSEDED by fold-back above] S02.1 inserted after S02 via /gsd:insert-phase. Scope crystallized: inline per-campo paradigm (no mode swap, `editingFieldId` replaces `isEditing`), data-driven empty field display + `+ aggiungi campo` menu, collegamento picker as HeroUI popover, Milkdown (MIT) for `descrizione` as markdown string (`Elemento.descrizione: string` invariato), S02 contract 100% preservato (`ElementoInput`, `normalizeElementoInput`, 8 `ElementoTipo`, `ElementoError`).
- 2026-04-13: S02 gap closure (plan 02-02) extended `ElementoInput`/`NormalizedElementoInput` with 7 type-specific fields + `tipo_specifico_non_ammesso` error variant; editor refactored to exhaustive switch over 8 `ElementoTipo`. 3/3 must-haves verified.

## Blockers

- None

## Accumulated Context

### Roadmap Evolution

- 2026-04-15: Phase S02.1 folded back into S02. Rationale: keeping S02.1 as a separate slice created artificial bookkeeping overhead (two slices for one editor capability). The inline per-campo refactor is UX polish, not a new boundary. Fold moves work to a new plan 02-03 inside S02 scope, with R005 as the tracked requirement. Sketches preserved in `02-editor-annotazioni/sketches/`.
- 2026-04-15: [Superseded] Phase S02.1 inserted after S02: Editor app-native refactor inline per-campo (URGENT) — driven by S02 UX debrief recognizing that the mode-swap "Modifica" pattern is not app-native iPad feeling per CLAUDE.md constitution; must be replaced by Notion/Linear-style inline per-field editing before S03 lands more form surface.

## Next Action

Discuss complete for R005. Use `.planning/phases/02-editor-annotazioni/02-CONTEXT.md` as the locked input for the replan. Next step: create `02-03-PLAN.md` via `/gsd:plan-phase 02`, treating `src/ui/mockups/UnifiedEditorMockup.tsx` as the primary canonical reference and the remaining R005 mockups as supporting rationale only.
