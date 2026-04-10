# Migrate gsd-cc: Archive + Fresh Reinstall — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Archive the current local `get-shit-done-cc` installation and project data, then reinstall fresh from npm v1.34.2 to reset the project to a clean gsd-cc baseline using the new `.planning/` directory scheme.

**Architecture:** Atomic `mv` operations into `.archive-gsd-cc-2026-04-10/`, reset `.claude/settings.json` to `{}`, re-run `npx get-shit-done-cc@latest --claude --local` which rewrites `.claude/{get-shit-done,commands/gsd,agents,hooks,settings.json,package.json,gsd-file-manifest.json}`. The `.gsd` symlink (gsd-pi global runtime, "gsd-2") is left untouched. The `.claude/skills/` directory (non-gsd skills: codebase-patterns, review-codebase, review-findings-fixer, ui-ux-pro-max) is left untouched.

**Tech Stack:** `mv`, `rm`, `npx`, git. No application code involved.

**Design doc:** `docs/plans/2026-04-10-migrate-gsd-cc-fresh-design.md`

---

## Preflight invariants

- Current branch: `009-action-log` (not main)
- `.gsd` is a symlink → do NOT follow or touch
- `.claude/skills/` is git-tracked → do NOT touch
- Archive path: `.archive-gsd-cc-2026-04-10/` at repo root
- Working directory: `/home/fabio/dev/board`

---

### Task 1: Add archive path to .gitignore before creating it

**Files:**
- Modify: `.gitignore` (append at end)

**Why first:** If a later step fails, we don't want `git status` to show the archive as untracked noise. Adding the ignore rule before the directory exists is safe.

**Step 1:** Append to `.gitignore`:

```
# ── gsd-cc migration archive (2026-04-10) ──
.archive-gsd-cc-2026-04-10/
```

**Step 2:** Verify:
```bash
grep -c 'archive-gsd-cc-2026-04-10' .gitignore
```
Expected: `1`

**Step 3:** Commit:
```bash
git add .gitignore
git commit -m "chore: ignore gsd-cc migration archive directory"
```

---

### Task 2: Create archive root + README

**Files:**
- Create: `.archive-gsd-cc-2026-04-10/README.md`

**Step 1:** Create directories:
```bash
mkdir -p .archive-gsd-cc-2026-04-10/claude
```

**Step 2:** Write `.archive-gsd-cc-2026-04-10/README.md`:

```markdown
# gsd-cc migration archive — 2026-04-10

This directory contains the local `get-shit-done-cc` installation that lived
in `.claude/` before being replaced by a fresh reinstall of the same package
(v1.34.2) on 2026-04-10.

## Why

The project was migrated from a stateful gsd-cc install (with accumulated
hooks, custom settings, and legacy `.gsd/` runtime state via `gsd-pi` symlink)
to a clean v1.34.2 baseline. The new version uses `.planning/` instead of
`.gsd/` as its project data directory, so the migration is essentially a
reset of the tool layer without touching project source code.

## What is NOT in here

- `.gsd` (symlink to `/home/fabio/.gsd/projects/bbc293be6eb1`) — belongs to
  `gsd-pi` global runtime ("gsd-2"), out of scope for this migration.
- `.claude/skills/` (codebase-patterns, review-codebase, review-findings-fixer,
  ui-ux-pro-max) — non-gsd skills, preserved in place.

## Restore procedure

If you need to roll back this migration:

1. Remove the fresh install:
   ```bash
   rm -rf .claude/get-shit-done .claude/commands/gsd .claude/agents .claude/hooks
   rm -f .claude/gsd-file-manifest.json .claude/package.json .claude/settings.json
   ```
2. Move archive contents back:
   ```bash
   mv .archive-gsd-cc-2026-04-10/claude/get-shit-done .claude/
   mv .archive-gsd-cc-2026-04-10/claude/commands .claude/
   mv .archive-gsd-cc-2026-04-10/claude/agents .claude/
   mv .archive-gsd-cc-2026-04-10/claude/hooks .claude/
   mv .archive-gsd-cc-2026-04-10/claude/gsd-file-manifest.json .claude/
   mv .archive-gsd-cc-2026-04-10/claude/package.json .claude/
   mv .archive-gsd-cc-2026-04-10/claude/settings.json .claude/
   ```
3. Remove the archive directory and the `.gitignore` entry.
```

**Step 3:** Verify:
```bash
ls -la .archive-gsd-cc-2026-04-10/ && cat .archive-gsd-cc-2026-04-10/README.md | head -5
```
Expected: directory listing + first 5 lines of README.

---

### Task 3: Archive `.claude/get-shit-done/`

**Files:**
- Move: `.claude/get-shit-done/` → `.archive-gsd-cc-2026-04-10/claude/get-shit-done/`

**Step 1:** Move:
```bash
mv .claude/get-shit-done .archive-gsd-cc-2026-04-10/claude/get-shit-done
```

**Step 2:** Verify:
```bash
[ ! -e .claude/get-shit-done ] && [ -f .archive-gsd-cc-2026-04-10/claude/get-shit-done/VERSION ] && cat .archive-gsd-cc-2026-04-10/claude/get-shit-done/VERSION
```
Expected: `1.34.2`

---

### Task 4: Archive `.claude/commands/` (entire subtree)

**Rationale:** The only content in `.claude/commands/` is `gsd/`. Moving the whole `commands/` directory is cleaner than moving only `gsd/` and leaving an empty parent.

**Step 1:** Confirm `.claude/commands/` only contains `gsd/`:
```bash
ls .claude/commands/
```
Expected: `gsd`

**Step 2:** Move:
```bash
mv .claude/commands .archive-gsd-cc-2026-04-10/claude/commands
```

**Step 3:** Verify:
```bash
[ ! -e .claude/commands ] && ls .archive-gsd-cc-2026-04-10/claude/commands/gsd/ | wc -l
```
Expected: count around 70 (number of .md commands)

---

### Task 5: Archive `.claude/agents/` (only gsd-* — entire directory if only gsd)

**Step 1:** Check `.claude/agents/` contents:
```bash
ls .claude/agents/ | grep -v '^gsd-' | wc -l
```
Expected: `0` (only gsd-* files exist)

**Step 2:** If count was 0, move whole directory:
```bash
mv .claude/agents .archive-gsd-cc-2026-04-10/claude/agents
```

If count > 0: stop and report — some non-gsd agent exists, manual decision needed.

**Step 3:** Verify:
```bash
[ ! -e .claude/agents ] && ls .archive-gsd-cc-2026-04-10/claude/agents/ | wc -l
```
Expected: 23

---

### Task 6: Archive `.claude/hooks/` (only gsd-*)

**Step 1:** Check `.claude/hooks/` contents:
```bash
ls .claude/hooks/ | grep -v '^gsd-' | wc -l
```
Expected: `0`

**Step 2:** If 0, move whole directory:
```bash
mv .claude/hooks .archive-gsd-cc-2026-04-10/claude/hooks
```

**Step 3:** Verify:
```bash
[ ! -e .claude/hooks ] && ls .archive-gsd-cc-2026-04-10/claude/hooks/ | wc -l
```
Expected: 9

---

### Task 7: Archive single files (manifest + package.json + settings.json)

**Files:**
- Move: `.claude/gsd-file-manifest.json` → archive
- Move: `.claude/package.json` → archive
- Copy: `.claude/settings.json` → archive (keep original in place for Task 8)

**Step 1:** Move manifest + package.json:
```bash
mv .claude/gsd-file-manifest.json .archive-gsd-cc-2026-04-10/claude/gsd-file-manifest.json
mv .claude/package.json .archive-gsd-cc-2026-04-10/claude/package.json
```

**Step 2:** Copy settings.json (will be reset in Task 8):
```bash
cp .claude/settings.json .archive-gsd-cc-2026-04-10/claude/settings.json
```

**Step 3:** Verify:
```bash
[ ! -e .claude/gsd-file-manifest.json ] && [ ! -e .claude/package.json ] && [ -f .archive-gsd-cc-2026-04-10/claude/settings.json ] && grep -c 'gsd-' .archive-gsd-cc-2026-04-10/claude/settings.json
```
Expected: count ≥ 9 (references to gsd hooks)

---

### Task 8: Reset `.claude/settings.json` to empty object

**Files:**
- Overwrite: `.claude/settings.json`

**Step 1:** Overwrite with empty JSON object:

Write content: `{}\n` to `.claude/settings.json`.

**Step 2:** Verify:
```bash
cat .claude/settings.json
```
Expected: `{}`

---

### Task 9: Verify `.claude/` pre-install state

**Step 1:** List remaining `.claude/` contents:
```bash
ls -la .claude/
```
Expected: only `skills/`, `settings.json`, `.`, `..`

**Step 2:** Confirm no gsd artifacts remain:
```bash
find .claude -maxdepth 2 -name 'gsd*' -o -name 'get-shit-done*' | wc -l
```
Expected: `0`

---

### Task 10: Run fresh install via npx

**Step 1:** Run:
```bash
npx --yes get-shit-done-cc@latest --claude --local
```

**Expected behavior:**
- Downloads v1.34.2 (or latest if bumped)
- Writes `.claude/get-shit-done/`, `.claude/commands/gsd/`, `.claude/agents/`, `.claude/hooks/`, `.claude/settings.json` (with hooks), `.claude/package.json`, `.claude/gsd-file-manifest.json`
- Does NOT create `.planning/` (that's created on first workflow run)
- Does NOT touch `.claude/skills/`
- Does NOT touch `.gsd` symlink

**Step 2:** If the installer blocks on an interactive prompt despite `--claude --local`, cancel with Ctrl+C and fall back to:
```bash
mkdir -p /tmp/gsd-install && cd /tmp/gsd-install && npm pack get-shit-done-cc@latest && tar -xzf get-shit-done-cc-*.tgz && cd /home/fabio/dev/board && node /tmp/gsd-install/package/bin/install.js --claude --local
```

---

### Task 11: Post-install verification

**Step 1:** Check VERSION:
```bash
cat .claude/get-shit-done/VERSION
```
Expected: `1.34.2` (or higher if latest has advanced)

**Step 2:** Check commands populated:
```bash
ls .claude/commands/gsd/ | wc -l
```
Expected: > 0 (around 70 commands)

**Step 3:** Check settings.json has fresh hooks:
```bash
grep -c 'gsd-' .claude/settings.json
```
Expected: > 0

**Step 4:** Confirm `.claude/skills/` untouched:
```bash
ls .claude/skills/
```
Expected: `codebase-patterns`, `review-codebase`, `review-findings-fixer`, `ui-ux-pro-max` (and `cerca-offerte.md` if present — it's user-global actually, ignore)

**Step 5:** Confirm `.gsd` symlink intact:
```bash
readlink .gsd
```
Expected: `/home/fabio/.gsd/projects/bbc293be6eb1`

**Step 6:** Confirm archive directory intact:
```bash
cat .archive-gsd-cc-2026-04-10/claude/get-shit-done/VERSION
```
Expected: `1.34.2`

---

### Task 12: Final git status check

**Step 1:** Run:
```bash
git status --short
```

**Expected:**
- `.claude/get-shit-done/`, `.claude/commands/`, `.claude/agents/`, `.claude/hooks/`, `.claude/gsd-file-manifest.json`, `.claude/package.json`, `.claude/settings.json` → still `??` untracked (they were untracked before too)
- `docs/` → `??` untracked (contains the design doc + this plan)
- `.archive-gsd-cc-2026-04-10/` → absent from status (gitignored)
- No unexpected deletions of tracked files

**Step 2:** Verify no tracked files were lost:
```bash
git diff --stat HEAD
```
Expected: empty output (only `.gitignore` modification committed in Task 1).

---

## Execution notes

- Each task's "Step N" is a 30-60 second atomic action.
- Tasks 1-9 are reversible without side effects (just file moves).
- Task 10 is the only step that downloads external artifacts and is harder to reverse — but rollback is documented in the archive README.
- The commit in Task 1 is the only git commit in this plan; all other file changes remain untracked for the user to review and commit manually.
