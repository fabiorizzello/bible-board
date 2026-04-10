/**
 * DetailPane — right pane showing element detail header, toolbar, and body sections.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads shared state via Legend State workspace-ui-store.
 * Exports DetailBody and ActionToolbar for reuse by FullscreenOverlay.
 */

import {
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Kbd,
  Label,
  Link,
  ScrollShadow,
  Separator,
  Text,
  Toolbar,
  Tooltip,
} from "@heroui/react";
import {
  BookOpen,
  Ellipsis,
  LayoutGrid,
  Link2,
  Maximize2,
  MessageSquareText,
  Pencil,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { workspaceUi$, startEditing, selectElement } from "./workspace-ui-store";
import {
  findElementById,
  formatElementDate,
  resolveCollegamenti,
  resolveBoardsForElement,
  getFontiForElement,
  getAnnotazioniForElement,
  CURRENT_AUTORE,
} from "./display-helpers";
import { ElementoEditor } from "./ElementoEditor";
import type { Elemento } from "@/features/elemento/elemento.model";

// ── Shared sub-components (exported for FullscreenOverlay) ──

/** Render the action toolbar: Modifica, Link, Fonte, Board + overflow menu. */
export function ActionToolbar({ isFullscreen, onModifica }: { isFullscreen: boolean; onModifica?: () => void }) {
  const btn = isFullscreen
    ? "min-h-[34px] px-3 py-1.5 text-[12px]"
    : "min-h-[30px] px-2.5 py-1 text-[11px]";
  const ico = isFullscreen ? "h-3.5 w-3.5" : "h-3 w-3";
  const overflow = isFullscreen ? "h-[34px] w-[34px]" : "h-[30px] w-[30px]";

  return (
    <Toolbar className="flex w-full items-center gap-1 border-b border-primary/6 bg-chrome px-4 py-1.5">
      <Button variant="primary" className={`gap-1 rounded-lg font-semibold ${btn}`} onPress={onModifica}>
        <Pencil className={ico} /> Modifica
      </Button>
      <Button variant="outline" className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}>
        <Link2 className={ico} /> Link
      </Button>
      <Button variant="outline" className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}>
        <BookOpen className={ico} /> Fonte
      </Button>
      <Button variant="outline" className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}>
        <LayoutGrid className={ico} /> Board
      </Button>
      <div className="flex-1" />
      <Dropdown>
        <Button
          variant="outline"
          isIconOnly
          className={`${overflow} rounded-lg border-edge text-ink-dim hover:bg-chip-bg`}
          aria-label="Altre azioni"
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={() => {}}>
            <Dropdown.Item id="duplicate" textValue="Duplica">
              <Label>Duplica</Label>
            </Dropdown.Item>
            <Separator />
            <Dropdown.Item id="delete" textValue="Elimina" variant="danger">
              <Label>Elimina</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </Toolbar>
  );
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
  const fonti = getFontiForElement(element);
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

      {fonti.length > 0 && (
        <Card className={`border-none shadow-none bg-transparent ${section}`}>
          <Card.Header className={heading}>
            <Card.Title className={title}>Fonti</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="flex flex-wrap gap-2">
              {fonti.map((f) => (
                <Link key={f} className={`${isFullscreen ? "text-[13px]" : "text-xs"} text-primary underline underline-offset-2 cursor-pointer hover:text-ink transition-colors`}>
                  {f}
                </Link>
              ))}
            </div>
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
  const isEditing = useValue(workspaceUi$.isEditing);

  const selectedElement = selectedElementId
    ? findElementById(selectedElementId)
    : undefined;

  const dateStr = selectedElement ? formatElementDate(selectedElement) : undefined;

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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Detail header — Card structure */}
      <Card className="border-none shadow-none rounded-none border-b border-primary/6 bg-transparent">
        <Card.Header className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between">
            <Card.Title className="font-heading text-lg font-semibold text-ink-hi">
              {selectedElement.titolo}
            </Card.Title>
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[30px] w-[30px] rounded-md text-ink-dim hover:bg-primary/6"
                onPress={() => workspaceUi$.fullscreen.set(true)}
                aria-label="Schermo intero"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Tooltip.Content>Schermo intero</Tooltip.Content>
            </Tooltip>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Chip size="sm" className="bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary">
              {selectedElement.tipo}
            </Chip>
            {selectedElement.tags.map((tag) => (
              <Chip key={tag} size="sm" className="bg-chip-bg px-1.5 py-px text-[10px] font-medium text-ink-lo">
                {tag}
              </Chip>
            ))}
            {dateStr && (
              <Text className="font-heading text-[11px] text-ink-dim">
                {dateStr}
              </Text>
            )}
          </div>
        </Card.Header>
      </Card>

      {/* Action toolbar — hidden when editing (editor has own Save/Cancel) */}
      {!isEditing && <ActionToolbar isFullscreen={false} onModifica={startEditing} />}

      {/* Detail body or inline editor */}
      <ScrollShadow className="flex-1 overflow-y-auto px-4 py-3">
        {isEditing ? (
          <ElementoEditor element={selectedElement} />
        ) : (
          <DetailBody element={selectedElement} isFullscreen={false} />
        )}
      </ScrollShadow>
    </div>
  );
}
