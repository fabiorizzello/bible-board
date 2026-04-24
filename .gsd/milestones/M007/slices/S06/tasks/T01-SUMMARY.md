---
id: T01
parent: S06
milestone: M007
key_files:
  - `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`
key_decisions:
  - Scenarios A/B/C flagged as DEFERRED-TO-S07 for live browser confirmation — auto-mode has no interactive browser; verdicts derived from complete static analysis of Jazz runtime internals
  - Scenario D fully confirmed from code alone — no live browser needed
  - Forward Intelligence for M002 added to research doc to capture activation path and DemoAuth→PasskeyAuth migration notes
duration: 
verification_result: passed
completed_at: 2026-04-24T11:02:52.264Z
blocker_discovered: false
---

# T01: Completed S06-RESEARCH.md with Verdicts & Evidence section (4 scenarios) and Forward Intelligence for M002 (sync activation, IDB handshake, DemoAuth→PasskeyAuth migration)

**Completed S06-RESEARCH.md with Verdicts & Evidence section (4 scenarios) and Forward Intelligence for M002 (sync activation, IDB handshake, DemoAuth→PasskeyAuth migration)**

## What Happened

The research doc at `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md` already contained complete static analysis of Jazz runtime internals (createBrowserContext.js, LocalStorageKVStore, IDB storage). T01 appended two new sections:

**Verdicts & Evidence** (4 sub-sections):
- Scenario A (reload persistence): Verdict PASS (expected) — DEFERRED-TO-S07 for live confirmation. Rationale: IDB peer is always initialized; DemoAuth credentials survive localStorage; Jazz reconstructs full CRDT state on reload.
- Scenario B (multi-tab propagation): Verdict PARTIAL/EXPECTED-FAIL — DEFERRED-TO-S07. No BroadcastChannel or SharedWorker in jazz-browser@0.14.28; live cross-tab updates require a sync server (M002 scope). Tab 2 sees mutation after manual reload.
- Scenario C (offline+online): Verdict PASS (local mutations) / N/A (resync) — DEFERRED-TO-S07. With `sync:'never'`, `toggleNetwork()` is a no-op; DevTools Offline has zero effect on Jazz. All mutations go to IDB regardless.
- Scenario D (sync:'never' intentional): Verdict CONFIRMED INTENTIONAL. Fully verified via code: `grep -n 'when.*never' src/main.tsx` → line 14; `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` → 0 matches; no `storage` prop on JazzProvider; TSC clean; 150 tests pass.

**Forward Intelligence for M002**:
- (a) How to activate sync: change `when: "never"` to `when: "signedUp", peer: import.meta.env.VITE_JAZZ_PEER_URL`
- (b) First IDB→peer handshake: Jazz sends known-state vectors for all local CoValues; remote responds with missing transactions (bilateral diff); all M007 data auto-uploaded, no migration script needed.
- (c) DemoAuth→PasskeyAuth: replace `useDemoAuth` with `usePasskeyAuth` in auth-context.tsx; no schema changes; existing DemoAuth accounts are not forward-migratable (different identity anchors).

No application code was modified. No unexpected findings — Scenario D grep checks returned exactly what the plan predicted.

## Verification

1. `grep -n 'when.*never' src/main.tsx` → line 14 confirms `sync={{ when: "never" }}` (exit 0)
2. `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` → 0 matches (exit 1 = no hits found, as expected)
3. `grep 'storage' src/main.tsx` → no output (IDB is default, no explicit storage prop)
4. `pnpm tsc --noEmit` → clean, exit 0
5. `pnpm test --run` → 150/150 passed, exit 0
6. S06-RESEARCH.md now contains 'Verdicts & Evidence' section with 4 sub-sections and 'Forward Intelligence for M002' section

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'when.*never' src/main.tsx` | 0 | ✅ pass | 50ms |
| 2 | `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` | 1 | ✅ pass (0 matches = no Jazz env vars) | 80ms |
| 3 | `grep 'storage' src/main.tsx` | 1 | ✅ pass (IDB is default, no explicit storage prop) | 40ms |
| 4 | `pnpm tsc --noEmit` | 0 | ✅ pass | 4200ms |
| 5 | `pnpm test --run` | 0 | ✅ pass — 150/150 tests | 705ms |

## Deviations

None — execution matched the task plan exactly. Scenario D grep checks returned 0 unexpected findings.

## Known Issues

Scenarios A, B, C have expected (not confirmed) verdicts pending live browser execution in S07. S07 requires a human operator with an interactive browser session.

## Files Created/Modified

- ``.gsd/milestones/M007/slices/S06/S06-RESEARCH.md``
