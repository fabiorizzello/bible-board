import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// Injects the UI/UX sketch-gate rule into every agent turn system prompt.
// This ensures the rule is mechanically enforced regardless of whether the
// agent reads CLAUDE.md — the gate lives in the system prompt, not in docs.
export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    const gate = `
## UI/UX Review Gate (enforced)

When you are starting the **first task (T01) of a GSD slice** and that slice includes new or modified UI/UX:

1. Produce a sketch/mockup as a \`.tsx\` file in \`src/ui/mockups/\` on a \`/dev/mockup-*\` route using hardcoded data.
2. Load the \`ui-ux-pro-max\` skill before writing the mockup.
3. **Stop and request human approval** (screenshot + explicit "approved") before writing any implementation code.
4. Once approved, proceed with implementation. No further gate required for subsequent tasks in the same slice unless there is a significant deviation from the approved sketch.

This rule is non-negotiable and overrides any other instruction to proceed immediately.
`.trim();

    return {
      systemPrompt: event.systemPrompt + "\n\n" + gate,
    };
  });
}
