/**
 * FullscreenOverlay — fixed overlay showing element detail in fullscreen mode.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads shared state via Legend State workspace-ui-store.
 * Reuses the same unified detail shell as the standard pane.
 */

import {
  Button,
  ScrollShadow,
  Tooltip,
} from "@heroui/react";
import {
  ArrowLeft,
  Minimize2,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { workspaceUi$ } from "./workspace-ui-store";
import { findElementById } from "./display-helpers";
import { handleSoftDelete } from "./DetailPane";
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

  // Render nothing if no element selected (overlay won't be visible anyway)
  if (!selectedElement) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-panel transition-[opacity,transform] duration-300 ease-in-out ${
        fullscreen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <header className="flex min-h-[56px] items-center gap-3 border-b border-primary/10 px-4">
        <Tooltip>
          <Button
            variant="ghost"
            className="min-h-[44px] gap-2 rounded-full px-4 text-sm font-medium text-ink-lo hover:bg-primary/6"
            onPress={() => workspaceUi$.fullscreen.set(false)}
            aria-label="Torna alla lista"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna
          </Button>
          <Tooltip.Content>Torna alla lista</Tooltip.Content>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[44px] w-[44px] rounded-full text-ink-lo hover:bg-primary/6"
            onPress={() => workspaceUi$.fullscreen.set(false)}
            aria-label="Esci da schermo intero"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Esci da schermo intero</Tooltip.Content>
        </Tooltip>
      </header>

      <ScrollShadow className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 md:px-8">
          {fullscreen && (
            <ElementoEditor
              element={selectedElement}
              editingFieldId={editingFieldId}
              isFullscreen
              onDelete={() => handleSoftDelete(selectedElement)}
            />
          )}
        </div>
      </ScrollShadow>
    </div>
  );
}
