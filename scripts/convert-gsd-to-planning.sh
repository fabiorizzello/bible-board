#!/usr/bin/env bash
# Convert .gsd/ (gsd-pi methodology tree) into .planning/ (get-shit-done-cc layout).
# Idempotent: destroys .planning/ and rebuilds. Leaves .gsd symlink untouched.

set -euo pipefail

SRC=".gsd"
DST=".planning"

if [[ ! -e "$SRC" ]]; then
  echo "ERROR: $SRC not found" >&2
  exit 1
fi

rm -rf "$DST"
mkdir -p "$DST/phases"

# ── Root-level methodology files (skip runtime/ephemeral) ──
for f in PROJECT.md REQUIREMENTS.md KNOWLEDGE.md DECISIONS.md STATE.md \
         PREFERENCES.md OVERRIDES.md FUTURE.md USER-SCENARIOS.md DATA-MODEL.md; do
  if [[ -f "$SRC/$f" ]]; then
    cp "$SRC/$f" "$DST/$f"
    echo "  root: $f"
  fi
done

# ── Milestone ROADMAP → .planning/ROADMAP.md ──
cp "$SRC/milestones/M002/M002-ROADMAP.md" "$DST/ROADMAP.md"
echo "  root: ROADMAP.md (from M002-ROADMAP.md)"

# ── Slice → phase conversion ──
# slice_id | phase_num | slug             | type     | depends_on
SLICES=(
  "S01|01|layout-3pane|refactor|[]"
  "S02|02|editor-annotazioni|feature|[\"01-01\"]"
  "S03|03|fonti-link-editor|feature|[\"01-01\"]"
  "S04|04|board-crud|feature|[\"01-01\"]"
  "S05|05|timeline-d3|feature|[\"01-01\",\"04-01\"]"
  "S06|06|polish-uat|test|[\"01-01\",\"02-01\",\"03-01\",\"04-01\",\"05-01\"]"
)

for entry in "${SLICES[@]}"; do
  IFS='|' read -r SLICE NN SLUG TYPE DEPS <<<"$entry"
  SRC_DIR="$SRC/milestones/M002/slices/$SLICE"
  PHASE_DIR="$DST/phases/$NN-$SLUG"
  PLAN_ID="$NN-01"

  [[ -d "$SRC_DIR" ]] || { echo "  skip: $SLICE (source missing)"; continue; }

  mkdir -p "$PHASE_DIR"

  # PLAN.md: prepend frontmatter, strip source BOM/frontmatter if any
  SRC_PLAN="$SRC_DIR/${SLICE}-PLAN.md"
  DST_PLAN="$PHASE_DIR/${PLAN_ID}-PLAN.md"
  {
    cat <<FM
---
phase: "$NN-$SLUG"
plan: "$PLAN_ID"
type: "$TYPE"
wave: 1
depends_on: $DEPS
files_modified: []
autonomous: true
must_haves:
  truths: []
  artifacts: []
---

FM
    cat "$SRC_PLAN"
  } > "$DST_PLAN"
  echo "  phase: $NN-$SLUG/${PLAN_ID}-PLAN.md"

  # RESEARCH / ASSESSMENT sidecars
  [[ -f "$SRC_DIR/${SLICE}-RESEARCH.md"   ]] && cp "$SRC_DIR/${SLICE}-RESEARCH.md"   "$PHASE_DIR/RESEARCH.md"   && echo "    + RESEARCH.md"
  [[ -f "$SRC_DIR/${SLICE}-ASSESSMENT.md" ]] && cp "$SRC_DIR/${SLICE}-ASSESSMENT.md" "$PHASE_DIR/ASSESSMENT.md" && echo "    + ASSESSMENT.md"

  # tasks/ subtree (T##-PLAN.md, T##-SUMMARY.md, T##-VERIFY.json)
  if [[ -d "$SRC_DIR/tasks" ]] && [[ -n "$(ls -A "$SRC_DIR/tasks" 2>/dev/null)" ]]; then
    mkdir -p "$PHASE_DIR/tasks"
    cp -r "$SRC_DIR/tasks/." "$PHASE_DIR/tasks/"
    echo "    + tasks/ ($(ls "$PHASE_DIR/tasks" | wc -l) files)"
  fi
done

echo
echo "Done. .planning/ tree:"
find "$DST" -maxdepth 3 -type f | sort
