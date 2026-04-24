/**
 * DetailPane — right pane showing element detail header, toolbar, and body sections.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads shared state via Legend State workspace-ui-store.
 * Exports DetailBody and shared delete handling for reuse by FullscreenOverlay.
 */

import {
  Button,
  Card,
  Chip,
  EmptyState,
  Kbd,
  Link,
  ScrollShadow,
  Text,
} from "@heroui/react";
import { notifyMutation } from "./notifications-store";
import {
  LayoutGrid,
  MessageSquareText,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import {
  workspaceUi$,
  selectElement,
  softDeleteElement,
  restoreElement,
} from "./workspace-ui-store";
import {
  findElementById,
  resolveCollegamenti,
  resolveBoardsForElement,
  getFontiGroupedByTipo,
  FONTE_TIPO_LABEL,
  FONTE_TIPI_IN_SCOPE,
  getAnnotazioniForElement,
  CURRENT_AUTORE,
} from "./display-helpers";
import { ElementoEditor } from "./ElementoEditor";
import type { Elemento } from "@/features/elemento/elemento.model";

// ── Shared helpers (exported for FullscreenOverlay) ──

/**
 * Soft-delete an element with notification-center undo entry.
 *
 * Captures titolo and id before clearing the selection so the notification
 * and undo handler keep working after the store mutation.
 */
export function handleSoftDelete(element: Elemento): void {
  const elementId = element.id as string;
  const titolo = element.titolo;
  softDeleteElement(elementId);
  notifyMutation('delete', `"${titolo}" eliminato`, () => restoreElement(elementId));
}

/** Render the detail body sections: Descrizione, Collegamenti, Fonti, Board. */
export function DetailBody({
  element,
  isFullscreen,
}: {
  element: Elemento;
  isFullscreen: boolean;
}) {
  const section = isFullscreen ? "mb-6" : "mb-4";
  const heading = "p-0 pb-1";
  const title = "text-[12px] font-bold uppercase tracking-wider text-ink-lo";
  const bodyText = isFullscreen ? "text-[14px]" : "text-[13px]";
  const gap = isFullscreen ? "gap-1.5" : "gap-1";

  const collegamenti = resolveCollegamenti(element);
  const fontiGrouped = getFontiGroupedByTipo(element);
  const annotazioni = getAnnotazioniForElement(element.id as string, CURRENT_AUTORE);
  const boards = resolveBoardsForElement(element);

  return (
    <>
      {isFullscreen && element.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {element.tags.map((tag) => (
            <Chip key={tag} size="sm" className="bg-chip-bg px-2 py-0.5 text-[11px] font-medium text-ink-lo">
              {tag}
            </Chip>
          ))}
        </div>
      )}

      {element.descrizione && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Descrizione</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <Text className={`${bodyText} leading-relaxed text-ink-md`}>{element.descrizione}</Text>
          </Card.Content>
        </Card>
      )}

      {collegamenti.length > 0 && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Collegamenti</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className={`flex flex-wrap ${gap}`}>
              {collegamenti.map((c) => (
                <Chip key={c.titolo} size="sm" className="border border-primary/10 px-2 py-1 text-[11px] cursor-pointer hover:bg-primary/6">
                  {c.titolo} <Text className="text-[9px] text-ink-dim ml-1">{c.tipo}</Text>
                </Chip>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {fontiGrouped.size > 0 && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Fonti</Card.Title>
          </Card.Header>
          <Card.Content className="p-0 space-y-2">
            {FONTE_TIPI_IN_SCOPE.map((tipo) => {
              const group = fontiGrouped.get(tipo);
              if (!group || group.length === 0) return null;
              return (
                <div key={tipo}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-ghost">
                    {FONTE_TIPO_LABEL[tipo]}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.map((f) =>
                      f.urlCalcolata ? (
                        <Link
                          key={f.valore}
                          href={f.urlCalcolata}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${isFullscreen ? "text-[13px]" : "text-xs"} text-primary underline underline-offset-2 cursor-pointer hover:text-ink transition-colors`}
                        >
                          {f.valore}
                        </Link>
                      ) : (
                        <span
                          key={f.valore}
                          className={`${isFullscreen ? "text-[13px]" : "text-xs"} text-ink-md`}
                        >
                          {f.valore}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {(annotazioni.mie.length > 0 || annotazioni.altreCount > 0) && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Annotazioni</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className={`flex flex-col ${gap}`}>
              {annotazioni.mie.map((ann) => (
                <button
                  key={ann.id as string}
                  type="button"
                  aria-label={`Apri annotazione: ${ann.titolo}`}
                  className="flex flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-primary/6"
                  onClick={() => selectElement(ann.id as string)}
                >
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
                    <MessageSquareText className="h-3 w-3 shrink-0" />
                    {ann.titolo}
                  </span>
                  {ann.descrizione && (
                    <span className="line-clamp-2 pl-[18px] text-[11px] leading-snug text-ink-dim">
                      {ann.descrizione.length > 80
                        ? `${ann.descrizione.slice(0, 80)}…`
                        : ann.descrizione}
                    </span>
                  )}
                </button>
              ))}
              {annotazioni.altreCount > 0 && (
                <span className="px-2 text-[11px] text-ink-ghost">
                  {annotazioni.altreCount}{" "}
                  {annotazioni.altreCount === 1
                    ? "annotazione altrui"
                    : "annotazioni altrui"}
                </span>
              )}
              {annotazioni.mie.length === 0 && annotazioni.altreCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  isDisabled
                  className="mt-1 w-fit gap-1 px-2 text-[11px] text-ink-dim"
                >
                  + Aggiungi annotazione
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {boards.length > 0 && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Board</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className={`flex flex-wrap ${gap}`}>
              {boards.map((b) => (
                <Chip key={b} size="sm" className="border border-accent/15 px-2 py-1 text-[11px] text-accent cursor-pointer hover:bg-accent/5">
                  <LayoutGrid className="h-2.5 w-2.5" /> {b}
                </Chip>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </>
  );
}

// ── Main DetailPane component ──

export function DetailPane() {
  const selectedElementId = useValue(workspaceUi$.selectedElementId);
  const editingFieldId = useValue(workspaceUi$.editingFieldId);

  const selectedElement = selectedElementId
    ? findElementById(selectedElementId)
    : undefined;

  if (!selectedElement) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmptyState className="flex flex-1 flex-col items-center justify-center gap-2">
          <Text className="text-base font-semibold text-ink-md">Seleziona un elemento</Text>
          <Text className="text-sm text-ink-dim">Scegli dalla lista per visualizzarne i dettagli.</Text>
          <Text className="mt-3 text-[11px] text-ink-ghost">
            Premi <Kbd className="text-[10px]">/</Kbd> per cercare
          </Text>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ScrollShadow className="flex-1 overflow-y-auto px-4 py-4">
        <ElementoEditor
          element={selectedElement}
          editingFieldId={editingFieldId}
          onDelete={() => handleSoftDelete(selectedElement)}
          onExpand={() => workspaceUi$.fullscreen.set(true)}
        />
      </ScrollShadow>
    </div>
  );
}
