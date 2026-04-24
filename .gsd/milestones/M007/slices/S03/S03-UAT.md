# S03: Hook useFieldStatus + inline success + fix toast no-op — UAT

**Milestone:** M007
**Written:** 2026-04-24T10:11:33.670Z

# S03 UAT — Hook useFieldStatus + inline success + fix toast no-op

## Preconditions

- Dev server running (`pnpm dev`)
- iPad viewport: 1180×820 landscape (or browser DevTools set to same)
- An existing Workspace with at least one Elemento visible in the list
- Open an Elemento in the detail pane (click from list)

---

## TC-01: Blur InlineTitle without change → no feedback, no toast

1. Click the element title field to focus it (InlineTitle input)
2. Do NOT change the text
3. Click outside the input (blur without modification)
4. **Expected**: No toast appears. No check icon becomes visible. Status remains idle. No network/Jazz mutation fired.

---

## TC-02: Blur InlineTitle with real change → Check fades in then out

1. Click the element title field to focus it
2. Edit the title text (change at least one character)
3. Click outside to blur
4. **Expected**: A `✓` Check icon appears inside the right side of the title input (endContent zone), visible at full opacity
5. Wait 1.5 seconds
6. **Expected**: The Check icon fades to opacity 0 and disappears. No toast.

---

## TC-03: Blur DescrizioneSection without change → no feedback, no toast

1. Click inside the Descrizione (Milkdown) editor to focus it
2. Do NOT type anything
3. Click outside the editor container to blur
4. **Expected**: No toast. No Check icon visible. No commit fired.

---

## TC-04: Blur DescrizioneSection with real change → Check overlay appears

1. Click inside the Descrizione editor
2. Type additional text or modify existing content
3. Click outside the editor container to blur
4. **Expected**: A small `✓` icon appears at the bottom-right corner of the editor container (absolute overlay), fades to opacity 0 after 1.5 seconds

---

## TC-05: TipoChip re-select same type → no feedback, no toast

1. Observe the current element type chip (e.g. "Persona")
2. Click the chip to open the type selection popover
3. Click the same type that is already selected
4. **Expected**: Popover closes. No Check icon adjacent to chip. No toast emitted. commitPatch not called.

---

## TC-06: TipoChip select different type → Check icon appears adjacent

1. Click the tipo chip to open the popover
2. Select a different type (e.g. change "Persona" → "Luogo")
3. **Expected**: Popover closes. The element type chip updates. A `✓` icon appears immediately to the right of the chip (ml-2 adjacent), fades out after 1.5 seconds.

---

## TC-07: prefers-reduced-motion — immediate reset (manual system test)

1. In OS/browser settings, enable "Reduce motion" (or use DevTools media emulation: `prefers-reduced-motion: reduce`)
2. Repeat TC-02 (edit title + blur)
3. **Expected**: Check icon appears and immediately disappears (no 1.5s animation delay). No visible fade transition.

---

## TC-08: Rapid blur/re-focus does not stack timers

1. Click InlineTitle, change text, blur (Check appears)
2. Immediately click the same field again (focus), change text again, blur
3. **Expected**: Only one Check icon visible at a time. Timer resets on re-commit — icon does not flicker or stay permanently.

---

## Edge Cases

- **Jazz external update while focused**: If another session updates the element title while this user has the title focused, blurring without local changes should still be a no-op (the hook syncs `prevRef` via `useEffect` only when not in an active edit).
- **Element switch**: Switching to a different element while a field is focused should not leave orphaned Check icons in the previous element's fields.
