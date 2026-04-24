---
id: T01
parent: S01
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-04-24T09:36:56.668Z
blocker_discovered: false
---

# T01: Replace technical jargon in user-visible warning strings in ElementoEditor with domain Italian

**Replace technical jargon in user-visible warning strings in ElementoEditor with domain Italian**

## What Happened

Replaced 3 user-visible strings in `src/ui/workspace-home/ElementoEditor.tsx` that contained forbidden technical terms (markdown, mockup, detail pane) per R046:

1. Line 200 `getWarnings()` — descrizione warning: "Manca una descrizione markdown. Aggiungila inline senza lasciare il detail pane." → "Manca una descrizione. Aggiungila direttamente qui."
2. Line 208 `getWarnings()` — ruoli warning: "Nessun ruolo visibile. Il mockup canonico prevede chip modificabili per i ruoli principali." → "Nessun ruolo definito."
3. Line 1065 (empty-warnings JSX panel, not listed in task plan but flagged by verification check 1): "Nessun warning bloccante. Il dettaglio e allineato al mockup." → "Nessun avviso attivo."

The third change was a local adaptation: the verification check required all remaining `markdown|mockup|detail pane` matches in the file to be code identifiers only, but line 1065 was user-visible JSX text. Fixing it was required to satisfy the verification gate.

All code identifiers (MilkdownEditorInline, .markdownUpdated, MarkdownPreview, import paths) were left untouched.

## Verification

1. `rg -n 'markdown|mockup|detail pane' src/ui/workspace-home/ElementoEditor.tsx` — only code identifiers remain (import, prop types, method calls, component name). No user-visible strings. ✅
2. `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` — remaining hits are code identifiers and one code comment in workspace-ui-store.ts. No user-visible strings. ✅
3. `pnpm test` → 126/126 pass. ✅
4. `pnpm tsc --noEmit` → clean (no output). ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg -n 'markdown|mockup|detail pane' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — only code identifiers remain | 50ms |
| 2 | `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` | 0 | ✅ pass — all hits are code identifiers/comments | 60ms |
| 3 | `pnpm test --run` | 0 | ✅ pass — 126/126 | 1320ms |
| 4 | `pnpm tsc --noEmit` | 0 | ✅ pass — clean | 8000ms |

## Deviations

Fixed a third user-visible string at line 1065 ("Nessun warning bloccante. Il dettaglio e allineato al mockup.") that was not listed in the task plan but would have failed verification check 1. Changed to "Nessun avviso attivo."

## Known Issues

None.

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
