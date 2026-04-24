---
id: T04
parent: S05
milestone: M007
key_files:
  - src/ui/mockups/MockupsIndex.tsx
  - src/ui/mockups/UnifiedEditorMockup.tsx
  - src/ui/mockups/CommitInteractionMockup.tsx
key_decisions:
  - Used transition-[opacity,transform] as the replacement for all transition-all occurrences — consistent with CONSTITUTION.md §iPad-Native Feel and KNOWLEDGE.md pattern (animate only opacity/transform)
duration: 
verification_result: passed
completed_at: 2026-04-24T10:53:12.491Z
blocker_discovered: false
---

# T04: Replaced all 4 transition-all occurrences in mockup files with transition-[opacity,transform] — rg zero hits, tsc clean, 150/150 tests green

**Replaced all 4 transition-all occurrences in mockup files with transition-[opacity,transform] — rg zero hits, tsc clean, 150/150 tests green**

## What Happened

The slice AC required `rg 'transition-all' src/ui/` → zero hits. Four occurrences remained in three mockup files:\n\n1. `MockupsIndex.tsx:175` — card Link hover shadow (`transition-all` → `transition-[opacity,transform]`)\n2. `MockupsIndex.tsx:243` — ArrowRight icon translate animation (`transition-all` → `transition-[opacity,transform]`)\n3. `UnifiedEditorMockup.tsx:1895` — toast notification fade/slide (`transition-all duration-200` → `transition-[opacity,transform] duration-200`)\n4. `CommitInteractionMockup.tsx:274` — toast notification fade/slide (`transition-all duration-200` → `transition-[opacity,transform] duration-200`)\n\nAll changes were purely class renames — no logic, no markup structure, no other attributes touched. The `duration-200` modifier was preserved where present. The replacement pattern follows CONSTITUTION.md §iPad-Native Feel: animate only `opacity` and `transform`, never `width`, `height`, `top`, `left` (which force reflow).

## Verification

Ran `rg 'transition-all' src/ui/` → exit 1 (no matches). Ran `pnpm tsc --noEmit` → exit 0. Ran `pnpm test --run` → 150/150 tests passed in 710ms.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg 'transition-all' src/ui/` | 1 | ✅ pass (zero matches) | 50ms |
| 2 | `pnpm tsc --noEmit` | 0 | ✅ pass | 8000ms |
| 3 | `pnpm test --run` | 0 | ✅ pass (150/150) | 710ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/mockups/MockupsIndex.tsx`
- `src/ui/mockups/UnifiedEditorMockup.tsx`
- `src/ui/mockups/CommitInteractionMockup.tsx`
