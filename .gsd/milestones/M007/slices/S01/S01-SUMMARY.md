---
id: S01
parent: M007
milestone: M007
provides:
  - ["UI senza termini tecnici user-visible (stringhe italiane di dominio)", "Root layout fullheight (h-dvh) propagato a NavSidebar e ListPane via h-full", "Classi Tailwind uniformi per altezza container — base stabile per S02, S03, S05 focus management"]
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["h-dvh chosen over h-screen for root container — handles Safari iPadOS dynamic toolbar; already used in DemoAuthPage.tsx and NotFoundPage.tsx", "h-full added to intermediate wrapper divs in NavSidebar and ListPane — flex stretch only propagates one level, inner wrappers need explicit height for scroll regions to clip correctly", "Third user-visible string at line 1065 fixed opportunistically — not in task plan but required to pass the rg verification gate"]
patterns_established:
  - ["h-dvh on root layout container (not h-screen) for iPad Safari compatibility", "h-full on every intermediate flex wrapper that contains a flex-1 overflow-y-auto scroll region", "Italian domain language for all user-visible UI strings — code identifiers (MilkdownEditorInline, MarkdownPreview, bg-panel) remain in English"]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-24T09:40:44.163Z
blocker_discovered: false
---

# S01: Linguaggio di dominio e layout fullheight

**Replaced all technical jargon from user-visible UI strings and fixed fullheight layout so the app fills the iPad viewport without external scrolling.**

## What Happened

S01 delivered two independent changes that establish the language and layout baseline for all subsequent M007 slices.

**T01 — Domain language (R046):** Three user-visible strings in `ElementoEditor.tsx` contained forbidden technical terms (markdown, mockup, detail pane). All three were rewritten in Italian domain language:
- "Manca una descrizione markdown. Aggiungila inline senza lasciare il detail pane." → "Manca una descrizione. Aggiungila direttamente qui."
- "Nessun ruolo visibile. Il mockup canonico prevede chip modificabili per i ruoli principali." → "Nessun ruolo definito."
- "Nessun warning bloccante. Il dettaglio e allineato al mockup." → "Nessun avviso attivo." (discovered during verification; not in original task plan but required to pass the rg gate)

All code identifiers (MilkdownEditorInline, .markdownUpdated, MarkdownPreview, import paths, CSS token bg-panel) were left untouched per scope constraints. The remaining markdown/mockup hits in the codebase are all code identifiers or a single code comment in workspace-ui-store.ts — none are user-visible text.

**T02 — Fullheight layout (R047):** Three targeted className changes were applied:
1. `WorkspacePreviewPage.tsx` root div: `h-screen` → `h-dvh` — tracks Safari iPadOS dynamic toolbar correctly (100dvh vs 100vh overflow).
2. `NavSidebar.tsx` `<nav>`: added `h-full` — the outer flex-shrink-0 wrapper stretches via root, but the nav needed an explicit height to bound the inner ScrollShadow flex-1 scroll region.
3. `ListPane.tsx` inner `w-[300px]` div: added `h-full` — same pattern as NavSidebar.

DetailPane.tsx (`flex flex-1 flex-col overflow-hidden`) and FullscreenOverlay.tsx (`fixed inset-0`) were already correct and intentionally left untouched.

**Build note:** `pnpm build` reports pre-existing TypeScript errors in unrelated files (elemento.adapter.ts, DemoAuthPage.tsx, timeline-d3.ts, display-helpers.test.ts); confirmed not introduced by S01 via git diff. `pnpm tsc --noEmit` passes cleanly.

## Verification

1. `rg -n 'markdown|mockup|detail pane' src/ui/workspace-home/ElementoEditor.tsx` → only code identifiers (MilkdownEditorInline, .markdownUpdated, MarkdownPreview, import). Zero user-visible strings. ✅
2. `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` → all hits are code identifiers or a single code comment in workspace-ui-store.ts. Zero user-visible strings. ✅
3. `rg -n 'h-screen' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 0 hits. ✅
4. `rg -n 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 1 hit at line 130 on root div. ✅
5. `rg -n 'h-full' src/ui/workspace-home/NavSidebar.tsx` → 1 hit at line 102 on `<nav>`. ✅
6. `rg -n 'h-full' src/ui/workspace-home/ListPane.tsx` → 1 hit at line 148 on inner wrapper. ✅
7. `pnpm test --run` → 126/126 pass. ✅
8. `pnpm tsc --noEmit` → exit 0, clean. ✅

## Requirements Advanced

None.

## Requirements Validated

- R046 — T01 PASS 2026-04-24: 3 user-visible technical strings replaced in ElementoEditor.tsx; rg gate clean; 126/126 tests pass
- R047 — T02 PASS 2026-04-24: h-dvh on root, h-full on NavSidebar nav and ListPane inner div; all rg checks pass; 126/126 tests pass, tsc clean

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

T01 fixed a third user-visible string ("Nessun avviso attivo.") at line 1065 that was not in the original task plan but was required to pass the rg verification gate. T02 build step (pnpm build) has pre-existing failures in unrelated files; confirmed not introduced by S01 via git diff; tsc --noEmit passes cleanly.

## Known Limitations

Visual viewport verification (iPad Safari dynamic toolbar) was performed via code inspection and rg checks only — not confirmed via live browser automation on physical device or iOS simulator. The layout fix is structurally correct per Tailwind documentation and consistent with existing app patterns.

## Follow-ups

None.

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx` — 
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — 
- `src/ui/workspace-home/NavSidebar.tsx` — 
- `src/ui/workspace-home/ListPane.tsx` — 
