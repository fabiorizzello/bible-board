/**
 * ListPane — middle pane with search, filters, and element/recenti lists.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads/writes shared state via Legend State workspace-ui-store.
 */

import {
  Button,
  Chip,
  EmptyState,
  Kbd,
  ListBox,
  ScrollShadow,
  SearchField,
  Tag,
  TagGroup,
  Text,
  Tooltip,
} from "@heroui/react";
import {
  PanelLeft,
  Plus,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { workspaceUi$, navigateToView, selectElement } from "./workspace-ui-store";
import type { ViewId } from "./workspace-ui-store";
import {
  TIPO_FILTERS,
  TIPO_ABBREV,
  getElementsForView,
  formatElementDate,
  getBoardDisplayItems,
} from "./display-helpers";
import { RECENTI } from "@/mock/data";

const BOARD_ITEMS = getBoardDisplayItems();

export function ListPane() {
  const currentView = useValue(workspaceUi$.currentView);
  const filterText = useValue(workspaceUi$.filterText);
  const activeTipo = useValue(workspaceUi$.activeTipo);
  const selectedElementId = useValue(workspaceUi$.selectedElementId);
  const sidebarOpen = useValue(workspaceUi$.sidebarOpen);
  const fullscreen = useValue(workspaceUi$.fullscreen);
  const deletedElementIds = useValue(workspaceUi$.deletedElementIds);

  const isElementView = currentView === "tutti" || currentView.startsWith("board-");
  const isRecentiView = currentView === "recenti";

  const currentElements = isElementView
    ? getElementsForView(currentView, filterText, activeTipo, deletedElementIds)
    : [];

  const viewLabel = currentView === "recenti" ? "Recenti"
    : currentView === "tutti" ? "Tutti gli elementi"
    : BOARD_ITEMS.find((b) => b.viewId === currentView)?.nome ?? currentView;

  const listCount = isRecentiView ? RECENTI.length : currentElements.length;

  function handleSelectElement(id: string) {
    selectElement(id);
  }

  function handleRecentiNavChange(viewId: ViewId) {
    navigateToView(viewId);
  }

  return (
    <div
      className={`flex flex-col border-r border-primary/10 transition-all duration-200 ease-in-out overflow-hidden ${
        fullscreen ? "w-0 min-w-0" : "w-[300px] min-w-[300px]"
      }`}
    >
      {/* List header */}
      <div className="flex items-center gap-1.5 border-b border-primary/6 px-3 min-h-[44px]">
        {!sidebarOpen && (
          <Tooltip>
            <Button
              variant="ghost"
              isIconOnly
              className="h-[30px] w-[30px] rounded-md text-ink-dim hover:bg-primary/6 mr-1"
              onPress={() => workspaceUi$.sidebarOpen.set(true)}
              aria-label="Apri navigazione"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
            <Tooltip.Content>Apri navigazione</Tooltip.Content>
          </Tooltip>
        )}
        <Text className="font-heading text-xs font-semibold text-ink-md truncate">
          {viewLabel}
        </Text>
        <Text className="font-heading text-[11px] text-ink-dim">
          {listCount}
        </Text>
        <div className="flex-1" />
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[30px] w-[30px] rounded-md border border-dashed border-accent/30 text-accent hover:bg-accent/5 hover:border-accent hover:border-solid"
            aria-label="Nuovo elemento"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Tooltip.Content>Nuovo elemento</Tooltip.Content>
        </Tooltip>
      </div>

      {/* Search bar — HeroUI SearchField */}
      <div className="border-b border-primary/6 px-3 py-1.5">
        <SearchField
          value={filterText}
          onChange={(v) => workspaceUi$.filterText.set(v)}
          aria-label="Cerca"
        >
          <SearchField.Group className="flex items-center gap-1.5">
            <SearchField.SearchIcon className="h-3.5 w-3.5 text-ink-dim flex-shrink-0" />
            <SearchField.Input
              placeholder={isElementView ? "Filtra elementi..." : "Cerca ovunque..."}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-ink-ghost"
            />
            {!isElementView && <Kbd className="text-[10px] text-ink-ghost">/</Kbd>}
          </SearchField.Group>
        </SearchField>
      </div>

      {/* Tipo filters — TagGroup with single selection */}
      {currentView === "tutti" && (
        <div className="border-b border-primary/6 px-3 py-1.5">
          <TagGroup
            aria-label="Filtra per tipo"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([activeTipo])}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                workspaceUi$.activeTipo.set(String([...keys][0]));
              }
            }}
          >
            <TagGroup.List className="flex flex-wrap gap-1">
              {TIPO_FILTERS.map((tipo) => (
                <Tag
                  key={tipo}
                  id={tipo}
                  className="inline-flex items-center rounded-full border px-2.5 text-[10px] font-medium min-h-[28px] leading-none cursor-pointer border-edge text-ink-lo data-[selected]:border-primary/15 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[hovered]:bg-primary/6"
                >
                  {tipo}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        </div>
      )}

      {/* List items — ListBox with keyboard navigation */}
      <ScrollShadow className="flex-1 overflow-y-auto">
        {/* Recenti view */}
        {isRecentiView && (
          <ListBox
            aria-label="Elementi recenti"
            selectionMode="single"
            selectedKeys={selectedElementId ? new Set([`elemento-${selectedElementId}`]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys === "all" || keys.size === 0) return;
              const compositeKey = String([...keys][0]);
              const dashIdx = compositeKey.indexOf("-");
              const tipo = compositeKey.substring(0, dashIdx);
              const id = compositeKey.substring(dashIdx + 1);
              if (tipo === "elemento") handleSelectElement(id);
              else if (tipo === "board") {
                const board = BOARD_ITEMS.find((b) => b.id === id);
                if (board) handleRecentiNavChange(board.viewId);
              }
            }}
            className="border-none p-0 outline-none"
          >
            {RECENTI.map((rec) => (
              <ListBox.Item
                key={`${rec.tipo}-${rec.id}`}
                id={`${rec.tipo}-${rec.id}`}
                textValue={rec.titolo}
                className="flex items-center gap-2 rounded-none px-3 min-h-[44px] cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:border-l-[3px] data-[selected]:border-l-primary data-[selected]:pl-[9px]"
              >
                <Chip size="sm" className={`px-1.5 py-px text-[9px] font-semibold flex-shrink-0 ${
                  rec.tipo === "board"
                    ? "bg-accent/10 text-accent uppercase tracking-wider"
                    : "bg-primary/10 text-primary"
                }`}>
                  {rec.tipo === "board"
                    ? "board"
                    : rec.elementoTipo
                      ? TIPO_ABBREV[rec.elementoTipo] ?? rec.elementoTipo
                      : ""}
                </Chip>
                <Text className="flex-1 truncate text-xs font-medium text-ink-md">{rec.titolo}</Text>
                <Text className="font-heading text-[9px] text-ink-dim flex-shrink-0">
                  {rec.tempo}
                </Text>
              </ListBox.Item>
            ))}
          </ListBox>
        )}

        {/* Element view */}
        {isElementView && currentElements.length > 0 && (
          <ListBox
            aria-label="Elementi"
            selectionMode="single"
            selectedKeys={selectedElementId ? new Set([selectedElementId]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                handleSelectElement(String([...keys][0]));
              }
            }}
            className="border-none p-0 outline-none"
          >
            {currentElements.map((el) => {
              const dateStr = formatElementDate(el);
              return (
                <ListBox.Item
                  key={el.id}
                  id={el.id}
                  textValue={el.titolo}
                  className="flex items-center gap-2 rounded-none px-3 min-h-[44px] cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:border-l-[3px] data-[selected]:border-l-primary data-[selected]:pl-[9px]"
                >
                  <Text className="flex-1 truncate text-xs font-medium text-ink-md">{el.titolo}</Text>
                  <Chip size="sm" className="bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary flex-shrink-0">
                    {TIPO_ABBREV[el.tipo] ?? el.tipo}
                  </Chip>
                  {dateStr && (
                    <Text className="font-heading text-[9px] text-ink-dim flex-shrink-0">
                      {dateStr}
                    </Text>
                  )}
                </ListBox.Item>
              );
            })}
          </ListBox>
        )}

        {/* Empty state */}
        {isElementView && currentElements.length === 0 && (
          <EmptyState className="flex flex-col items-center justify-center py-16 px-4">
            <Text className="text-xs text-ink-lo mb-3">Nessun risultato.</Text>
            {filterText && (
              <Button
                variant="ghost"
                onPress={() => {
                  workspaceUi$.filterText.set("");
                  workspaceUi$.activeTipo.set("Tutti");
                }}
                className="text-xs text-primary underline"
              >
                Resetta filtri
              </Button>
            )}
          </EmptyState>
        )}
      </ScrollShadow>
    </div>
  );
}
