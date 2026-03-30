import {
  Button,
  Card,
  Chip,
  Dropdown,
  Label,
  ScrollShadow,
  Separator,
  Text,
  Toolbar,
  Tooltip,
} from "@heroui/react";
import {
  ArrowLeft,
  BookOpen,
  Ellipsis,
  LayoutGrid,
  Link2,
  Minimize2,
  Pencil,
} from "lucide-react";
import type { Elemento } from "@/features/elemento/elemento.model";

// ── Props ──

interface FullscreenOverlayProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly elemento: Elemento | null;
}

// ── Helpers ──

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

// ── Sub-components ──

function FullscreenToolbar() {
  const btn = "min-h-[34px] px-3 py-1.5 text-[12px]";
  const ico = "h-3.5 w-3.5";

  return (
    <Toolbar className="flex w-full items-center gap-1 border-b border-primary/6 bg-chrome px-4 py-1.5">
      <Button variant="primary" className={`gap-1 rounded-lg font-semibold ${btn}`}>
        <Pencil className={ico} /> Modifica
      </Button>
      <Button
        variant="outline"
        className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}
      >
        <Link2 className={ico} /> Link
      </Button>
      <Button
        variant="outline"
        className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}
      >
        <BookOpen className={ico} /> Fonte
      </Button>
      <Button
        variant="outline"
        className={`gap-1 rounded-lg border-primary/10 font-medium text-ink-lo hover:bg-primary/6 ${btn}`}
      >
        <LayoutGrid className={ico} /> Board
      </Button>
      <div className="flex-1" />
      <Dropdown>
        <Button
          variant="outline"
          isIconOnly
          className="h-[34px] w-[34px] rounded-lg border-edge text-ink-dim hover:bg-chip-bg"
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

function FullscreenBody({ elemento }: { elemento: Elemento }) {
  return (
    <>
      {/* Tags in fullscreen (shown in body since header is compact) */}
      {elemento.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {elemento.tags.map((t) => (
            <Chip
              key={t}
              size="sm"
              className="bg-chip-bg px-2 py-0.5 text-[11px] font-medium text-ink-lo"
            >
              {t}
            </Chip>
          ))}
        </div>
      )}

      {/* Note section */}
      {elemento.note && (
        <Card className="border-none shadow-none bg-transparent mb-6">
          <Card.Header className="p-0 pb-1">
            <Card.Title className="text-[12px] font-bold uppercase tracking-wider text-ink-lo">
              Note
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <Text className="text-[14px] leading-relaxed text-ink-md">{elemento.note}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Link count summary — placeholder for S03 full gerarchia */}
      {elemento.link.length > 0 && (
        <Card className="border-none shadow-none bg-transparent mb-6">
          <Card.Header className="p-0 pb-1">
            <Card.Title className="text-[12px] font-bold uppercase tracking-wider text-ink-lo">
              Collegamenti
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <Text className="text-[14px] text-ink-lo">
              {elemento.link.length} collegament{elemento.link.length === 1 ? "o" : "i"}
            </Text>
          </Card.Content>
        </Card>
      )}
    </>
  );
}

// ── Component ──

export function FullscreenOverlay({ open, onClose, elemento }: FullscreenOverlayProps) {
  if (!elemento) return null;

  const dataBrief = formatDataBrief(elemento);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-panel transition-all duration-300 ease-in-out ${
        open
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-primary/10 px-4 min-h-[48px]">
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
            onPress={onClose}
            aria-label="Torna alla lista"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Torna alla lista</Tooltip.Content>
        </Tooltip>
        <Text className="font-heading text-base font-semibold text-ink-hi truncate">
          {elemento.titolo}
        </Text>
        <div className="flex items-center gap-1.5">
          <Chip
            size="sm"
            className="bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
          >
            {elemento.tipo}
          </Chip>
          {dataBrief && (
            <Text className="font-heading text-[11px] text-ink-dim">{dataBrief}</Text>
          )}
        </div>
        <div className="flex-1" />
        <Tooltip>
          <Button
            variant="ghost"
            isIconOnly
            className="h-[36px] w-[36px] rounded-lg text-ink-lo hover:bg-primary/6"
            onPress={onClose}
            aria-label="Esci da schermo intero"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Esci da schermo intero</Tooltip.Content>
        </Tooltip>
      </header>

      {/* Toolbar */}
      <FullscreenToolbar />

      {/* Body */}
      <ScrollShadow className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6">
          <FullscreenBody elemento={elemento} />
        </div>
      </ScrollShadow>
    </div>
  );
}
