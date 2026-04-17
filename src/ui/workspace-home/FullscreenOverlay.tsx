/**
 * FullscreenOverlay — fixed overlay showing element detail in fullscreen mode.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads shared state via Legend State workspace-ui-store.
 * Reuses DetailBody and ActionToolbar from DetailPane.
 */

import {
  Button,
  Chip,
  ScrollShadow,
  Text,
  Tooltip,
} from "@heroui/react";
import {
  ArrowLeft,
  Minimize2,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { openFieldEditor, workspaceUi$ } from "./workspace-ui-store";
import { findElementById, formatElementDate } from "./display-helpers";
import { ActionToolbar, handleSoftDelete } from "./DetailPane";
import { ElementoEditor } from "./ElementoEditor";

export function FullscreenOverlay() {
  const selectedElementId = useValue(workspaceUi$.selectedElementId);
  const fullscreen = useValue(workspaceUi$.fullscreen);
  const lastModified = useValue(workspaceUi$.lastModified);
  const editingFieldId = useValue(workspaceUi$.editingFieldId);
  void lastModified;

  const selectedElement = selectedElementId
    ? findElementById(selectedElementId)
    : undefined;

  const dateStr = selectedElement ? formatElementDate(selectedElement) : undefined;

  // Render nothing if no element selected (overlay won't be visible anyway)
  if (!selectedElement) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-panel transition-all duration-300 ease-in-out ${
        fullscreen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <header className="flex items-center gap-3 border-b border-primary/10 px-4 min-h-[48px]">
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
            onPress={() => workspaceUi$.fullscreen.set(false)}
            aria-label="Torna alla lista"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Torna alla lista</Tooltip.Content>
        </Tooltip>
        <Text className="font-heading text-base font-semibold text-ink-hi truncate">
          {selectedElement.titolo}
        </Text>
        <div className="flex items-center gap-1.5">
          <Chip size="sm" className="bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {selectedElement.tipo}
          </Chip>
          {dateStr && (
            <Text className="font-heading text-[11px] text-ink-dim">
              {dateStr}
            </Text>
          )}
        </div>
        <div className="flex-1" />
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
            onPress={() => workspaceUi$.fullscreen.set(false)}
            aria-label="Esci da schermo intero"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Esci da schermo intero</Tooltip.Content>
        </Tooltip>
      </header>

      <ActionToolbar
        isFullscreen
        onModifica={() => openFieldEditor("descrizione")}
        onDelete={() => handleSoftDelete(selectedElement)}
      />

      <ScrollShadow className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6">
          <ElementoEditor
            element={selectedElement}
            editingFieldId={editingFieldId}
            isFullscreen
          />
        </div>
      </ScrollShadow>
    </div>
  );
}
