/**
 * Timeline — React host for the D3 vertical SVG timeline.
 *
 * Responsibility split (D002):
 * - React: container sizing, data bridge, popup overlay, lifecycle.
 * - D3 (timeline-d3.ts): all SVG rendering, zoom/pan behavior.
 *
 * Integration: rendered by WorkspacePreviewPage when activeBoardView === 'timeline'
 * for a board view. Takes the full remaining width (replaces ListPane + DetailPane).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useValue } from "@legendapp/state/react";
import { X, Clock, ArrowLeft, Tag } from "lucide-react";

import { initTimeline } from "./timeline-d3";
import type { TimelineCard, TimelineController } from "./timeline-d3";
import { workspaceUi$, selectElement, setActiveBoardView } from "@/ui/workspace-home/workspace-ui-store";
import {
  getElementsForView,
  TIPO_ABBREV,
  formatElementDate,
} from "@/ui/workspace-home/display-helpers";
import type { Elemento } from "@/features/elemento/elemento.model";
import type { DataStorica } from "@/features/shared/value-objects";

// ── Dato conversion ──

function dataStoricaToYear(d: DataStorica): number {
  return d.era === "aev" ? -d.anno : d.anno;
}

function elementoToCard(el: Elemento): TimelineCard {
  let yearStart = NaN;
  let yearEnd: number | undefined;
  let hasDate = false;

  if (el.nascita) {
    yearStart = dataStoricaToYear(el.nascita);
    hasDate = true;
  }
  if (el.morte && !isNaN(yearStart)) {
    yearEnd = dataStoricaToYear(el.morte);
  }
  if (!hasDate && el.date) {
    if (el.date.kind === "puntuale") {
      yearStart = dataStoricaToYear(el.date.data);
      hasDate = true;
    } else {
      yearStart = dataStoricaToYear(el.date.inizio);
      yearEnd = dataStoricaToYear(el.date.fine);
      hasDate = true;
    }
  }

  return {
    id: el.id as string,
    titolo: el.titolo,
    tipo: el.tipo,
    tags: el.tags,
    descrizione: el.descrizione,
    yearStart: isNaN(yearStart) ? 0 : yearStart,
    yearEnd,
    hasDate,
  };
}

// ── Popup ──

interface PopupState {
  elementoId: string;
  anchorRect: DOMRect;
}

interface TimelinePopupProps {
  elementoId: string;
  anchorRect: DOMRect;
  containerRect: DOMRect;
  elementi: Elemento[];
  onClose: () => void;
  onOpenDetail: (id: string) => void;
}

function TimelinePopup({
  elementoId,
  anchorRect,
  containerRect,
  elementi,
  onClose,
  onOpenDetail,
}: TimelinePopupProps) {
  const el = elementi.find((e) => (e.id as string) === elementoId);
  if (!el) return null;

  const dateStr = formatElementDate(el);

  // Position popup to the right of the card; flip left if no space
  const POPUP_W = 280;
  const POPUP_H = 200; // approximate
  const cardRight = anchorRect.right - containerRect.left;
  const cardTop = anchorRect.top - containerRect.top;

  let left = cardRight + 8;
  if (left + POPUP_W > containerRect.width - 8) {
    left = anchorRect.left - containerRect.left - POPUP_W - 8;
  }
  if (left < 8) left = 8;

  let top = cardTop;
  if (top + POPUP_H > containerRect.height - 8) {
    top = containerRect.height - POPUP_H - 8;
  }
  if (top < 8) top = 8;

  const descPreview = el.descrizione
    ? el.descrizione.slice(0, 180) + (el.descrizione.length > 180 ? "…" : "")
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Dettaglio: ${el.titolo}`}
      style={{
        position: "absolute",
        left,
        top,
        width: POPUP_W,
        zIndex: 50,
      }}
      className="rounded-xl border border-edge bg-panel shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2 border-b border-edge">
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold text-ink-hi truncate leading-tight">
            {el.titolo}
          </p>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: tipoColorCss(el.tipo) }}>
            {TIPO_ABBREV[el.tipo] ?? el.tipo}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 mt-0.5 rounded-md p-0.5 text-ink-dim hover:bg-primary/8 hover:text-ink-md transition-colors"
          aria-label="Chiudi"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-2.5 space-y-2">
        {dateStr && (
          <div className="flex items-center gap-1.5 text-ink-lo">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="font-heading text-[10px]">{dateStr}</span>
          </div>
        )}

        {el.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 flex-shrink-0 text-ink-dim" />
            {el.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/8 px-1.5 py-px text-[9px] font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {descPreview && (
          <p className="text-[10px] text-ink-lo leading-relaxed line-clamp-3">
            {descPreview}
          </p>
        )}

        {!descPreview && !dateStr && (
          <p className="text-[10px] text-ink-ghost italic">Nessun dettaglio disponibile.</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end px-4 pb-3 pt-1">
        <button
          type="button"
          onClick={() => onOpenDetail(el.id as string)}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:brightness-105 active:scale-95 transition-all min-h-[32px]"
        >
          <ArrowLeft className="h-3 w-3 rotate-180" />
          Apri scheda
        </button>
      </div>
    </div>
  );
}

function tipoColorCss(tipo: string): string {
  const colors: Record<string, string> = {
    personaggio: "#0d9488",
    evento:      "#7c3aed",
    luogo:       "#059669",
    profezia:    "#dc2626",
    regno:       "#d97706",
    periodo:     "#0891b2",
    guerra:      "#b91c1c",
    annotazione: "#6b7280",
  };
  return colors[tipo] ?? "#6b7280";
}

// ── Main component ──

export function Timeline() {
  const currentView = useValue(workspaceUi$.currentView);
  const lastModified = useValue(workspaceUi$.lastModified);
  void lastModified; // trigger re-render on Jazz sync

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const controllerRef = useRef<TimelineController | null>(null);

  const [popup, setPopup] = useState<PopupState | null>(null);
  const [size, setSize] = useState({ width: 900, height: 700 });

  // Resolve elements for the current board view
  const elementi: Elemento[] = getElementsForView(currentView, "", "Tutti");
  const cards: TimelineCard[] = elementi.map(elementoToCard);

  // ── D3 init on mount ──
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const controller = initTimeline(svgEl, {
      width: size.width,
      height: size.height,
      onCardClick: (id, rect) => {
        if (!id) {
          setPopup(null);
        } else {
          setPopup({ elementoId: id, anchorRect: rect });
        }
      },
    });
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once on mount

  // ── Update D3 when data or size changes ──
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.update(cards);
  }, [cards.length, currentView, lastModified]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.resize(size.width, size.height);
  }, [size.width, size.height]);

  // ── ResizeObserver ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Popup handlers ──
  const handleClosePopup = useCallback(() => setPopup(null), []);

  const handleOpenDetail = useCallback((id: string) => {
    setPopup(null);
    setActiveBoardView("lista");
    selectElement(id);
  }, []);

  const containerRect = containerRef.current?.getBoundingClientRect() ?? new DOMRect();

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-surface overflow-hidden"
      style={{ minWidth: 0 }}
      onClick={() => setPopup(null)}
    >
      {/* D3-managed SVG */}
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="block select-none"
        aria-label="Vista timeline"
        role="img"
        style={{ touchAction: "none" }}
      />

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-ink-lo">Nessun elemento in questa board.</p>
          <p className="text-xs text-ink-ghost mt-1">Aggiungi elementi e riprova.</p>
        </div>
      )}

      {/* Card popup overlay */}
      {popup && (
        <TimelinePopup
          elementoId={popup.elementoId}
          anchorRect={popup.anchorRect}
          containerRect={containerRect}
          elementi={elementi}
          onClose={handleClosePopup}
          onOpenDetail={handleOpenDetail}
        />
      )}
    </div>
  );
}
