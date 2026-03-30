import { useState, useCallback } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Kbd,
  Label,
  ScrollShadow,
  SearchField,
  Separator,
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

// ── Types ──

type ViewId = "recenti" | "tutti" | "board-patriarchi" | "board-profeti";

interface Elemento {
  id: string;
  titolo: string;
  tipo: string;
  data?: string;
  tags: string[];
  note?: string;
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
  { id: "1", titolo: "Abraamo", tipo: "personaggio", data: "2018 a.e.v.", tags: ["patriarchi"], note: "Patriarca di Israele. Abraamo lascio Ur dei Caldei per la Terra Promessa. Padre di Isacco attraverso Sara e di Ismaele attraverso Agar. La promessa divina di una discendenza numerosa come le stelle del cielo e la sabbia del mare.", collegamenti: [{ titolo: "Isacco", tipo: "parentela" }, { titolo: "Sara", tipo: "parentela" }, { titolo: "Ur dei Caldei", tipo: "localizzazione" }, { titolo: "Ismaele", tipo: "parentela" }], fonti: ["Genesi 12:1-3", "Genesi 15:5-6", "Genesi 22:1-18", "Ebrei 11:8-10"], boards: ["Patriarchi e Giudici"] },
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
  const selectedElement = ELEMENTI.find((e) => e.id === selectedElementId) ?? BOARD_PATRIARCHI_ELEMENTI.find((e) => e.id === selectedElementId) ?? null;

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

  function handleExitFullscreen() {
    setFullscreen(false);
  }

  const viewLabel = currentView === "recenti" ? "Recenti"
    : currentView === "tutti" ? "Tutti gli elementi"
    : BOARDS.find((b) => b.viewId === currentView)?.nome ?? currentView;

  const listCount = isRecentiView ? RECENTI.length : currentElements.length;

  // ── Shared detail content renderer ──
  function renderDetailBody(el: Elemento, fullscreenMode: boolean) {
    const sectionGap = fullscreenMode ? "mb-6" : "mb-4";
    const headingClass = "mb-1 text-[12px] font-bold uppercase tracking-wider text-slate-500";
    const textSize = fullscreenMode ? "text-[14px]" : "text-[13px]";
    const chipGap = fullscreenMode ? "gap-1.5" : "gap-1";
    const chipMinH = fullscreenMode ? "min-h-[34px]" : "min-h-[30px]";
    const chipPx = fullscreenMode ? "px-2.5 py-1.5" : "px-2 py-1";
    const chipText = fullscreenMode ? "text-[12px]" : "text-[11px]";

    return (
      <>
        {fullscreenMode && el.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {el.tags.map((tag) => (
              <Chip key={tag} size="sm" className="bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {tag}
              </Chip>
            ))}
          </div>
        )}

        {el.note && (
          <section className={sectionGap}>
            <h2 className={headingClass}>Note</h2>
            <p className={`${textSize} leading-relaxed text-slate-700`}>{el.note}</p>
          </section>
        )}

        {el.collegamenti && el.collegamenti.length > 0 && (
          <section className={sectionGap}>
            <h2 className={headingClass}>Collegamenti</h2>
            <div className={`flex flex-wrap ${chipGap}`}>
              {el.collegamenti.map((c) => (
                <Chip key={c.titolo} size="sm" className={`border border-teal-600/10 ${chipPx} ${chipText} cursor-pointer hover:bg-teal-600/6 ${chipMinH}`}>
                  {c.titolo} <span className="text-[9px] text-slate-400">{c.tipo}</span>
                </Chip>
              ))}
            </div>
          </section>
        )}

        {el.fonti && el.fonti.length > 0 && (
          <section className={sectionGap}>
            <h2 className={headingClass}>Fonti</h2>
            <div className="flex flex-wrap gap-2">
              {el.fonti.map((f) => (
                <span key={f} className={`${fullscreenMode ? "text-[13px]" : "text-xs"} text-teal-700 underline underline-offset-2 cursor-pointer hover:text-teal-900 transition-colors`}>
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {el.boards && el.boards.length > 0 && (
          <section className={sectionGap}>
            <h2 className={headingClass}>Board</h2>
            <div className={`flex flex-wrap ${chipGap}`}>
              {el.boards.map((b) => (
                <Chip key={b} size="sm" className={`border border-orange-500/15 ${chipPx} ${chipText} text-orange-600 cursor-pointer hover:bg-orange-50 ${chipMinH}`}>
                  <LayoutGrid className="h-2.5 w-2.5" /> {b}
                </Chip>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  // ── Shared toolbar renderer ──
  function renderToolbar(fullscreenMode: boolean) {
    const btnSize = fullscreenMode ? "min-h-[34px] px-3 py-1.5 text-[12px]" : "min-h-[30px] px-2.5 py-1 text-[11px]";
    const iconSize = fullscreenMode ? "h-3.5 w-3.5" : "h-3 w-3";
    const overflowSize = fullscreenMode ? "h-[34px] w-[34px]" : "h-[30px] w-[30px]";

    return (
      <Toolbar className="flex items-center gap-1 border-b border-teal-600/6 bg-slate-50/50 px-4 py-1.5">
        <Button variant="primary" className={`gap-1 rounded-lg font-semibold ${btnSize}`}>
          <Pencil className={iconSize} /> Modifica
        </Button>
        <Button variant="outline" className={`gap-1 rounded-lg border-teal-600/10 font-medium text-slate-600 hover:bg-teal-600/6 ${btnSize}`}>
          <Link2 className={iconSize} /> Link
        </Button>
        <Button variant="outline" className={`gap-1 rounded-lg border-teal-600/10 font-medium text-slate-600 hover:bg-teal-600/6 ${btnSize}`}>
          <BookOpen className={iconSize} /> Fonte
        </Button>
        <Button variant="outline" className={`gap-1 rounded-lg border-teal-600/10 font-medium text-slate-600 hover:bg-teal-600/6 ${btnSize}`}>
          <LayoutGrid className={iconSize} /> Board
        </Button>
        <div className="flex-1" />
        <Dropdown>
            <Button variant="outline" isIconOnly className={`${overflowSize} rounded-lg border-slate-200 text-slate-400 hover:bg-slate-100`} aria-label="Altre azioni">
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

  // ── 3-pane layout + fullscreen overlay ──
  return (
    <div className="flex h-screen bg-white" style={{ fontFamily: "'Fira Sans', sans-serif" }}>

      {/* ── NAV SIDEBAR ── */}
      <nav
        className={`flex flex-col border-r border-teal-600/10 bg-slate-50/60 transition-all duration-200 ease-in-out overflow-hidden ${
          sidebarOpen ? "w-[220px] min-w-[220px]" : "w-0 min-w-0"
        }`}
        aria-label="Navigazione workspace"
      >
        {/* Workspace switcher — HeroUI Dropdown */}
        <div className="px-2 pt-2 pb-1">
          <Dropdown>
              <Button
                variant="ghost"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 min-h-[44px] text-left hover:bg-teal-600/6 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-[11px] font-bold text-white flex-shrink-0">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ fontFamily: "'Fira Code', monospace" }} className="block text-[13px] font-semibold text-slate-800 truncate">
                    Il mio workspace
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Sincronizzato
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
              </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-[200px]">
              <Dropdown.Menu onAction={() => {}}>
                <Dropdown.Section>
                  <Dropdown.Item id="current" textValue="Il mio workspace">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <Label>Il mio workspace</Label>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="marco" textValue="Workspace di Marco">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                      <span className="w-3.5" />
                      <Label>Workspace di Marco</Label>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="gruppo" textValue="Studio gruppo">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                      <span className="w-3.5" />
                      <Label>Studio gruppo</Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Section>
                <Separator />
                <Dropdown.Section>
                  <Dropdown.Item id="new" textValue="Nuovo workspace">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-teal-600">
                      <Plus className="h-3.5 w-3.5" />
                      <Label>Nuovo workspace</Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        <Separator className="mx-3 my-1 border-teal-600/6" />

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-1.5">
          <Button
            variant="ghost"
            onPress={() => handleNavChange("recenti")}
            className={`w-full justify-start gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium ${
              currentView === "recenti"
                ? "bg-teal-600/10 text-teal-700 font-semibold"
                : "text-slate-600 hover:bg-teal-600/6"
            }`}
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            Recenti
          </Button>
          <Button
            variant="ghost"
            onPress={() => handleNavChange("tutti")}
            className={`w-full justify-start gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium ${
              currentView === "tutti"
                ? "bg-teal-600/10 text-teal-700 font-semibold"
                : "text-slate-600 hover:bg-teal-600/6"
            }`}
          >
            <List className="h-4 w-4 flex-shrink-0" />
            Tutti gli elementi
          </Button>

          {/* Board section */}
          <div className="mt-4 mb-1 flex items-center justify-between px-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Board</span>
            <Tooltip>
                <Button
                  variant="ghost"
                  isIconOnly
                  className="h-[24px] w-[24px] rounded text-slate-400 hover:bg-teal-600/6 hover:text-orange-500"
                  aria-label="Nuovo board"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              <Tooltip.Content>Nuovo board</Tooltip.Content>
            </Tooltip>
          </div>
          {BOARDS.map((board) => (
            <Button
              key={board.id}
              variant="ghost"
              title={board.nome}
              onPress={() => handleNavChange(board.viewId)}
              className={`w-full justify-start gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium ${
                currentView === board.viewId
                  ? "bg-orange-500/10 text-orange-600 font-semibold"
                  : "text-slate-600 hover:bg-teal-600/6"
              }`}
            >
              <LayoutGrid className={`h-4 w-4 flex-shrink-0 ${currentView === board.viewId ? "text-orange-500" : "text-slate-400"}`} />
              <span className="flex-1 truncate">{board.nome}</span>
              <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[10px] text-slate-400">{board.count}</span>
            </Button>
          ))}
        </div>

        {/* Settings footer */}
        <div className="border-t border-teal-600/6 px-1.5 py-1.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2 rounded-lg px-2.5 min-h-[36px] text-[13px] font-medium text-slate-500 hover:bg-teal-600/6"
            >
              <Settings className="h-4 w-4" />
              Impostazioni
            </Button>
            <Tooltip>
                <Button
                  variant="ghost"
                  isIconOnly
                  className="h-[36px] w-[36px] rounded-lg text-slate-400 hover:bg-teal-600/6"
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
        className={`flex flex-col border-r border-teal-600/10 transition-all duration-200 ease-in-out overflow-hidden ${
          fullscreen ? "w-0 min-w-0" : "w-[300px] min-w-[300px]"
        }`}
      >
        {/* List header */}
        <div className="flex items-center gap-1.5 border-b border-teal-600/6 px-3 min-h-[44px]">
          {!sidebarOpen && (
            <Tooltip>
                <Button
                  variant="ghost"
                  isIconOnly
                  className="h-[30px] w-[30px] rounded-md text-slate-400 hover:bg-teal-600/6 mr-1"
                  onPress={() => setSidebarOpen(true)}
                  aria-label="Apri navigazione"
                >
                  <PanelLeft className="h-3.5 w-3.5" />
                </Button>
              <Tooltip.Content>Apri navigazione</Tooltip.Content>
            </Tooltip>
          )}
          <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-xs font-semibold text-slate-700 truncate">
            {viewLabel}
          </span>
          <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[11px] text-slate-400">
            {listCount}
          </span>
          <div className="flex-1" />
          <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[30px] w-[30px] rounded-md border border-dashed border-orange-400/30 text-orange-500 hover:bg-orange-50 hover:border-orange-400 hover:border-solid"
                aria-label="Nuovo elemento"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            <Tooltip.Content>Nuovo elemento</Tooltip.Content>
          </Tooltip>
        </div>

        {/* Search bar */}
        <div className="border-b border-teal-600/6 px-3 py-1.5">
          <SearchField value={filterText} onChange={setFilterText} aria-label="Cerca">
            <SearchField.Group className="flex items-center gap-1.5">
              <SearchField.SearchIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <SearchField.Input
                placeholder={isElementView ? "Filtra elementi..." : "Cerca ovunque..."}
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-300"
              />
              {!isElementView && <Kbd className="text-[10px] text-slate-300">/</Kbd>}
            </SearchField.Group>
          </SearchField>
        </div>

        {/* Tipo chips (only for "tutti" view) */}
        {currentView === "tutti" && (
          <div className="flex gap-1 border-b border-teal-600/6 px-3 py-1.5 flex-wrap">
            {TIPO_FILTERS.map((tipo) => (
              <Button
                key={tipo}
                variant="ghost"
                onPress={() => setActiveTipo(tipo)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium min-h-[28px] ${
                  activeTipo === tipo
                    ? "border-teal-600/15 bg-teal-600/10 text-teal-700"
                    : "border-slate-200 text-slate-500 hover:bg-teal-600/6"
                }`}
              >
                {tipo}
              </Button>
            ))}
          </div>
        )}

        {/* List items */}
        <ScrollShadow className="flex-1 overflow-y-auto">
          {isRecentiView && RECENTI.map((rec) => (
            <Button
              key={`${rec.tipo}-${rec.id}`}
              variant="ghost"
              onPress={() => { if (rec.tipo === "elemento") handleSelectElement(rec.id); }}
              className={`w-full justify-start gap-2 px-3 min-h-[44px] rounded-none ${
                rec.tipo === "elemento" && selectedElementId === rec.id
                  ? "bg-teal-600/10 border-l-[3px] border-l-teal-600 pl-[9px]"
                  : "hover:bg-teal-600/6"
              }`}
            >
              <Chip size="sm" className={`px-1.5 py-px text-[9px] font-semibold flex-shrink-0 ${
                rec.tipo === "board"
                  ? "bg-orange-500/10 text-orange-500 uppercase tracking-wider"
                  : "bg-teal-600/10 text-teal-700"
              }`}>
                {rec.badge}
              </Chip>
              <span className="flex-1 truncate text-xs font-medium text-slate-700">{rec.titolo}</span>
              <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[9px] text-slate-400 flex-shrink-0">
                {rec.tempo}
              </span>
            </Button>
          ))}

          {isElementView && currentElements.map((el) => (
            <Button
              key={el.id}
              variant="ghost"
              onPress={() => handleSelectElement(el.id)}
              className={`w-full justify-start gap-2 px-3 min-h-[44px] rounded-none ${
                selectedElementId === el.id
                  ? "bg-teal-600/10 border-l-[3px] border-l-teal-600 pl-[9px]"
                  : "hover:bg-teal-600/6"
              }`}
            >
              <span className="flex-1 truncate text-xs font-medium text-slate-700">{el.titolo}</span>
              <Chip size="sm" className="bg-teal-600/10 px-1.5 py-px text-[10px] font-semibold text-teal-700 flex-shrink-0">
                {TIPO_ABBREV[el.tipo] ?? el.tipo}
              </Chip>
              {el.data && (
                <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[9px] text-slate-400 flex-shrink-0">
                  {el.data}
                </span>
              )}
            </Button>
          ))}

          {isElementView && currentElements.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <p className="text-xs text-slate-500 mb-3">Nessun risultato.</p>
              {filterText && (
                <Button
                  variant="ghost"
                  onPress={() => { setFilterText(""); setActiveTipo("Tutti"); }}
                  className="text-xs text-teal-600 underline"
                >
                  Resetta filtri
                </Button>
              )}
            </div>
          )}
        </ScrollShadow>
      </div>

      {/* ── DETAIL PANE ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {selectedElement ? (
          <>
            {/* Detail header */}
            <div className="border-b border-teal-600/6 px-4 pt-3 pb-2">
              <div className="flex items-start justify-between">
                <h1 style={{ fontFamily: "'Fira Code', monospace" }} className="text-lg font-semibold text-slate-800">
                  {selectedElement.titolo}
                </h1>
                <Tooltip>
                    <Button
                      variant="ghost"
                      isIconOnly
                      className="h-[30px] w-[30px] rounded-md text-slate-400 hover:bg-teal-600/6"
                      onPress={() => setFullscreen(true)}
                      aria-label="Schermo intero"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                  <Tooltip.Content>Schermo intero</Tooltip.Content>
                </Tooltip>
              </div>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Chip size="sm" className="bg-teal-600/10 px-1.5 py-px text-[10px] font-semibold text-teal-700">
                  {selectedElement.tipo}
                </Chip>
                {selectedElement.tags.map((tag) => (
                  <Chip key={tag} size="sm" className="bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
                    {tag}
                  </Chip>
                ))}
                {selectedElement.data && (
                  <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[11px] text-slate-400">
                    {selectedElement.data}
                  </span>
                )}
              </div>
            </div>

            {/* Toolbar */}
            {renderToolbar(false)}

            {/* Body */}
            <ScrollShadow className="flex-1 overflow-y-auto px-4 py-3">
              {renderDetailBody(selectedElement, false)}
            </ScrollShadow>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <p className="text-base font-semibold text-slate-700">Seleziona un elemento</p>
            <p className="text-sm text-slate-400">Scegli dalla lista per visualizzarne i dettagli.</p>
            <p className="mt-3 text-[11px] text-slate-300">
              Premi{" "}
              <Kbd className="text-[10px]">/</Kbd>
              {" "}per cercare
            </p>
          </div>
        )}
      </div>

      {/* ── FULLSCREEN OVERLAY ── */}
      {selectedElement && (
        <div
          className={`fixed inset-0 z-40 flex flex-col bg-white transition-all duration-300 ease-in-out ${
            fullscreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <header className="flex items-center gap-3 border-b border-teal-600/10 px-4 min-h-[48px]">
            <Tooltip>
                <Button
                  variant="ghost"
                  isIconOnly
                  className="h-[36px] w-[36px] rounded-lg text-slate-500 hover:bg-teal-600/6"
                  onPress={handleExitFullscreen}
                  aria-label="Torna alla lista"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              <Tooltip.Content>Torna alla lista</Tooltip.Content>
            </Tooltip>
            <h1 style={{ fontFamily: "'Fira Code', monospace" }} className="text-base font-semibold text-slate-800 truncate">
              {selectedElement.titolo}
            </h1>
            <div className="flex items-center gap-1.5">
              <Chip size="sm" className="bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                {selectedElement.tipo}
              </Chip>
              {selectedElement.data && (
                <span style={{ fontFamily: "'Fira Code', monospace" }} className="text-[11px] text-slate-400">
                  {selectedElement.data}
                </span>
              )}
            </div>
            <div className="flex-1" />
            <Tooltip>
                <Button
                  variant="ghost"
                  isIconOnly
                  className="h-[36px] w-[36px] rounded-lg text-slate-500 hover:bg-teal-600/6"
                  onPress={handleExitFullscreen}
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
