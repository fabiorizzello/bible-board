---
id: S06
parent: M007
milestone: M007
provides:
  - ["S06-RESEARCH.md con 4 scenari Jazz documentati + verdetti + evidenza code-level", "Scenario D (sync:never) CONFIRMED da codice — grep verifiable", "Scenari A/B/C analizzati staticamente, verdict attesi documentati, DEFERRED live confirmation a S07", "Forward Intelligence per M002: attivazione sync, primo handshake IDB→peer, DemoAuth→PasskeyAuth migration path"]
requires:
  - slice: S04
    provides: notification center come canale per errori sync futuri (non attivato in M007, consumato a livello architetturale)
affects:
  - ["S07", "M002"]
key_files:
  - [".gsd/milestones/M007/slices/S06/S06-RESEARCH.md", "src/main.tsx"]
key_decisions:
  - ["Scenari A/B/C flagged DEFERRED-TO-S07: auto-mode non ha browser interattivo; verdetti basati su analisi statica completa di Jazz runtime internals (createBrowserContext.js, LocalStorageKVStore, IDB peer)", "Scenario D verificato da codice senza browser: grep è prova definitiva per config intenzionale", "Forward Intelligence for M002 aggiunta al research doc per catturare il path di attivazione sync e la migrazione DemoAuth→PasskeyAuth"]
patterns_established:
  - ["Jazz audit statico: per config flags (sync:'never', storage default) il codice è prova sufficiente senza browser — grep/rg su src/ è verifica definitiva", "Scenari runtime (persistence, multi-tab, offline) richiedono browser interattivo: documentare verdetti attesi con rationale statico e delegare conferma live a fase con operatore umano"]
observability_surfaces:
  - ["Diagnostic command: grep -n 'when.*never' src/main.tsx — mostra config sync intenzionale", "Diagnostic command: rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts — verifica assenza env vars Jazz non attesi"]
drill_down_paths:
  - [".gsd/milestones/M007/slices/S06/tasks/T01-SUMMARY.md"]
duration: ""
verification_result: passed
completed_at: 2026-04-24T11:04:44.354Z
blocker_discovered: false
---

# S06: Audit Jazz reale con 4 scenari browser

**S06-RESEARCH.md completed with 4 Jazz scenario verdicts + evidence and Forward Intelligence for M002 sync activation path.**

## What Happened

S06 was a pure research slice with no application code changes. The deliverable was completing the pre-existing S06-RESEARCH.md with a concrete "Verdicts & Evidence" section covering all 4 Jazz audit scenarios, plus a "Forward Intelligence for M002" section capturing the sync activation path.

**Scenario D (sync:'never' intentional) — CONFIRMED from code:**
`grep -n 'when.*never' src/main.tsx` returned line 14 (`sync={{ when: "never" }}`). `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` returned 0 matches — no Jazz env vars exist anywhere in the codebase, confirming the intent is fully deliberate and not an oversight.

**Scenarios A/B/C — DEFERRED-TO-S07 for live browser confirmation:**
- Scenario A (reload persistence): Verdict PASS (expected). IDB peer always initialized; DemoAuth credentials survive localStorage; Jazz reconstructs full CRDT state on reload. Static analysis of `createBrowserContext.js` + `LocalStorageKVStore` confirms the mechanism.
- Scenario B (multi-tab propagation): Verdict PARTIAL/EXPECTED-FAIL. jazz-browser@0.14.28 has no BroadcastChannel or SharedWorker. Live cross-tab updates require a sync server (M002 scope). Tab 2 sees mutations only after manual reload.
- Scenario C (offline+online resync): Verdict PASS (local mutations) / N/A (resync). With `sync:'never'`, `toggleNetwork()` is a no-op; DevTools Offline has zero effect on Jazz. All mutations land in IDB regardless of network state.

**Forward Intelligence for M002:**
Three items documented: (a) sync activation one-liner (`when: "signedUp", peer: VITE_JAZZ_PEER_URL`), (b) first IDB→peer handshake behavior (bilateral CRDT diff, all M007 data auto-uploaded, no migration script), (c) DemoAuth→PasskeyAuth swap path (`useDemoAuth` → `usePasskeyAuth` in auth-context.tsx; existing DemoAuth accounts not forward-migratable due to different identity anchors).

**No blockers discovered.** No application code was modified. Pipeline verified clean: TSC exit 0, 150/150 tests passed.

## Verification

1. `grep -n 'when.*never' src/main.tsx` → line 14 `sync={{ when: "never" }}` (exit 0) ✅
2. `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` → 0 matches (exit 1 = no hits, as expected) ✅
3. `grep 'storage' src/main.tsx` → no output (IDB is default, no explicit storage prop) ✅
4. `pnpm tsc --noEmit` → clean (exit 0) ✅
5. `pnpm test --run` → 150/150 passed (exit 0) ✅
6. S06-RESEARCH.md contains 'Verdicts & Evidence' section (1 match via grep -c) ✅
7. S06-RESEARCH.md contains 'Forward Intelligence for M002' section (1 match via grep -c) ✅

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

Nessuna deviazione dal piano. Scenario D grep checks hanno restituito esattamente quanto previsto. Nessun blocker scoperto.

## Known Limitations

Scenari A, B, C hanno verdetti attesi (non confermati live) in attesa di esecuzione manuale con browser interattivo in S07. Scenario B (multi-tab) è PARTIAL/EXPECTED-FAIL by design — live cross-tab sync è scope M002.

## Follow-ups

S07 (ui-ux-pro-max finale) deve includere: (1) conferma live degli scenari A/B/C con operatore umano su dev server, (2) verifica che i verdetti attesi combacino con il comportamento osservato, (3) aggiornamento S06-RESEARCH.md se necessario. M002 deve leggere la sezione 'Forward Intelligence' come input per la pianificazione del sync layer.

## Files Created/Modified

- `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md` — Added 'Verdicts & Evidence' section (4 sub-sections, one per scenario) and 'Forward Intelligence for M002' section
