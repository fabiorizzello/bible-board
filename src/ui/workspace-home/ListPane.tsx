/**
 * ListPane — middle pane with search, filters, and element/recenti lists.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads/writes shared state via Legend State workspace-ui-store.
 */

import {
  Button,
  Chip,
  Dropdown,
  EmptyState,
  Kbd,
  Label,
  ListBox,
  ScrollShadow,
  SearchField,
  Tag,
  TagGroup,
  Text,
  toast,
  Tooltip,
} from "@heroui/react";
import {
  ArrowDownUp,
  ArrowUpDown,
  List,
  PanelLeft,
  Plus,
  GitBranch,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import {
  workspaceUi$,
  navigateToView,
  selectElement,
  setActiveBoardView,
  getJazzElementi,
  getJazzMe,
} from "./workspace-ui-store";
import type { SortBy } from "./workspace-ui-store";
import type { ElementoTipo } from "@/features/elemento/elemento.model";

const TIPO_OPTIONS: readonly ElementoTipo[] = [
  "personaggio",
  "guerra",
  "evento",
  "luogo",
  "profezia",
  "regno",
  "periodo",
  "annotazione",
];
import type { ViewId } from "./workspace-ui-store";
import {
  TIPO_FILTERS,
  TIPO_ABBREV,
  getElementsForView,
  sortElementi,
  formatElementDate,
  getBoardDisplayItems,
} from "./display-helpers";
import { createElementoInWorkspace } from "@/features/elemento/elemento.adapter";

export function ListPane() {
  const currentView = useValue(workspaceUi$.currentView);
  const filterText = useValue(workspaceUi$.filterText);
  const activeTipo = useValue(workspaceUi$.activeTipo);
  const sortBy = useValue(workspaceUi$.sortBy);
  const sortDir = useValue(workspaceUi$.sortDir);
  const selectedElementId = useValue(workspaceUi$.selectedElementId);
  const sidebarOpen = useValue(workspaceUi$.sidebarOpen);
  const fullscreen = useValue(workspaceUi$.fullscreen);
  const activeBoardView = useValue(workspaceUi$.activeBoardView);
  const boardItems = getBoardDisplayItems();

  const isElementView = currentView === "tutti" || currentView.startsWith("board-");
  const isRecentiView = currentView === "recenti";
  const isBoardView = currentView.startsWith("board-");

  const filteredElements = isElementView
    ? getElementsForView(currentView, filterText, activeTipo)
    : [];

  const currentElements = isElementView
    ? sortElementi(filteredElements, sortBy, sortDir)
    : [];

  function handleSortColumn(col: SortBy) {
    if (workspaceUi$.sortBy.peek() === col) {
      workspaceUi$.sortDir.set(workspaceUi$.sortDir.peek() === "asc" ? "desc" : "asc");
    } else {
      workspaceUi$.sortBy.set(col);
      workspaceUi$.sortDir.set("asc");
    }
  }

  // Recenti: most recently created elements (last 8, newest first)
  const recentElements = isRecentiView ? [...getJazzElementi()].reverse().slice(0, 8) : [];

  const viewLabel = currentView === "recenti" ? "Recenti"
    : currentView === "tutti" ? "Tutti gli elementi"
    : boardItems.find((b) => b.viewId === currentView)?.nome ?? currentView;

  const listCount = isRecentiView ? recentElements.length : filteredElements.length;

  function handleSelectElement(id: string) {
    selectElement(id);
  }

  function handleRecentiNavChange(viewId: ViewId) {
    navigateToView(viewId);
  }
  void handleRecentiNavChange; // used indirectly in recenti ListBox

  function handleCreateElemento(tipo: ElementoTipo) {
    const me = getJazzMe();
    if (!me) {
      toast("Account non disponibile", { variant: "default" });
      return;
    }
    const result = createElementoInWorkspace(me, {
      titolo: `Nuovo ${tipo}`,
      descrizione: "",
      tags: [],
      tipo,
    });
    result.match(
      (newCoMap) => {
        // Select the newly created element so the user can rename it immediately
        selectElement(newCoMap.id as string);
        if (currentView === "recenti" || currentView === "tutti") {
          // Stay in current view; if recenti, new element will appear at top
        } else {
          navigateToView("tutti");
        }
      },
      (error) => {
        toast(`Errore creazione: ${error.type}`, { variant: "default" });
      },
    );
  }

  return (
    <div className={`flex-shrink-0 overflow-hidden ${fullscreen ? "w-0" : "w-[300px]"}`}>
    <div
      className={`w-[300px] flex flex-col border-r border-primary/10 transition-opacity duration-200 overflow-hidden ${
        fullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fullscreen}
    >
      {/* List header */}
      <div className="flex items-center gap-1.5 border-b border-primary/6 px-3 min-h-[44px]">
        {!sidebarOpen && (
          <Tooltip>
            <Button
              variant="ghost"
              isIconOnly
              className="h-[44px] w-[44px] rounded-md text-ink-dim hover:bg-primary/6 mr-1"
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
        {/* View toggle: list / timeline (board views only) */}
        {isBoardView && (
          <div className="flex items-center rounded-lg border border-edge bg-chrome overflow-hidden mr-1">
            <Tooltip>
              <button
                type="button"
                onClick={() => setActiveBoardView("lista")}
                className={`flex items-center justify-center h-[44px] w-[44px] transition-colors ${
                  activeBoardView === "lista"
                    ? "bg-primary text-white"
                    : "text-ink-dim hover:bg-primary/8 hover:text-ink-md"
                }`}
                aria-label="Vista lista"
                aria-pressed={activeBoardView === "lista"}
              >
                <List className="h-3 w-3" />
              </button>
              <Tooltip.Content>Vista lista</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <button
                type="button"
                onClick={() => setActiveBoardView("timeline")}
                className={`flex items-center justify-center h-[44px] w-[44px] transition-colors ${
                  activeBoardView === "timeline"
                    ? "bg-primary text-white"
                    : "text-ink-dim hover:bg-primary/8 hover:text-ink-md"
                }`}
                aria-label="Vista timeline"
                aria-pressed={activeBoardView === "timeline"}
              >
                <GitBranch className="h-3 w-3 rotate-90" />
              </button>
              <Tooltip.Content>Vista timeline</Tooltip.Content>
            </Tooltip>
          </div>
        )}
        <Dropdown>
          <Tooltip>
            <Dropdown.Trigger>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[44px] w-[44px] rounded-md border border-dashed border-accent/30 text-accent hover:bg-accent/5 hover:border-accent hover:border-solid"
                aria-label="Nuovo elemento"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </Dropdown.Trigger>
            <Tooltip.Content>Nuovo elemento</Tooltip.Content>
          </Tooltip>
          <Dropdown.Popover placement="bottom end" className="min-w-[200px]">
            <Dropdown.Menu
              onAction={(key) => {
                handleCreateElemento(key as ElementoTipo);
              }}
            >
              {TIPO_OPTIONS.map((tipo) => (
                <Dropdown.Item key={tipo} id={tipo} textValue={tipo}>
                  <Label>{tipo}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
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
                  className="inline-flex items-center rounded-full border px-2.5 text-[10px] font-medium min-h-[44px] leading-none cursor-pointer border-edge text-ink-lo data-[selected]:border-primary/15 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[hovered]:bg-primary/6"
                >
                  {tipo}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        </div>
      )}

      {/* Sort bar — shown in element views */}
      {isElementView && (
        <div className="flex items-center gap-0 border-b border-primary/6 px-2 min-h-[44px]">
          {(["titolo", "tipo", "data"] as const).map((col) => {
            const active = sortBy === col;
            const label = col === "titolo" ? "Titolo" : col === "tipo" ? "Tipo" : "Data";
            return (
              <button
                key={col}
                onClick={() => handleSortColumn(col)}
                className={`flex items-center gap-0.5 rounded px-1.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-primary bg-primary/8"
                    : "text-ink-dim hover:text-ink-md hover:bg-primary/5"
                }`}
                aria-pressed={active}
                aria-label={`Ordina per ${label} ${active && sortDir === "asc" ? "discendente" : "ascendente"}`}
              >
                {label}
                {active ? (
                  sortDir === "asc"
                    ? <ArrowUpDown className="h-2.5 w-2.5 ml-0.5" />
                    : <ArrowDownUp className="h-2.5 w-2.5 ml-0.5" />
                ) : null}
              </button>
            );
          })}
          {isBoardView && filterText && (
            <Text className="ml-auto text-[9px] text-ink-ghost pr-1">
              {filteredElements.length} risultati
            </Text>
          )}
        </div>
      )}

      {/* List items — ListBox with keyboard navigation */}
      <ScrollShadow className="flex-1 overflow-y-auto">
        {/* Recenti view — most recently created elements */}
        {isRecentiView && recentElements.length > 0 && (
          <ListBox
            aria-label="Elementi recenti"
            selectionMode="single"
            selectedKeys={selectedElementId ? new Set([selectedElementId]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                handleSelectElement(String([...keys][0]));
              }
            }}
            className="border-none p-0 outline-none"
          >
            {recentElements.map((el) => (
              <ListBox.Item
                key={el.id as string}
                id={el.id as string}
                textValue={el.titolo}
                className="flex items-center gap-2 rounded-none px-3 min-h-[44px] cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:border-l-[3px] data-[selected]:border-l-primary data-[selected]:pl-[9px]"
              >
                <Chip size="sm" className="bg-primary/10 px-1.5 py-px text-[9px] font-semibold text-primary flex-shrink-0">
                  {TIPO_ABBREV[el.tipo] ?? el.tipo}
                </Chip>
                <Text className="flex-1 truncate text-xs font-medium text-ink-md">{el.titolo}</Text>
              </ListBox.Item>
            ))}
          </ListBox>
        )}

        {/* Recenti empty state */}
        {isRecentiView && recentElements.length === 0 && (
          <EmptyState className="flex flex-col items-center justify-center py-16 px-4">
            <Text className="text-xs text-ink-lo mb-3">Nessun elemento ancora.</Text>
            <Text className="text-[11px] text-ink-ghost">Usa il + per creare il primo.</Text>
          </EmptyState>
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
                  key={el.id as string}
                  id={el.id as string}
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
    </div>
  );
}
