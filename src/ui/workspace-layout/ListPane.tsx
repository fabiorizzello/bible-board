import { useState, useMemo, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
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
import { PanelLeft, Plus } from "lucide-react";
import { ELEMENTI, RECENTI, BOARDS, ELEMENTI_MAP } from "@/mock";
import type { Elemento } from "@/features/elemento/elemento.model";

// ── Constants ──

const TIPO_FILTERS = ["Tutti", "Personaggi", "Eventi", "Luoghi", "Profezie", "Regni"] as const;

const TIPO_FILTER_MAP: Record<string, string> = {
  Personaggi: "personaggio",
  Eventi: "evento",
  Luoghi: "luogo",
  Profezie: "profezia",
  Regni: "regno",
};

const TIPO_ABBREV: Record<string, string> = {
  personaggio: "pers.",
  evento: "evento",
  luogo: "luogo",
  profezia: "prof.",
  regno: "regno",
  periodo: "periodo",
  guerra: "guerra",
};

// ── Props ──

interface ListPaneProps {
  readonly sidebarOpen: boolean;
  readonly onOpenSidebar: () => void;
  readonly visible: boolean;
}

// ── Helpers ──

type CurrentView = "recenti" | "tutti" | "board";

function deriveView(pathname: string): CurrentView {
  if (pathname === "/workspace" || pathname === "/workspace/") return "recenti";
  if (pathname.startsWith("/workspace/board/")) return "board";
  // /workspace/tutti or /workspace/elemento/* → "tutti" (element list)
  return "tutti";
}

function resolveViewLabel(view: CurrentView, boardId: string | undefined): string {
  if (view === "recenti") return "Recenti";
  if (view === "tutti") return "Tutti gli elementi";
  if (view === "board" && boardId) {
    const board = BOARDS.find((b) => b.id === boardId);
    return board?.nome ?? "Board";
  }
  return "Board";
}

function resolveBoardElements(boardId: string): readonly Elemento[] {
  const board = BOARDS.find((b) => b.id === boardId);
  if (!board) return [];
  if (board.selezione.kind === "fissa") {
    return board.selezione.elementiIds
      .map((id) => ELEMENTI_MAP.get(id))
      .filter((el): el is Elemento => el !== undefined);
  }
  // dinamica: filter by tags and/or tipi
  const { tags, tipi } = board.selezione;
  return ELEMENTI.filter((el) => {
    const matchTags = !tags || tags.length === 0 || el.tags.some((t) => tags.includes(t));
    const matchTipi = !tipi || tipi.length === 0 || tipi.includes(el.tipo);
    return matchTags && matchTipi;
  });
}

function formatDataBrief(el: Elemento): string | null {
  if (el.nascita) {
    const p = el.nascita.precisione === "circa" ? "~" : "";
    const era = el.nascita.era === "aev" ? "a.e.v." : "e.v.";
    return `${p}${el.nascita.anno} ${era}`;
  }
  if (el.date) {
    const d = el.date.kind === "puntuale" ? el.date.data : el.date.inizio;
    const p = d.precisione === "circa" ? "~" : "";
    const era = d.era === "aev" ? "a.e.v." : "e.v.";
    return `${p}${d.anno} ${era}`;
  }
  return null;
}

// ── Component ──

export function ListPane({ sidebarOpen, onOpenSidebar, visible }: ListPaneProps) {
  const { elementoId, boardId } = useParams<{ elementoId?: string; boardId?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");
  const [activeTipo, setActiveTipo] = useState("Tutti");

  const currentView = deriveView(pathname);
  const isRecentiView = currentView === "recenti";
  const isElementView = currentView === "tutti" || currentView === "board";
  const viewLabel = resolveViewLabel(currentView, boardId);

  // Resolve elements based on current view + filters
  const currentElements = useMemo(() => {
    let items: readonly Elemento[];
    if (currentView === "board" && boardId) {
      items = resolveBoardElements(boardId);
    } else {
      items = ELEMENTI;
    }

    // Text filter
    if (filterText) {
      const q = filterText.toLowerCase();
      items = items.filter((e) => e.titolo.toLowerCase().includes(q));
    }

    // Tipo filter
    if (activeTipo !== "Tutti") {
      const mapped = TIPO_FILTER_MAP[activeTipo];
      if (mapped) {
        items = items.filter((e) => e.tipo === mapped);
      }
    }

    return items;
  }, [currentView, boardId, filterText, activeTipo]);

  const listCount = isRecentiView ? RECENTI.length : currentElements.length;

  const handleSelectElement = useCallback(
    (id: string) => {
      navigate(`/workspace/elemento/${id}`);
    },
    [navigate],
  );

  const handleSelectBoard = useCallback(
    (id: string) => {
      navigate(`/workspace/board/${id}`);
    },
    [navigate],
  );

  return (
    <div
      className={`flex flex-col border-r border-primary/10 transition-all duration-200 ease-in-out overflow-hidden ${
        visible ? "w-[300px] min-w-[300px]" : "w-0 min-w-0"
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
              onPress={onOpenSidebar}
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

      {/* Search bar */}
      <div className="border-b border-primary/6 px-3 py-1.5">
        <SearchField value={filterText} onChange={setFilterText} aria-label="Cerca">
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

      {/* Tipo filters — shown on element views only */}
      {currentView === "tutti" && (
        <div className="border-b border-primary/6 px-3 py-1.5">
          <TagGroup
            aria-label="Filtra per tipo"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([activeTipo])}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                setActiveTipo(String([...keys][0]));
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

      {/* List items */}
      <ScrollShadow className="flex-1 overflow-y-auto">
        {/* Recenti view */}
        {isRecentiView && (
          <ListBox
            aria-label="Elementi recenti"
            selectionMode="single"
            selectedKeys={elementoId ? new Set([`elemento-${elementoId}`]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys === "all" || keys.size === 0) return;
              const compositeKey = String([...keys][0]);
              const dashIdx = compositeKey.indexOf("-");
              const tipo = compositeKey.substring(0, dashIdx);
              const id = compositeKey.substring(dashIdx + 1);
              if (tipo === "elemento") handleSelectElement(id);
              else if (tipo === "board") handleSelectBoard(id);
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
                <Chip
                  size="sm"
                  className={`px-1.5 py-px text-[9px] font-semibold flex-shrink-0 ${
                    rec.tipo === "board"
                      ? "bg-accent/10 text-accent uppercase tracking-wider"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {rec.tipo === "board"
                    ? "board"
                    : rec.elementoTipo
                      ? (TIPO_ABBREV[rec.elementoTipo] ?? rec.elementoTipo)
                      : "elem"}
                </Chip>
                <Text className="flex-1 truncate text-xs font-medium text-ink-md">
                  {rec.titolo}
                </Text>
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
            selectedKeys={elementoId ? new Set([elementoId]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                handleSelectElement(String([...keys][0]));
              }
            }}
            className="border-none p-0 outline-none"
          >
            {currentElements.map((el) => {
              const dataBrief = formatDataBrief(el);
              return (
                <ListBox.Item
                  key={el.id}
                  id={el.id}
                  textValue={el.titolo}
                  className="flex items-center gap-2 rounded-none px-3 min-h-[44px] cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:border-l-[3px] data-[selected]:border-l-primary data-[selected]:pl-[9px]"
                >
                  <Text className="flex-1 truncate text-xs font-medium text-ink-md">
                    {el.titolo}
                  </Text>
                  <Chip
                    size="sm"
                    className="bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary flex-shrink-0"
                  >
                    {TIPO_ABBREV[el.tipo] ?? el.tipo}
                  </Chip>
                  {dataBrief && (
                    <Text className="font-heading text-[9px] text-ink-dim flex-shrink-0">
                      {dataBrief}
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
                  setFilterText("");
                  setActiveTipo("Tutti");
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
