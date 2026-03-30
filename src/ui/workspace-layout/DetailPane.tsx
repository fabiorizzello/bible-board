import {
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Kbd,
  Label,
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
  Pencil,
} from "lucide-react";
import type { Elemento } from "@/features/elemento/elemento.model";

// ── Props ──

interface DetailPaneProps {
  readonly elemento: Elemento | null;
  readonly onMaximize: () => void;
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

function ActionToolbar() {
  const btn = "min-h-[30px] px-2.5 py-1 text-[11px]";
  const ico = "h-3 w-3";

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
          className="h-[30px] w-[30px] rounded-lg border-edge text-ink-dim hover:bg-chip-bg"
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

function DetailBody({ elemento }: { elemento: Elemento }) {
  return (
    <>
      {/* Note section */}
      {elemento.note && (
        <Card className="border-none shadow-none bg-transparent mb-4">
          <Card.Header className="p-0 pb-1">
            <Card.Title className="text-[12px] font-bold uppercase tracking-wider text-ink-lo">
              Note
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <Text className="text-[13px] leading-relaxed text-ink-md">{elemento.note}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Link count summary — placeholder for S03 full gerarchia */}
      {elemento.link.length > 0 && (
        <Card className="border-none shadow-none bg-transparent mb-4">
          <Card.Header className="p-0 pb-1">
            <Card.Title className="text-[12px] font-bold uppercase tracking-wider text-ink-lo">
              Collegamenti
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <Text className="text-[13px] text-ink-lo">
              {elemento.link.length} collegament{elemento.link.length === 1 ? "o" : "i"}
            </Text>
          </Card.Content>
        </Card>
      )}
    </>
  );
}

// ── Component ──

export function DetailPane({ elemento, onMaximize }: DetailPaneProps) {
  if (!elemento) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmptyState className="flex flex-1 flex-col items-center justify-center gap-2">
          <Text className="text-base font-semibold text-ink-md">Seleziona un elemento</Text>
          <Text className="text-sm text-ink-dim">
            Scegli dalla lista per visualizzarne i dettagli.
          </Text>
          <Text className="mt-3 text-[11px] text-ink-ghost">
            Premi <Kbd className="text-[10px]">/</Kbd> per cercare
          </Text>
        </EmptyState>
      </div>
    );
  }

  const dataBrief = formatDataBrief(elemento);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Detail header */}
      <Card className="border-none shadow-none rounded-none border-b border-primary/6 bg-transparent">
        <Card.Header className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between">
            <Card.Title className="font-heading text-lg font-semibold text-ink-hi">
              {elemento.titolo}
            </Card.Title>
            <Tooltip>
              <Button
                variant="ghost"
                isIconOnly
                className="h-[30px] w-[30px] rounded-md text-ink-dim hover:bg-primary/6"
                onPress={onMaximize}
                aria-label="Schermo intero"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Tooltip.Content>Schermo intero</Tooltip.Content>
            </Tooltip>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Chip
              size="sm"
              className="bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary"
            >
              {elemento.tipo}
            </Chip>
            {elemento.tags.map((t) => (
              <Chip
                key={t}
                size="sm"
                className="bg-chip-bg px-1.5 py-px text-[10px] font-medium text-ink-lo"
              >
                {t}
              </Chip>
            ))}
            {dataBrief && (
              <Text className="font-heading text-[11px] text-ink-dim">{dataBrief}</Text>
            )}
          </div>
        </Card.Header>
      </Card>

      {/* Action toolbar */}
      <ActionToolbar />

      {/* Detail body */}
      <ScrollShadow className="flex-1 overflow-y-auto px-4 py-3">
        <DetailBody elemento={elemento} />
      </ScrollShadow>
    </div>
  );
}
