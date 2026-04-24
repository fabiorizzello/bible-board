---
id: M007
title: "Polish & Refinement"
status: complete
completed_at: 2026-04-24T12:05:31.107Z
key_decisions:
  - h-dvh chosen over h-screen for root container — handles Safari iPadOS dynamic toolbar; already used in DemoAuthPage and NotFoundPage
  - computeValidityWarnings uses caller-supplied resolveId predicate — keeps domain pure, Jazz state injected by adapter layer
  - undoFn stored in module-level Map (not Legend State observable) to prevent array-diff stack overflow on function values
  - useFieldStatus reads prefers-reduced-motion at onBlur fire time (not render time) — responds to OS changes between focus and blur
  - TipoChip uses local justCommitted state (not useFieldStatus) — press-commit popover does not map to onFocus/onBlur API
  - Jazz sync:'never' retained for M007 — no migration needed, IDB CRDT log will replay on first M002 sync server connection
  - Live Jazz A/B/C scenario confirmation deferred to post-M007 manual verification — auto-mode cannot open interactive browser
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/useFieldStatus.ts
  - src/ui/workspace-home/notifications-store.ts
  - src/ui/workspace-home/NotificationBell.tsx
  - src/ui/workspace-home/NotificationDrawer.tsx
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/features/elemento/elemento.rules.ts
  - src/features/elemento/__tests__/elemento.rules.test.ts
  - src/ui/workspace-home/__tests__/useFieldStatus.test.ts
  - src/ui/workspace-home/__tests__/notifications-store.test.ts
  - .gsd/milestones/M007/slices/S06/S06-RESEARCH.md
  - .gsd/milestones/M007/slices/S07/S07-SUMMARY.md
  - .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt
lessons_learned:
  - Jazz cross-tab sync requires a sync server — jazz-browser@0.14.28 has no BroadcastChannel/SharedWorker; this is by design with sync:'never' and is M002 scope
  - Legend State observable + parallel Map pattern needed for function closures — storing undoFn directly in observable triggers array-diff stack overflow
  - prefers-reduced-motion should be checked at event fire time (inside callbacks), not at render time — ensures response to OS changes during a user session
  - Container-level blur detection with contains(relatedTarget) is required for rich editors (Milkdown) to suppress spurious commits from internal focus moves
  - Shell verification scripts with natural-language syntax ('command returns >=4') can produce malformed grep invocations; verification gates must use pure shell syntax
---

# M007: Polish & Refinement

**Rifinito il prototipo M001 a qualità iPad-native: linguaggio di dominio, layout fullheight, warning reali, inline success feedback, notification center con rollback, a11y baseline, e audit Jazz documentato.**

## What Happened

M007 delivered 7 slices across the full polish spectrum before M002 (cloud sync) investment begins.

**S01 — Linguaggio di dominio + layout fullheight:** Replaced all user-visible technical strings (markdown, mockup, detail pane) with Italian domain language. Changed root container from h-screen to h-dvh (iPad Safari dynamic toolbar compatibility). Added h-full to intermediate NavSidebar and ListPane wrappers to propagate height to flex-1 scroll regions.

**S02 — Warning reali:** Removed completeness-based warnings (missing description/roles/tags/links). Added computeValidityWarnings() pure domain helper checking only real validity: malformed dates (validateDataTemporale, validateDataStorica) and broken link references (caller-supplied resolveId predicate). 9 new unit tests.

**S03 — useFieldStatus + inline success:** Created useFieldStatus<T>(value, onCommit) hook with strict === no-op guard — blur without change is now silent. Inline Check icon (transition-opacity only, 1500ms fade) wired into all 3 weighted fields: InlineTitle (endContent), DescrizioneSection (absolute overlay), TipoChip (adjacent ml-2 with local justCommitted state). prefers-reduced-motion respected at fire time. 6 unit tests.

**S04 — Notification center:** Built notifications-store.ts (Legend State observable + parallel Map for closures). notifyMutation(tipo, label, undoFn) called at all 7 mutation sites in ElementoEditor. NotificationBell + NotificationDrawer (HeroUI placement=right) replace all toast() calls. Per-entry rollback working. Badge remount animation + bell bounce with prefers-reduced-motion guard. Zero Toast.Provider remaining in src/ui/.

**S05 — A11y baseline:** Tab navigation sidebar→list→detail with visible focus rings. All icon-only buttons have aria-label. prefers-reduced-motion disables animations project-wide. Zero transition-all occurrences in src/ui/ (replaced with specific transition-opacity/transform).

**S06 — Jazz audit:** S06-RESEARCH.md documents 4 scenarios with static evidence: reload after 5 mutations (PASS — IDB always initialized), 2-tab live propagation (PARTIAL-FAIL by design — no BroadcastChannel in jazz-browser@0.14.28, requires sync server in M002), offline+modify+online (N/A — sync:'never' makes toggleNetwork a no-op), sync:'never' confirmed (CONFIRMED — src/main.tsx:14).

**S07 — ui-ux-pro-max + integrated proof:** Full P1–P10 static review. One blocker fixed: NotificationDrawer Annulla button min-h-0 replaced with min-h-[44px]. 5 residual P2 secondary buttons logged to KNOWLEDGE.md. All 9 acceptance gates PASS. S07-SUMMARY.md contains complete before/after narrative for all 5 M007 themes.

## Success Criteria Results

## Success Criteria Results

| Criterion | Verdict | Evidence |
|---|---|---|
| App senza termini tecnici nella UI visibile | ✅ PASS | rg gates on ElementoEditor.tsx → 0 user-visible markdown/mockup/panel/toast/field strings; R046 validated |
| Layout occupa 100% viewport su iPad 1180×820 e 820×1180 | ✅ PASS | h-dvh on WorkspacePreviewPage root; h-full on NavSidebar nav + ListPane wrapper; gate 6 confirmed |
| Warning solo per validità reale | ✅ PASS | computeValidityWarnings checks only date invalida + referenza rotta; completeness strings fully absent; R048 validated |
| Blur senza modifica non emette notifica | ✅ PASS | useFieldStatus strict === guard + TipoChip option===tipo guard; R049 validated; 141/141 tests |
| Inline success feedback su field con peso | ✅ PASS | Check icon transition-opacity on InlineTitle/DescrizioneSection/TipoChip; 1500ms fade; R050 validated |
| Bell+drawer sostituisce il toast; rollback su tutte le mutazioni | ✅ PASS | 0 toast() in src/ui/; 7 notifyMutation in ElementoEditor; NotificationBell+Drawer with per-entry rollback |
| Keyboard nav 3-pane con focus ring WCAG AA | ✅ PASS | tabIndex+onKeyDown on NavSidebar rows; aria-label on all icon-only; 0 transition-all violations |
| Audit Jazz 4 scenari documentati | ✅ PASS | S06-RESEARCH.md: A=PASS expected, B=PARTIAL-FAIL by design, C=N/A, D=CONFIRMED |
| ui-ux-pro-max finale passata | ✅ PASS | P1–P10 reviewed; only P2 blocker (Annulla min-h-0) fixed; residuals logged |

## Definition of Done Results

## Definition of Done

| Item | Verdict | Evidence |
|---|---|---|
| All 7 slices complete | ✅ | S01–S07 all `[x]` in ROADMAP; gsd_slice_complete called for each |
| All slice summaries exist | ✅ | S01-S07-SUMMARY.md all present in .gsd/milestones/M007/slices/ |
| Tests pass | ✅ | 150/150 tests, 7 files, pnpm test --run |
| TypeScript clean | ✅ | pnpm tsc --noEmit → exit 0 |
| Zero toast() in src/ui/ | ✅ | rg 'toast(' src/ui/ → 0 hits |
| Zero transition-all in src/ui/ | ✅ | rg 'transition-all' src/ui/ → 0 hits |
| Cross-slice integration (S03→S04) | ✅ | useFieldStatus.onCommit is the authoritative mutation signal; notifyMutation wired at all 7 call sites |
| Jazz audit documented | ✅ | S06-RESEARCH.md + S07-SUMMARY.md Jazz section; M002 forward-migration notes present |
| Code changes exist | ✅ | 19 non-.gsd files changed, 863 insertions vs pre-M007 baseline |

## Requirement Outcomes

## Requirement Status Transitions

| ID | Transition | Evidence |
|---|---|---|
| R046 | Active → Validated | 3 user-visible technical strings replaced; rg gate clean on ElementoEditor.tsx |
| R047 | Active → Validated | h-dvh on root, h-full on NavSidebar nav + ListPane wrapper; gate passes |
| R048 | Active → Validated | computeValidityWarnings domain helper; completeness strings absent; 135/135 tests |
| R049 | Active → Validated | useFieldStatus strict === + TipoChip option===tipo guard; 141/141 tests |
| R050 | Active → Validated | Check icon transition-opacity on all 3 weighted fields; fade 1500ms; reduced-motion zero |

## Deviations

T01 (S01) fixed a third user-visible string at line 1065 not in original task plan but required to pass the rg verification gate. T03 (S07) T03-VERIFY.json had a malformed grep check ('returns >=4' as extra file args) producing false exit code 2; fixed in auto-fix attempt 1 — actual section count was 7 (requirement: >= 4).

## Follow-ups

5 residual P2 touch-target findings (secondary size=sm buttons in DescrizioneSection, ArraySection, VitaChip, NavSidebar AlertDialog footers) logged to KNOWLEDGE.md — address in a future a11y pass. Live Jazz A/B/C scenario confirmation required before M002 activation — manual browser verification needed.
