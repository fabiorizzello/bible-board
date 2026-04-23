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
  PanelLeft,
  Plus,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import {
  workspaceUi$,
  navigateToView,
  selectElement,
  getJazzElementi,
  getJazzMe,
} from "./workspace-ui-store";
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
  formatElementDate,
  getBoardDisplayItems,
} from "./display-helpers";
import { createElementoInWorkspace } from "@/features/elemento/elemento.adapter";

export function ListPane() {
  const currentView = useValue(workspaceUi$.currentView);
  const filterText = useValue(workspaceUi$.filterText);
  const activeTipo = useValue(workspaceUi$.activeTipo);
  const selectedElementId = useValue(workspaceUi$.selectedElementId);
  const sidebarOpen = useValue(workspaceUi$.sidebarOpen);
  const fullscreen = useValue(workspaceUi$.fullscreen);
  const boardItems = getBoardDisplayItems();

  const isElementView = currentView === "tutti" || currentView.startsWith("board-");
  const isRecentiView = currentView === "recenti";

  const currentElements = isElementView
    ? getElementsForView(currentView, filterText, activeTipo)
    : [];

  // Recenti: most recently created elements (last 8, newest first)
  const recentElements = isRecentiView ? [...getJazzElementi()].reverse().slice(0, 8) : [];

  const viewLabel = currentView === "recenti" ? "Recenti"
    : currentView === "tutti" ? "Tutti gli elementi"
    : boardItems.find((b) => b.viewId === currentView)?.nome ?? currentView;

  const listCount = isRecentiView ? recentElements.length : currentElements.length;

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
        <Dropdown>
          <Tooltip>
            <Dropdown.Trigger>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[30px] w-[30px] rounded-md border border-dashed border-accent/30 text-accent hover:bg-accent/5 hover:border-accent hover:border-solid"
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
  );
}
