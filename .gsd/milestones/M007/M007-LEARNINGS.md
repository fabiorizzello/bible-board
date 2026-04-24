---
phase: M007
phase_name: Polish & Refinement
project: timeline-board
generated: 2026-04-24T12:10:00Z
counts:
  decisions: 7
  lessons: 5
  patterns: 6
  surprises: 3
missing_artifacts: []
---

### Decisions

- **h-dvh over h-screen for root container.** Chose h-dvh because Safari iPadOS has a dynamic toolbar that collapses on scroll — h-screen (100vh) overflows; h-dvh (100dvh) tracks the actual visible viewport. h-full required on every intermediate flex wrapper to propagate height to scrollable regions.
  Source: S01-SUMMARY.md/Key Decisions

- **computeValidityWarnings uses caller-supplied resolveId predicate.** Chose predicate injection over passing the full Jazz CoMap list. Keeps domain layer pure — no Jazz imports. Callers supply a `(id: string) => boolean` backed by a fresh Set<string> of non-deleted IDs each render.
  Source: S02-SUMMARY.md/Key Decisions

- **undoFn stored in module-level Map, not Legend State observable.** Chose parallel Map pattern because storing function values inside Legend State observables triggers an array-diff stack overflow when the observable is modified. The observable holds notification metadata; the Map holds the closure by ID.
  Source: S04-SUMMARY.md/Key Decisions

- **useFieldStatus reads prefers-reduced-motion at fire time, not render time.** Chose fire-time check (inside onBlur/setTimeout callback) so the hook responds to OS setting changes that occur between focus and blur. Render-time check would be stale.
  Source: S03-SUMMARY.md/Key Decisions

- **TipoChip uses local justCommitted state instead of useFieldStatus.** The hook's onFocus/onBlur contract doesn't map to press-commit popovers. Chose local state + setTimeout with same prefers-reduced-motion check at fire time — consistent approach without forcing the wrong abstraction.
  Source: S03-SUMMARY.md/Key Decisions

- **Jazz sync:'never' retained through M007.** No migration needed; IDB CRDT transaction log will replay automatically on first M002 sync server connection. DemoAuth → PasskeyAuth migration will require fresh accounts (existing M007 data is not forward-migrated).
  Source: S06-RESEARCH.md/Scenario D

- **Jazz live A/B/C scenario confirmation deferred.** Auto-mode cannot open an interactive browser. Static analysis of jazz-browser@0.14.28 source provides high-confidence verdicts. Live confirmation is an explicit M007 exit limitation and M002 prerequisite.
  Source: S07-SUMMARY.md/Known Limitations

### Lessons

- **Jazz cross-tab sync is not available with sync:'never'.** jazz-browser@0.14.28 has no BroadcastChannel or SharedWorker. Two tabs see each other's mutations only after a page reload (IDB read). Live cross-tab propagation requires a sync server — this is M002 scope, not a bug.
  Source: S06-RESEARCH.md/Scenario B

- **Legend State function values cause array-diff stack overflow.** Storing closures (undoFn) directly in a Legend State observable array triggers an infinite diff loop. Pattern fix: hold metadata in the observable, closures in a parallel module-level Map keyed by notification ID.
  Source: S04-SUMMARY.md/Key Decisions

- **Container-level blur detection required for Milkdown.** Milkdown moves focus internally between sub-elements. Attaching onBlur directly to Milkdown fires spuriously. Fix: attach to the container div and check `event.currentTarget.contains(event.relatedTarget)` — only commit if focus leaves the entire container.
  Source: S03-SUMMARY.md/Patterns Established

- **Shell verification scripts with natural-language syntax produce malformed commands.** Writing `grep -c '^## ' file.md returns >=4` as a single shell expression causes grep to interpret 'returns' and '>=4' as extra file arguments (exit 2). Verification gates must use pure POSIX shell syntax; natural-language annotations belong in comments only.
  Source: S07/T03-VERIFY.json

- **prefers-reduced-motion must be checked at event fire time.** Users can toggle the OS setting between focusing and blurring a field. Checking at render time caches the value and misses mid-session changes. Check inside the onBlur handler / setTimeout callback for live responsiveness.
  Source: S03-SUMMARY.md/Key Decisions

### Patterns

- **notifications-store: Legend State observable + parallel Map for closures.** Keep notification metadata (type, label, ts, undone) in a Legend State observable array for reactive rendering. Store undoFn in a module-level `Map<NotificaId, () => void>` to avoid array-diff stack overflow on function values.
  Source: S04-SUMMARY.md/Patterns Established

- **useFieldStatus<T>(value, onCommit) — shared state machine for blur-to-save fields.** onFocus captures prevRef; onBlur(next) does strict === comparison and calls onCommit(prev, next) only if different. Success state resets after 1500ms (0ms if prefers-reduced-motion). No HeroUI/Jazz imports — pure React.
  Source: S03-SUMMARY.md/Patterns Established

- **Three inline-success presentation variants by control type.** endContent prop for HeroUI Input; absolute bottom-2 right-2 overlay for Milkdown/textarea; adjacent ml-2 for popover triggers. All use transition-opacity only — never width/height/top/left.
  Source: S03-SUMMARY.md/Patterns Established

- **h-dvh on root container; h-full on every intermediate flex wrapper.** h-dvh handles Safari iPadOS dynamic toolbar. Every intermediate wrapper between root and a flex-1 overflow-y-auto scroll region needs explicit h-full — flex stretch only propagates one level.
  Source: S01-SUMMARY.md/Patterns Established

- **9-gate acceptance checklist for iPad-native quality.** Each gate: named command + exit code + match count criterion. Independently runnable. Gates: test count, tsc, toast() count, transition-all count, notifyMutation count, h-dvh presence, aria-label presence, min-h-0 absence, sync mode confirmation.
  Source: S07-SUMMARY.md/M007 Acceptance Verification Gates

- **computeValidityWarnings domain helper with predicate injection.** Pure domain function in elemento.rules.ts; caller supplies `resolveId: (id: string) => boolean` backed by fresh Jazz state. Field-mapping constants at module level (VALIDITY_FIELD_MAP, VALIDITY_LABEL_MAP) for domain→UI translation without per-render object creation.
  Source: S02-SUMMARY.md/Patterns Established

### Surprises

- **A third user-visible technical string was discovered during verification, not during implementation.** The rg gate for S01 caught a string at line 1065 ("Nessun avviso attivo." — previously "Nessun warning bloccante. Il dettaglio e allineato al mockup.") that wasn't in the task plan. Fixed opportunistically to pass the gate.
  Source: S01-SUMMARY.md/Deviations

- **T03-VERIFY.json false negative from malformed grep command.** The verification string `grep -c '^## ' file.md returns >=4` was written as a single shell expression; grep interpreted 'returns' and '>=4' as file paths → exit code 2. S07-SUMMARY.md had 7 sections (>= 4 required). Fixed in auto-fix attempt 1 by correcting the VERIFY.json and re-running verification.
  Source: S07/T03-VERIFY.json

- **Jazz cross-tab live propagation assumed but not designed.** S06 research revealed that jazz-browser@0.14.28 does not include BroadcastChannel/SharedWorker. The M007 scope had assumed local-only behavior was sufficient, which it is — but the absence of live cross-tab sync is a design boundary, not an oversight, and was explicitly documented as M002 scope.
  Source: S06-RESEARCH.md/Scenario B
