# S07: Revisione ui-ux-pro-max finale + integrated proof

**Goal:** Run ui-ux-pro-max final review on all M007 components, fix any P1/P2 blockers, execute full acceptance verification, and document findings + Jazz scenarios in S07-SUMMARY.md.
**Demo:** Skill eseguita, report salvato; blocker risolti, non-blocker in KNOWLEDGE.md; screenshot prima/dopo (linguaggio, fullheight, notification center, inline success, a11y) in S07-SUMMARY.md

## Must-Haves

- ui-ux-pro-max report documented with pass/flag per priority (P1–P10)
- All blockers (Annulla button touch target) resolved in code
- Non-blocker findings logged to .gsd/KNOWLEDGE.md if any
- All M007 acceptance gates pass: 150+/150 tests, tsc clean, rg toast=0, rg transition-all=0, notifyMutation≥6, h-dvh≥1
- Jazz scenarios A/B/C/D verdicts documented with static evidence (live A/B/C deferred per S06 research — auto-mode cannot open browser)
- S07-SUMMARY.md persisted via gsd_summary_save with before/after state descriptions for linguaggio, fullheight, notification center, inline success, a11y

## Proof Level

- This slice proves: final-assembly — aggregates all M007 slice outputs; real runtime via test suite + tsc + grep gates; human/UAT required=no (static evidence sufficient for auto-mode; live Jazz A/B/C deferred to post-milestone manual verification)

## Integration Closure

Upstream surfaces consumed: S02 computeValidityWarnings, S03 useFieldStatus, S04 notifications-store/Bell/Drawer, S05 a11y patterns, S06 Jazz static audit.
New wiring: one bugfix in NotificationDrawer.tsx:50.
What remains: live-browser confirmation of Jazz scenarios A/B/C — explicitly out-of-scope for auto-mode; noted as M007 exit limitation and carried forward as M002 prerequisite.

## Verification

- Runtime signals: none new. Inspection surfaces: verification command sequence documented in S07-SUMMARY.md is the primary diagnostic surface for future audits. Failure visibility: each gate reports exit code + match count, making regression pinpointable. Redaction: none (no secrets).

## Tasks

- [x] **T01: Fix Annulla button touch target and run ui-ux-pro-max static review** `est:30m`
  Fix the P1/P2 blocker identified in S07-RESEARCH: the Annulla button in NotificationDrawer.tsx:50 uses `h-auto px-2 py-1 min-h-0`, which overrides HeroUI's 36px default and yields ~28px touch height — violates CLAUDE.md §III (≥44px) and ui-ux-pro-max P2. Replace with `min-h-[44px] px-3 py-2` (remove `h-auto` and `min-h-0`) so the hit area meets the tablet-first touch target spec. Keep the text-size/hover classes intact. Then perform the ui-ux-pro-max static review across all M007-new/modified components (NotificationBell.tsx, NotificationDrawer.tsx, notifications-store.ts, useFieldStatus.ts, ElementoEditor.tsx modifications, NavSidebar.tsx modifications). For each priority P1–P10, record verdict (pass / flag / omitted-N-A) and one-line rationale — this report is consumed by T03. Run `pnpm tsc --noEmit` and `pnpm test --run` after the className edit to confirm no regression.
  - Files: `src/ui/workspace-home/NotificationDrawer.tsx`
  - Verify: rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx returns 0 hits; rg -n 'min-h-\[44px\]' src/ui/workspace-home/NotificationDrawer.tsx returns >=1 hit on the Annulla button; pnpm tsc --noEmit exits 0; pnpm test --run reports >=150/150 passing

- [x] **T02: Execute M007 acceptance verification gate sequence** `est:15m`
  Run the full M007 acceptance-criteria verification sequence and capture exit codes + match counts for each gate. Commands (run in this order):

1. `pnpm test --run` — must exit 0 with >=150 passing
2. `pnpm tsc --noEmit` — must exit 0
3. `rg 'toast\(' src/ui/` — must yield 0 hits
4. `rg 'transition-all' src/ui/` — must yield 0 hits
5. `grep -c 'notifyMutation' src/ui/workspace-home/ElementoEditor.tsx` — must be >=6
6. `grep -c 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx` — must be >=1
7. `rg -c 'aria-label' src/ui/workspace-home/NotificationBell.tsx` — must be >=1
8. `rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx` — must be 0 (post-T01)
9. `grep -n 'when.*never' src/main.tsx` — must hit line ~14 (Jazz scenario D confirmation)

Save a transcript file `.gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt` with each command + exit code + output snippet. This transcript is inlined by T03 into S07-SUMMARY.md as evidence. If any gate fails, stop and document the failure in the transcript — do not proceed to T03.
  - Files: `.gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt`
  - Verify: test -f .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt && grep -c 'PASS\|FAIL' .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt returns >=9

- [ ] **T03: Write S07-SUMMARY.md via gsd_summary_save with ui-ux-pro-max report + Jazz verdicts + before/after** `est:45m`
  Compose the S07 summary capturing: (1) ui-ux-pro-max static review report from T01 with per-priority verdict table, (2) acceptance verification evidence block from T02 transcript, (3) Jazz scenarios A/B/C/D static verdicts from S06-RESEARCH (A=PASS expected, B=PARTIAL-FAIL by design, C=N/A with sync:'never', D=CONFIRMED from src/main.tsx:14), (4) before/after state narrative for the five M007 themes: linguaggio di dominio (S01), fullheight layout (S01), notification center (S04), inline success feedback (S03), a11y baseline (S05), (5) known limitation: live-browser confirmation of Jazz A/B/C deferred beyond auto-mode. Persist via `gsd_summary_save` with milestone_id='M007', slice_id='S07', artifact_type='SUMMARY'. If T01 produced non-blocker findings worth preserving, append them to `.gsd/KNOWLEDGE.md` under a dated S07 section before writing the summary.
  - Files: `.gsd/milestones/M007/slices/S07/S07-SUMMARY.md`, `.gsd/KNOWLEDGE.md`
  - Verify: test -f .gsd/milestones/M007/slices/S07/S07-SUMMARY.md && grep -c '^## ' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md returns >=4 && grep -q 'ui-ux-pro-max' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md && grep -q 'Jazz' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md

## Files Likely Touched

- src/ui/workspace-home/NotificationDrawer.tsx
- .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt
- .gsd/milestones/M007/slices/S07/S07-SUMMARY.md
- .gsd/KNOWLEDGE.md
