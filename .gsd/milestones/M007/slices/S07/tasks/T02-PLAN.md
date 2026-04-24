---
estimated_steps: 11
estimated_files: 1
skills_used: []
---

# T02: Execute M007 acceptance verification gate sequence

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

## Inputs

- ``src/ui/workspace-home/NotificationDrawer.tsx``
- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx``
- ``src/ui/workspace-home/NotificationBell.tsx``
- ``src/main.tsx``

## Expected Output

- ``.gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt``

## Verification

test -f .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt && grep -c 'PASS\|FAIL' .gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt returns >=9

## Observability Impact

Verification transcript is the primary post-hoc diagnostic surface for M007 regression detection — each gate line includes command, exit code, and match count so a future agent can reproduce the exact failure path.
