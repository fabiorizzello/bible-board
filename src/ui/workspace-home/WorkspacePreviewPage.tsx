/**
 * WorkspacePreviewPage — thin composition shell.
 *
 * Assembles the 3-pane layout from extracted components:
 * NavSidebar, ListPane, DetailPane, ThemeSwitcher, FullscreenOverlay.
 *
 * Mounts Toast.Provider here (composition shell level) so imperative
 * `toast()` calls from any pane render into a shared bottom region.
 * iPad-native: bottom placement keeps undo affordances near the thumb.
 */

import { Dropdown, Label, Toast } from "@heroui/react";
import { Plus } from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { NavSidebar } from "./NavSidebar";
import { ListPane } from "./ListPane";
import { DetailPane } from "./DetailPane";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { workspaceUi$, openFieldEditor } from "./workspace-ui-store";
import type { EditableFieldId } from "./workspace-ui-store";
import { findElementById } from "./display-helpers";

type AddOption = { field: EditableFieldId; label: string };

function getAddOptions(selectedId: string | null): AddOption[] {
  if (!selectedId) return [];
  const overrides = workspaceUi$.elementOverrides.peek();
  const base = findElementById(selectedId);
  if (!base) return [];
  const element = { ...base, ...(overrides[selectedId] ?? {}) };

  const familyLinks = (element.link ?? []).filter((l) => l.tipo === "parentela");
  const genericLinks = (element.link ?? []).filter((l) => l.tipo !== "parentela");

  return [
    { field: "descrizione", label: "Descrizione", visible: !element.descrizione.trim() },
    { field: "tags", label: "Tag", visible: element.tags.length === 0 },
    { field: "ruoli", label: "Ruoli", visible: element.tipo === "personaggio" && (element.ruoli?.length ?? 0) === 0 },
    { field: "collegamenti-famiglia", label: "Famiglia", visible: element.tipo === "personaggio" && familyLinks.length === 0 },
    { field: "collegamenti-generici", label: "Collegamento", visible: genericLinks.length === 0 },
    // Always available — user may want to add more even if some exist
    { field: "tags", label: "Aggiungi tag", visible: element.tags.length > 0 },
    { field: "collegamenti-famiglia", label: "Aggiungi famiglia", visible: element.tipo === "personaggio" && familyLinks.length > 0 },
    { field: "collegamenti-generici", label: "Aggiungi collegamento", visible: genericLinks.length > 0 },
  ]
    .filter((o) => o.visible)
    // Deduplicate by field (first occurrence wins — "missing" takes priority over "add more")
    .filter((o, idx, arr) => arr.findIndex((x) => x.field === o.field) === idx)
    .map(({ field, label }) => ({ field: field as EditableFieldId, label }));
}

function ElementoFieldFab() {
  const fullscreen = useValue(workspaceUi$.fullscreen);
  const selectedId = useValue(workspaceUi$.selectedElementId);

  if (!selectedId) return null;

  const options = getAddOptions(selectedId);
  if (options.length === 0) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${fullscreen ? "bottom-8 right-8" : ""}`}>
      <Dropdown>
        <Dropdown.Trigger>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:brightness-110"
            aria-label="Aggiungi campo"
          >
            <Plus className="h-6 w-6" />
          </button>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top end" className="min-w-[220px]">
          <Dropdown.Menu onAction={(key) => openFieldEditor(key as EditableFieldId)}>
            {options.map((opt) => (
              <Dropdown.Item key={opt.field} id={opt.field} textValue={opt.label}>
                <Label>{opt.label}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}

export function WorkspacePreviewPage() {
  return (
    <div className="flex h-screen bg-panel font-body">
      <NavSidebar />
      <ListPane />
      <DetailPane />
      <ElementoFieldFab />
      <FullscreenOverlay />
      <Toast.Provider placement="bottom end" />
    </div>
  );
}
