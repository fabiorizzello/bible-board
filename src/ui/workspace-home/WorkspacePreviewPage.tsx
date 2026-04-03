import { useState, useCallback } from "react";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Kbd,
  Label,
  Link,
  ListBox,
  ScrollShadow,
  SearchField,
  Separator,
  Tag,
  TagGroup,
  Text,
  Toolbar,
  Tooltip,
} from "@heroui/react";
import {
  Plus,
  Settings,
  LayoutGrid,
  Clock,
  List,
  Pencil,
  Link2,
  BookOpen,
  PanelLeft,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  Ellipsis,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ── Types ──

type ViewId = "recenti" | "tutti" | "board-patriarchi" | "board-profeti";

interface Elemento {
  id: string;
  titolo: string;
  tipo: string;
  data?: string;
  tags: string[];
  descrizione?: string;
  collegamenti?: { titolo: string; tipo: string }[];
  fonti?: string[];
  boards?: string[];
}

interface Board {
  id: string;
  nome: string;
  viewId: ViewId;
  count: number;
}

interface Recente {
  id: string;
  titolo: string;
  tipo: "elemento" | "board";
  badge: string;
  tempo: string;
}

// ── Mock data ──

const ELEMENTI: Elemento[] = [
  { id: "1", titolo: "Abraamo", tipo: "personaggio", data: "2018 a.e.v.", tags: ["patriarchi"], descrizione: "Patriarca di Israele. Abraamo lascio Ur dei Caldei per la Terra Promessa. Padre di Isacco attraverso Sara e di Ismaele attraverso Agar. La promessa divina di una discendenza numerosa come le stelle del cielo e la sabbia del mare.", collegamenti: [{ titolo: "Isacco", tipo: "parentela" }, { titolo: "Sara", tipo: "parentela" }, { titolo: "Ur dei Caldei", tipo: "localizzazione" }, { titolo: "Ismaele", tipo: "parentela" }], fonti: ["Genesi 12:1-3", "Genesi 15:5-6", "Genesi 22:1-18", "Ebrei 11:8-10"], boards: ["Patriarchi e Giudici"] },
  { id: "2", titolo: "Babilonia", tipo: "luogo", tags: ["esilio"] },
  { id: "3", titolo: "Diluvio universale", tipo: "evento", data: "2370 a.e.v.", tags: [] },
  { id: "4", titolo: "Esodo dall'Egitto", tipo: "evento", data: "1513 a.e.v.", tags: ["liberazione"] },
  { id: "5", titolo: "Gerusalemme", tipo: "luogo", tags: [] },
  { id: "6", titolo: "Isacco", tipo: "personaggio", data: "1918 a.e.v.", tags: ["patriarchi"] },
  { id: "7", titolo: "Monte Sinai", tipo: "luogo", tags: ["legge"] },
  { id: "8", titolo: "Mose", tipo: "personaggio", data: "1593 a.e.v.", tags: ["legge"] },
  { id: "9", titolo: "Profezia Isaia 53", tipo: "profezia", data: "~732 a.e.v.", tags: ["messianico"] },
  { id: "10", titolo: "Regno di Davide", tipo: "evento", data: "1077 a.e.v.", tags: [] },
  { id: "11", titolo: "Sara", tipo: "personaggio", data: "1919 a.e.v.", tags: ["patriarchi"] },
  { id: "12", titolo: "Torre di Babele", tipo: "evento", data: "~2269 a.e.v.", tags: [] },
];

const BOARD_PATRIARCHI_ELEMENTI: Elemento[] = [
  { id: "1", titolo: "Abraamo", tipo: "personaggio", data: "2018 a.e.v.", tags: ["patriarchi"] },
  { id: "6", titolo: "Isacco", tipo: "personaggio", data: "1918 a.e.v.", tags: ["patriarchi"] },
  { id: "b1", titolo: "Giacobbe", tipo: "personaggio", data: "1858 a.e.v.", tags: ["patriarchi"] },
  { id: "b2", titolo: "Giuseppe", tipo: "personaggio", data: "1767 a.e.v.", tags: ["patriarchi"] },
  { id: "8", titolo: "Mose", tipo: "personaggio", data: "1593 a.e.v.", tags: ["legge"] },
  { id: "b3", titolo: "Giosue", tipo: "personaggio", data: "1473 a.e.v.", tags: [] },
  { id: "b4", titolo: "Gedeone", tipo: "personaggio", data: "~1210 a.e.v.", tags: [] },
];

const BOARDS: Board[] = [
  { id: "b1", nome: "Patriarchi e Giudici", viewId: "board-patriarchi", count: 7 },
  { id: "b2", nome: "Profeti di Israele", viewId: "board-profeti", count: 4 },
];

const RECENTI: Recente[] = [
  { id: "1", titolo: "Abraamo", tipo: "elemento", badge: "pers", tempo: "5 min fa" },
  { id: "b1", titolo: "Patriarchi e Giudici", tipo: "board", badge: "board", tempo: "12 min fa" },
  { id: "4", titolo: "Esodo dall'Egitto", tipo: "elemento", badge: "evento", tempo: "1h fa" },
  { id: "9", titolo: "Profezia Isaia 53", tipo: "elemento", badge: "prof", tempo: "ieri" },
  { id: "6", titolo: "Isacco", tipo: "elemento", badge: "pers", tempo: "ieri" },
  { id: "7", titolo: "Monte Sinai", tipo: "elemento", badge: "luogo", tempo: "2 gg fa" },
  { id: "11", titolo: "Sara", tipo: "elemento", badge: "pers", tempo: "3 gg fa" },
  { id: "b2", titolo: "Profeti di Israele", tipo: "board", badge: "board", tempo: "4 gg fa" },
];

const TIPO_FILTERS = ["Tutti", "Personaggi", "Eventi", "Luoghi", "Profezie"];

const TIPO_ABBREV: Record<string, string> = {
  personaggio: "pers.",
  evento: "evento",
  luogo: "luogo",
  profezia: "prof.",
  regno: "regno",
  periodo: "periodo",
  guerra: "guerra",
  annotazione: "nota",
};

// ── Component ──

export function WorkspacePreviewPage() {
  const [currentView, setCurrentView] = useState<ViewId>("recenti");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeTipo, setActiveTipo] = useState("Tutti");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const isElementView = currentView === "tutti" || currentView.startsWith("board-");
  const isRecentiView = currentView === "recenti";

  const getElementsForView = useCallback((): Elemento[] => {
    let items: Elemento[];
    switch (currentView) {
      case "board-patriarchi": items = BOARD_PATRIARCHI_ELEMENTI; break;
      case "board-profeti": items = ELEMENTI.filter((e) => e.tags.includes("messianico") || e.titolo.startsWith("Profezia")); break;
      default: items = ELEMENTI;
    }
    if (filterText) {
      const q = filterText.toLowerCase();
      items = items.filter((e) => e.titolo.toLowerCase().includes(q));
    }
    if (activeTipo !== "Tutti") {
      const tipoMap: Record<string, string> = { Personaggi: "personaggio", Eventi: "evento", Luoghi: "luogo", Profezie: "profezia" };
      items = items.filter((e) => e.tipo === tipoMap[activeTipo]);
    }
    return items;
  }, [currentView, filterText, activeTipo]);

  const currentElements = isElementView ? getElementsForView() : [];
  const selectedElement = ELEMENTI.find((e) => e.id === selectedElementId)
    ?? BOARD_PATRIARCHI_ELEMENTI.find((e) => e.id === selectedElementId)
    ?? null;

  function handleNavChange(viewId: ViewId) {
    setCurrentView(viewId);
    setSelectedElementId(null);
    setFilterText("");
    setActiveTipo("Tutti");
  }

  function handleSelectElement(id: string) {
    setSelectedElementId(id);
    if (sidebarOpen) setSidebarOpen(false);
  }

  const viewLabel = currentView === "recenti" ? "Recenti"
    : currentView === "tutti" ? "Tutti gli elementi"
    : BOARDS.find((b) => b.viewId === currentView)?.nome ?? currentView;

  const listCount = isRecentiView ? RECENTI.length : currentElements.length;

  // ── Detail body sections (Card-based) ──
  function renderDetailBody(el: Elemento, isFs: boolean) {
    const section = isFs ? "mb-6" : "mb-4";
    const heading = "p-0 pb-1";
    const title = "text-[12px] font-bold uppercase tracking-wider text-ink-lo";
    const bodyText = isFs ? "text-[14px]" : "text-[13px]";
    const gap = isFs ? "gap-1.5" : "gap-1";

    return (
      <>
        {isFs && el.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {el.tags.map((tag) => (
              <Chip key={tag} size="sm" className="bg-chip-bg px-2 py-0.5 text-[11px] font-medium text-ink-lo">
                {tag}
              </Chip>
            ))}
          </div>
        )}

        {el.descrizione && (
          <Card className={`border-none shadow-none bg-transparent ${section}`}>
            <Card.Header className={heading}>
              <Card.Title className={title}>Descrizione</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              <Text className={`${bodyText} leading-relaxed text-ink-md`}>{el.descrizione}</Text>
            </Card.Content>
          </Card>
        )}

        {el.collegamenti && el.collegamenti.length > 0 && (
          <Card className={`border-none shadow-none bg-transparent ${section}`}>
            <Card.Header className={heading}>
              <Card.Title className={title}>Collegamenti</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              <div className={`flex flex-wrap ${gap}`}>
                {el.collegamenti.map((c) => (
                  <Chip key={c.titolo} size="sm" className="border border-primary/10 px-2 py-1 text-[11px] cursor-pointer hover:bg-primary/6">
                    {c.titolo} <Text className="text-[9px] text-ink-dim ml-1">{c.tipo}</Text>
                  </Chip>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {el.fonti && el.fonti.length > 0 && (
          <Card className={`border-none shadow-none bg-transparent ${section}`}>
            <Card.Header className={heading}>
              <Card.Title className={title}>Fonti</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="flex flex-wrap gap-2">
                {el.fonti.map((f) => (
                  <Link key={f} className={`${isFs ? "text-[13px]" : "text-xs"} text-primary underline underline-offset-2 cursor-pointer hover:text-ink transition-colors`}>
                    {f}
                  </Link>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {el.boards && el.boards.length > 0 && (
          <Card className={`border-none shadow-none bg-transparent ${section}`}>
            <Card.Header className={heading}>
              <Card.Title className={title}>Board</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              <div className={`flex flex-wrap ${gap}`}>
                {el.boards.map((b) => (
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

  // ── Action toolbar ──
  function renderToolbar(isFs: boolean) {
    const btn = isFs ? "min-h-[34px] px-3 py-1.5 text-[12px]" : "min-h-[30px] px-2.5 py-1 text-[11px]";
    const ico = isFs ? "h-3.5 w-3.5" : "h-3 w-3";
    const overflow = isFs ? "h-[34px] w-[34px]" : "h-[30px] w-[30px]";

    return (
      <Toolbar className="flex w-full items-center gap-1 border-b border-primary/6 bg-chrome px-4 py-1.5">
        <Button variant="primary" className={`gap-1 rounded-lg font-semibold ${btn}`}>
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
          <Button variant="outline" isIconOnly className={`${overflow} rounded-lg border-edge text-ink-dim hover:bg-chip-bg`} aria-label="Altre azioni">
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

  // ── 3-pane layout ──
  return (
    <div className="flex h-screen bg-panel font-body">

      {/* ── NAV SIDEBAR ── */}
      <nav
        className={`flex flex-col border-r border-primary/10 bg-chrome transition-all duration-200 ease-in-out overflow-hidden ${
          sidebarOpen ? "w-[220px] min-w-[220px]" : "w-0 min-w-0"
        }`}
        aria-label="Navigazione workspace"
      >
        {/* Workspace switcher — Dropdown + Avatar */}
        <div className="px-2 pt-2 pb-1">
          <Dropdown>
            <Button
              variant="ghost"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 min-h-[44px] text-left hover:bg-primary/6 cursor-pointer"
            >
              <Avatar size="sm" className="h-7 w-7 flex-shrink-0">
                <Avatar.Fallback className="bg-primary text-[11px] font-bold text-white">W</Avatar.Fallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Text className="block font-heading text-[13px] font-semibold text-ink-hi truncate">
                  Il mio workspace
                </Text>
                <Text className="flex items-center gap-1 text-[10px] text-ink-dim">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Sincronizzato
                </Text>
              </div>
              <ChevronDown className="h-3 w-3 text-ink-dim flex-shrink-0" />
            </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-[200px]">
              <Dropdown.Menu onAction={() => {}}>
                <Dropdown.Section>
                  <Dropdown.Item id="current" textValue="Il mio workspace">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-ink-md">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <Label>Il mio workspace</Label>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="marco" textValue="Workspace di Marco">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-ink-lo">
                      <span className="w-3.5" />
                      <Label>Workspace di Marco</Label>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="gruppo" textValue="Studio gruppo">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-ink-lo">
                      <span className="w-3.5" />
                      <Label>Studio gruppo</Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Section>
                <Separator />
                <Dropdown.Section>
                  <Dropdown.Item id="new" textValue="Nuovo workspace">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
                      <Plus className="h-3.5 w-3.5" />
                      <Label>Nuovo workspace</Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        <Separator className="mx-3 my-1 border-primary/6" />

        {/* Nav ListBox — keyboard-navigable selection */}
        <ScrollShadow className="flex-1 overflow-y-auto px-1.5">
          <ListBox
            aria-label="Navigazione principale"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={!currentView.startsWith("board-") ? new Set([currentView]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                handleNavChange(String([...keys][0]) as ViewId);
              }
            }}
            className="border-none p-0 outline-none"
          >
            <ListBox.Item
              id="recenti"
              textValue="Recenti"
              className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <Label>Recenti</Label>
            </ListBox.Item>
            <ListBox.Item
              id="tutti"
              textValue="Tutti gli elementi"
              className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
            >
              <List className="h-4 w-4 flex-shrink-0" />
              <Label>Tutti gli elementi</Label>
            </ListBox.Item>
          </ListBox>

          {/* Board section header */}
          <div className="mt-4 mb-1 flex items-center justify-between px-2.5">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-ink-dim">Board</Text>
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[24px] w-[24px] rounded text-ink-dim hover:bg-primary/6 hover:text-accent"
                aria-label="Nuovo board"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Tooltip.Content>Nuovo board</Tooltip.Content>
            </Tooltip>
          </div>

          {/* Board ListBox — separate to keep orange selection styling */}
          <ListBox
            aria-label="Board"
            selectionMode="single"
            selectedKeys={currentView.startsWith("board-") ? new Set([currentView]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size > 0) {
                handleNavChange(String([...keys][0]) as ViewId);
              }
            }}
            className="border-none p-0 outline-none"
          >
            {BOARDS.map((board) => (
              <ListBox.Item
                key={board.id}
                id={board.viewId}
                textValue={board.nome}
                className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-accent/10 data-[selected]:text-accent data-[selected]:font-semibold"
              >
                <LayoutGrid className="h-4 w-4 flex-shrink-0 text-ink-dim" />
                <Text className="flex-1 truncate">{board.nome}</Text>
                <Text className="font-heading text-[10px] text-ink-dim">{board.count}</Text>
              </ListBox.Item>
            ))}
          </ListBox>
        </ScrollShadow>

        {/* Settings footer */}
        <div className="border-t border-primary/6 px-1.5 py-1.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2 rounded-lg px-2.5 min-h-[36px] text-[13px] font-medium text-ink-lo hover:bg-primary/6"
            >
              <Settings className="h-4 w-4" />
              Impostazioni
            </Button>
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[36px] w-[36px] rounded-lg text-ink-dim hover:bg-primary/6"
                onPress={() => setSidebarOpen(false)}
                aria-label="Chiudi navigazione"
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </Button>
              <Tooltip.Content>Chiudi navigazione</Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </nav>

      {/* ── LIST PANE ── */}
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
                onPress={() => setSidebarOpen(true)}
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
                  const board = BOARDS.find((b) => b.id === id);
                  if (board) handleNavChange(board.viewId);
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
                    {rec.badge}
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
              {currentElements.map((el) => (
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
                  {el.data && (
                    <Text className="font-heading text-[9px] text-ink-dim flex-shrink-0">
                      {el.data}
                    </Text>
                  )}
                </ListBox.Item>
              ))}
            </ListBox>
          )}

          {/* Empty state */}
          {isElementView && currentElements.length === 0 && (
            <EmptyState className="flex flex-col items-center justify-center py-16 px-4">
              <Text className="text-xs text-ink-lo mb-3">Nessun risultato.</Text>
              {filterText && (
                <Button
                  variant="ghost"
                  onPress={() => { setFilterText(""); setActiveTipo("Tutti"); }}
                  className="text-xs text-primary underline"
                >
                  Resetta filtri
                </Button>
              )}
            </EmptyState>
          )}
        </ScrollShadow>
      </div>

      {/* ── DETAIL PANE ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedElement ? (
          <>
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
                      onPress={() => setFullscreen(true)}
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
                  {selectedElement.data && (
                    <Text className="font-heading text-[11px] text-ink-dim">
                      {selectedElement.data}
                    </Text>
                  )}
                </div>
              </Card.Header>
            </Card>

            {/* Action toolbar */}
            {renderToolbar(false)}

            {/* Detail body */}
            <ScrollShadow className="flex-1 overflow-y-auto px-4 py-3">
              {renderDetailBody(selectedElement, false)}
            </ScrollShadow>
          </>
        ) : (
          /* Empty detail state */
          <EmptyState className="flex flex-1 flex-col items-center justify-center gap-2">
            <Text className="text-base font-semibold text-ink-md">Seleziona un elemento</Text>
            <Text className="text-sm text-ink-dim">Scegli dalla lista per visualizzarne i dettagli.</Text>
            <Text className="mt-3 text-[11px] text-ink-ghost">
              Premi <Kbd className="text-[10px]">/</Kbd> per cercare
            </Text>
          </EmptyState>
        )}
      </div>

      {/* ── THEME SWITCHER (temporary prototype tool) ── */}
      <ThemeSwitcher />

      {/* ── FULLSCREEN OVERLAY ── */}
      {selectedElement && (
        <div
          className={`fixed inset-0 z-40 flex flex-col bg-panel transition-all duration-300 ease-in-out ${
            fullscreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <header className="flex items-center gap-3 border-b border-primary/10 px-4 min-h-[48px]">
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
                onPress={() => setFullscreen(false)}
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
              {selectedElement.data && (
                <Text className="font-heading text-[11px] text-ink-dim">
                  {selectedElement.data}
                </Text>
              )}
            </div>
            <div className="flex-1" />
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
                onPress={() => setFullscreen(false)}
                aria-label="Esci da schermo intero"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Tooltip.Content>Esci da schermo intero</Tooltip.Content>
            </Tooltip>
          </header>

          {renderToolbar(true)}

          <ScrollShadow className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-6">
              {renderDetailBody(selectedElement, true)}
            </div>
          </ScrollShadow>
        </div>
      )}
    </div>
  );
}
