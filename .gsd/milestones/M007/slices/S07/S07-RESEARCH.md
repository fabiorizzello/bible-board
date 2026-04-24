# S07 Research: Revisione ui-ux-pro-max finale + integrated proof

**Calibration:** Light research — all technologies known, patterns established across S01–S06. S07 is a quality gate + verification slice, not a feature slice. Risk is low: potential minor touch-target fix on "Annulla" button in NotificaRow, plus Jazz live-browser confirmation deferred from S06.

---

## Summary

S07 is the final quality gate for M007. It has three responsibilities:

1. **ui-ux-pro-max code review** — static review of all new components from this milestone against the skill's priority rules; fix any blockers, log non-blockers to KNOWLEDGE.md.
2. **Integrated proof** — run all acceptance criteria verification checks (grep + tests + tsc) to confirm no regressions across the full milestone.
3. **S07-SUMMARY.md** — document findings, Jazz scenario verdicts, and before/after state descriptions.

No new UI components needed. Auto-mode cannot open a browser; Jazz scenarios A/B/C (deferred from S06) must be documented with their static evidence and expected verdicts only.

---

## Current Codebase State

**All upstream gates pass:**

| Check | Result |
|---|---|
| `pnpm test --run` | 150/150 ✅ |
| `pnpm tsc --noEmit` | clean (exit 0) ✅ |
| `rg 'toast\(' src/ui/` | 0 hits ✅ |
| `rg 'transition-all' src/ui/` | 0 hits ✅ |
| `rg 'notifyMutation' src/ui/` | 7 sites (6 ElementoEditor + 1 DetailPane) ✅ |
| `grep -n 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx` | line 126: `flex h-dvh bg-panel font-body` ✅ |

**User-visible technical strings check:** `bg-panel`, `VALIDITY_FIELD_MAP`, `PanelLeft` (lucide icon component name), `EditableFieldId`, `field:` (TS object key) — all are code identifiers, not user-visible text. R046 remains validated.

---

## New Components to Review (ui-ux-pro-max)

### Files added in M007 not previously reviewed:
- `src/ui/workspace-home/NotificationBell.tsx` (56 lines)
- `src/ui/workspace-home/NotificationDrawer.tsx` (98 lines)
- `src/ui/workspace-home/notifications-store.ts`
- `src/ui/workspace-home/useFieldStatus.ts` (73 lines)

### Files heavily modified:
- `src/ui/workspace-home/ElementoEditor.tsx` (1690 lines) — notifyMutation wiring, useFieldStatus, inline Check icons, validity warnings
- `src/ui/workspace-home/NavSidebar.tsx` — keyboard nav, NotificationBell insertion

---

## ui-ux-pro-max Priority Findings (Static Analysis)

### P1 — Accessibility

**NotificationBell:**
- ✅ `aria-label={ariaLabel}` — dynamic ("Notifiche" / "Notifiche, N nuove")
- ✅ `isIconOnly` — HeroUI handles `aria-label` requirement
- ✅ Badge `aria-hidden="true"` — decorative element correctly hidden
- ✅ `prefers-reduced-motion` guard on bell bounce via `window.matchMedia`

**NotificationDrawer:**
- ✅ `Drawer.Dialog aria-label="Centro notifiche"` — dialog landmark labeled
- ✅ `role="list"` + `role="listitem"` on notification list + rows
- ✅ `aria-label="Notifiche recenti"` on the list container
- ✅ Icon spans are `aria-hidden="true"` — pure decoration
- ✅ `Drawer.CloseTrigger` has explicit `h-[44px] w-[44px]` — touch target ok

**Potential blocker (P1 + P2):**
- ⚠️ `Annulla` Button in `NotificaRow`: `h-auto px-2 py-1 min-h-0` — `min-h-0` explicitly overrides HeroUI's default 36px minimum height. Resulting touch target will be `~28px` (padding: 4px top + bottom + ~20px text). This violates the ≥44px touch target rule (CLAUDE.md §III, ui-ux-pro-max P2).
  - **Fix:** Replace with explicit `min-h-[44px]` or wrap with adequate padding so the hit area meets spec. Alternatively, use `py-2.5` and remove `h-auto min-h-0` to inherit ≥44px from HeroUI Button defaults.
  - **Scope:** Single className change in `NotificationDrawer.tsx:48`.

### P2 — Touch & Interaction

- ✅ NotificationBell: explicit `h-[44px] w-[44px]`
- ✅ Drawer.CloseTrigger: explicit `h-[44px] w-[44px]`
- ⚠️ "Annulla" button: see P1 above — same issue
- ✅ All other buttons in ElementoEditor and NavSidebar verified ≥44px in S01/S05

### P7 — Animation

- ✅ Badge pulse: `animate-[pulse_300ms_ease-out]` — duration in 150–300ms range
- ✅ Bell bounce: `animate-[bounce_150ms_ease-out_1]` — duration 150ms, fires once
- ✅ Both guarded by `prefers-reduced-motion` (badge via CSS @media in tokens.css; bell via JS `window.matchMedia`)
- ✅ Check icon fade-out: `transition-opacity duration-300` — opacity only, no layout
- ✅ `prefers-reduced-motion` resets Check icon immediately (checked at fire time per useFieldStatus)
- ✅ Zero `transition-all` in src/ui/

### P8 — Forms & Feedback

- ✅ Inline Check icon shows success state without intrusive overlay
- ✅ Blur without change produces no feedback (R049 fix)
- ✅ Validation errors inline near field via `FieldError` (HeroUI RAC)
- ✅ Drawer is consultable on-demand — not an overlay

### Other categories (P3–P6, P9–P10):

No new images (P3 N/A), style consistent across components (P4 ✅), no responsive concerns for tablet-only target (P5 N/A for this context), color tokens used consistently — `text-ink-hi`, `text-ink-dim`, `bg-panel`, `text-primary` (P6 ✅), drawer navigation predictable (P9 ✅), no charts (P10 N/A).

---

## Jazz Scenarios (S06 Deferred)

Scenarios A/B/C require live browser execution. Auto-mode cannot confirm them. The executor should document these with static evidence in S07-SUMMARY.md using the verdicts and rationale from S06-RESEARCH.md.

| Scenario | Verdict | Evidence type |
|---|---|---|
| A: Reload dopo 5 mutazioni | PASS (expected) | Static: IDB always initialized, DemoAuth in localStorage |
| B: 2 tab propagano | PARTIAL-FAIL (by design) | Static: no BroadcastChannel, live tab sync requires sync server (M002 scope) |
| C: Offline + online resync | PASS / N/A | Static: `sync:'never'` makes network state irrelevant; IDB writes always succeed |
| D: sync:'never' intenzionale | CONFIRMED | Code: `src/main.tsx:14`, 0 JAZZ env vars in codebase |

---

## Implementation Landscape

### Files to modify

| File | Change |
|---|---|
| `src/ui/workspace-home/NotificationDrawer.tsx` | Fix `Annulla` button touch target (remove `h-auto min-h-0`, use `py-2.5` or explicit `min-h-[44px]`) |

### Files to create

| File | Content |
|---|---|
| `.gsd/milestones/M007/slices/S07/S07-SUMMARY.md` | Full milestone review summary (via `gsd_summary_save`) |

### Verification commands (executor runs in order)

```bash
pnpm test --run                                      # must be 150/150
pnpm tsc --noEmit                                    # must be clean
rg 'toast\(' src/ui/                                 # must be 0
rg 'transition-all' src/ui/                          # must be 0
grep -c 'notifyMutation' src/ui/workspace-home/ElementoEditor.tsx  # ≥6
grep -c 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx     # ≥1
rg -c 'aria-label' src/ui/workspace-home/NotificationBell.tsx      # ≥1
rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx       # must be 0 after fix
grep -n 'when.*never' src/main.tsx                   # line 14 confirms sync intent
```

---

## Tasks for Planner

**T01 — Fix Annulla button touch target + run ui-ux-pro-max review:**
- Edit `NotificationDrawer.tsx:48`: remove `h-auto min-h-0`, ensure ≥44px touch area
- Log all review findings with verdict (pass/flag/omitted)

**T02 — Run all acceptance criteria checks:**
- Execute verification command sequence above
- Confirm all pass, document evidence

**T03 — Write S07-SUMMARY.md via gsd_summary_save:**
- Include: review report (P1–P9), Jazz scenarios A/B/C static verdicts + D confirmation, before/after state descriptions for linguaggio/fullheight/notification center/inline success/a11y
- Mark slice complete
