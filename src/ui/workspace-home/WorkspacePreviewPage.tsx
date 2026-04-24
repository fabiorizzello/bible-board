/**
 * WorkspacePreviewPage — thin composition shell.
 *
 * Assembles the 3-pane layout from extracted components:
 * NavSidebar, ListPane, DetailPane, ThemeSwitcher, FullscreenOverlay.
 *
 * This is the Jazz-aware root: it calls useWorkspaceElementiState() and
 * syncJazzState() on every render so all child components read fresh data
 * via the module-level Jazz store without needing Jazz hooks themselves.
 */

import { Dropdown, Label } from "@heroui/react";
import { Plus } from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { NavSidebar } from "./NavSidebar";
import { ListPane } from "./ListPane";
import { DetailPane } from "./DetailPane";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { Timeline } from "@/ui/timeline/Timeline";
import { workspaceUi$, openFieldEditor, syncJazzState, syncJazzBoards } from "./workspace-ui-store";
import { findElementById } from "./display-helpers";
import type { EditableFieldId } from "./workspace-ui-store";
import {
  useWorkspaceElementiState,
  coMapToElementoDomain,
} from "@/features/elemento/elemento.adapter";
import { coMapToBoard } from "@/features/board/board.adapter";
import type { Elemento } from "@/features/elemento/elemento.model";
import type { Board } from "@/features/board/board.model";

type AddOption = { field: EditableFieldId; label: string };

function getAddOptions(selectedId: string | null): AddOption[] {
  if (!selectedId) return [];
  const element = findElementById(selectedId);
  if (!element) return [];

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
  const { account, workspace } = useWorkspaceElementiState();
  const currentView = useValue(workspaceUi$.currentView);
  const activeBoardView = useValue(workspaceUi$.activeBoardView);
  const showTimeline = currentView.startsWith("board-") && activeBoardView === "timeline";

  // Build raw CoMap list excluding soft-deleted elements (deletedAt flag set)
  const rawCoMaps: any[] = workspace?.elementi
    ? Array.from(workspace.elementi as any[])
        .filter(Boolean)
        .filter((e: any) => !e.deletedAt)
    : [];

  // Convert to domain objects; skip malformed CoMaps (coMapToElementoDomain logs warn)
  const domainElementi: Elemento[] = rawCoMaps
    .map(coMapToElementoDomain)
    .filter((e): e is Elemento => e !== null);

  const rawBoards = workspace?.boards
    ? Array.from(workspace.boards as any[]).filter(Boolean)
    : [];
  const domainBoards = rawBoards
    .map(coMapToBoard)
    .filter((b): b is Board => b !== null);

  // Sync Jazz state into the module-level store.
  // Called during render (not in useEffect) so child components read fresh data
  // in the same render cycle without an extra flash of stale content.
  syncJazzState(account.me, rawCoMaps, domainElementi);
  syncJazzBoards(domainBoards);

  return (
    <div className="flex h-dvh bg-panel font-body">
      <NavSidebar />
      {showTimeline ? (
        <Timeline />
      ) : (
        <>
          <ListPane />
          <DetailPane />
          <ElementoFieldFab />
          <FullscreenOverlay />
        </>
      )}
    </div>
  );
}
