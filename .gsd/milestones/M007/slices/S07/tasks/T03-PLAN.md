---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T03: Write S07-SUMMARY.md via gsd_summary_save with ui-ux-pro-max report + Jazz verdicts + before/after

Compose the S07 summary capturing: (1) ui-ux-pro-max static review report from T01 with per-priority verdict table, (2) acceptance verification evidence block from T02 transcript, (3) Jazz scenarios A/B/C/D static verdicts from S06-RESEARCH (A=PASS expected, B=PARTIAL-FAIL by design, C=N/A with sync:'never', D=CONFIRMED from src/main.tsx:14), (4) before/after state narrative for the five M007 themes: linguaggio di dominio (S01), fullheight layout (S01), notification center (S04), inline success feedback (S03), a11y baseline (S05), (5) known limitation: live-browser confirmation of Jazz A/B/C deferred beyond auto-mode. Persist via `gsd_summary_save` with milestone_id='M007', slice_id='S07', artifact_type='SUMMARY'. If T01 produced non-blocker findings worth preserving, append them to `.gsd/KNOWLEDGE.md` under a dated S07 section before writing the summary.

## Inputs

- ``.gsd/milestones/M007/slices/S07/S07-VERIFICATION.txt``
- ``.gsd/milestones/M007/slices/S07/S07-RESEARCH.md``
- ``.gsd/milestones/M007/slices/S06/S06-RESEARCH.md``
- ``.gsd/milestones/M007/M007-ROADMAP.md``

## Expected Output

- ``.gsd/milestones/M007/slices/S07/S07-SUMMARY.md``

## Verification

test -f .gsd/milestones/M007/slices/S07/S07-SUMMARY.md && grep -c '^## ' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md returns >=4 && grep -q 'ui-ux-pro-max' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md && grep -q 'Jazz' .gsd/milestones/M007/slices/S07/S07-SUMMARY.md
