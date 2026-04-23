/**
 * timeline-d3.ts — Pure D3 SVG rendering engine for the Timeline view.
 *
 * Contract (per D002 / CLAUDE.md §IV):
 * - D3 owns the SVG DOM: creates, updates, and removes all SVG elements.
 * - React owns the container <div>/<svg> element and lifecycle (mount/unmount).
 * - React↔D3 communication: init options + controller methods + callbacks.
 *
 * Timeline orientation (D019): vertical, top = most ancient, bottom = most recent.
 * Year encoding: AEV years are negative (e.g., 2000 AEV → −2000).
 * Zoom/pan: D3 zoom behavior, rescaleY for 60fps performance.
 * Collision avoidance: greedy column assignment based on year proximity.
 */

import * as d3 from "d3";
import type { ElementoTipo } from "@/features/elemento/elemento.model";

// ── Layout constants ──

const MARGIN = { top: 32, right: 24, bottom: 32, left: 90 };
const CARD_W = 196;
const CARD_H = 58;
const CARD_GAP_X = 10;
const AXIS_TICK_WIDTH = 6;

// ── Color map per tipo ──

const TIPO_COLORS: Record<ElementoTipo, string> = {
  personaggio: "#0d9488",
  evento:      "#7c3aed",
  luogo:       "#059669",
  profezia:    "#dc2626",
  regno:       "#d97706",
  periodo:     "#0891b2",
  guerra:      "#b91c1c",
  annotazione: "#6b7280",
};

// ── Public types ──

export interface TimelineCard {
  readonly id: string;
  readonly titolo: string;
  readonly tipo: ElementoTipo;
  readonly tags: readonly string[];
  readonly descrizione: string;
  readonly yearStart: number;
  readonly yearEnd?: number;
  readonly hasDate: boolean;
}

export interface TimelineInitOptions {
  readonly width: number;
  readonly height: number;
  readonly onCardClick: (id: string, anchorRect: DOMRect) => void;
}

export interface TimelineController {
  update: (cards: TimelineCard[]) => void;
  resize: (width: number, height: number) => void;
  resetZoom: () => void;
  destroy: () => void;
}

// ── Internal layout ──

interface LayoutCard extends TimelineCard {
  col: number;
  x: number;
}

// ── Helpers ──

function formatYear(year: number): string {
  if (!isFinite(year)) return "";
  if (year < 0) return `${Math.abs(year)} a.e.v.`;
  return `${year} e.v.`;
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

function tipoColor(tipo: ElementoTipo): string {
  return TIPO_COLORS[tipo] ?? "#6b7280";
}

/**
 * Assign each card to a column (0-based) using a greedy algorithm.
 * Cards with overlapping year ranges land in different columns.
 * The year gap between consecutive cards in the same column is derived from
 * the pixel scale so adjacent cards don't overlap at the initial zoom level.
 */
function assignColumns(
  cards: TimelineCard[],
  yScale: d3.ScaleLinear<number, number>,
): LayoutCard[] {
  const sorted = [...cards]
    .filter((c) => c.hasDate)
    .sort((a, b) => a.yearStart - b.yearStart);

  // columnEnds: last pixel-bottom of last card placed in each column
  const columnEnds: number[] = [];

  const result: LayoutCard[] = sorted.map((card) => {
    const y = yScale(card.yearStart);
    let col = 0;
    while (col < columnEnds.length && columnEnds[col] > y - 4) {
      col++;
    }
    const bottom = y + CARD_H;
    if (col >= columnEnds.length) {
      columnEnds.push(bottom);
    } else {
      columnEnds[col] = bottom;
    }
    return {
      ...card,
      col,
      x: MARGIN.left + col * (CARD_W + CARD_GAP_X),
    };
  });

  // Undated cards: stack in the last column at the bottom
  const undated = cards.filter((c) => !c.hasDate);
  let undatedY = 0;
  const lastColUsed = Math.max(0, columnEnds.length);
  undated.forEach((card, i) => {
    result.push({
      ...card,
      col: lastColUsed,
      x: MARGIN.left + lastColUsed * (CARD_W + CARD_GAP_X),
      // will be placed at bottom — y handled as special case
      yearStart: undatedY + i, // won't be used for y positioning
    });
  });

  return result;
}

function computeYDomain(cards: TimelineCard[]): [number, number] {
  const datedCards = cards.filter((c) => c.hasDate);
  if (datedCards.length === 0) return [-2000, 2000];
  const years = datedCards.flatMap((c) =>
    c.yearEnd !== undefined ? [c.yearStart, c.yearEnd] : [c.yearStart],
  );
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const span = Math.max(maxY - minY, 100);
  const pad = span * 0.12;
  return [minY - pad, maxY + pad];
}

// ── Main init function ──

export function initTimeline(
  svgEl: SVGSVGElement,
  options: TimelineInitOptions,
): TimelineController {
  let opts = { ...options };
  let cards: TimelineCard[] = [];
  let layoutCards: LayoutCard[] = [];
  let yScale = d3.scaleLinear<number>();
  let currentTransform = d3.zoomIdentity;
  let rafId: number | null = null;

  const svg = d3.select(svgEl)
    .attr("width", opts.width)
    .attr("height", opts.height)
    .style("cursor", "grab");

  // Click-to-dismiss background
  const bgRect = svg.append("rect")
    .attr("class", "timeline-bg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .attr("fill", "transparent")
    .on("click", () => opts.onCardClick("", new DOMRect()));

  // Grid lines layer (behind cards)
  const gridLayer = svg.append("g").attr("class", "grid-layer");

  // Axis layer
  const axisLayer = svg.append("g")
    .attr("class", "axis-layer")
    .attr("transform", `translate(${MARGIN.left - AXIS_TICK_WIDTH - 4}, 0)`);

  // Axis line
  const axisLine = svg.append("line")
    .attr("class", "axis-line")
    .attr("x1", MARGIN.left - 2)
    .attr("x2", MARGIN.left - 2)
    .attr("y1", MARGIN.top)
    .attr("y2", opts.height - MARGIN.bottom)
    .attr("stroke", "#0d9488")
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round");

  // Card layer
  const cardLayer = svg.append("g").attr("class", "card-layer");

  // No-date label (if any undated items)
  const undatedLabel = svg.append("text")
    .attr("class", "undated-label")
    .attr("x", MARGIN.left)
    .attr("y", opts.height - 10)
    .attr("font-size", 10)
    .attr("fill", "#94a3b8")
    .style("display", "none");

  // ── Zoom behavior ──

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.02, 40])
    .filter((event) => {
      // Allow wheel zoom and touch/drag pan; block double-click zoom
      if (event.type === "dblclick") return false;
      return true;
    })
    .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      currentTransform = event.transform;
      // Throttle to RAF
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyTransform();
      });
    });

  svg.call(zoom).on("dblclick.zoom", null);

  // ── Rendering ──

  function buildYScale(w: number, h: number): d3.ScaleLinear<number, number> {
    const [domainMin, domainMax] = computeYDomain(cards);
    return d3.scaleLinear()
      .domain([domainMin, domainMax])
      .range([MARGIN.top, h - MARGIN.bottom]);
  }

  function renderAxis(rescaledY: d3.ScaleLinear<number, number>) {
    const tickCount = Math.max(3, Math.floor((opts.height - MARGIN.top - MARGIN.bottom) / 60));
    const axis = d3.axisLeft(rescaledY)
      .ticks(tickCount)
      .tickSizeInner(AXIS_TICK_WIDTH)
      .tickSizeOuter(0)
      .tickFormat((d) => formatYear(d as number));

    axisLayer.call(axis);

    // Style axis elements
    axisLayer.select(".domain").attr("stroke", "#0d9488").attr("stroke-width", 1.5);
    axisLayer.selectAll(".tick line").attr("stroke", "#0d9488").attr("stroke-opacity", 0.6);
    axisLayer.selectAll(".tick text")
      .attr("font-family", "'Fira Code', monospace")
      .attr("font-size", 9)
      .attr("fill", "#64748b")
      .attr("dx", -2);

    // Horizontal grid lines
    const ticks = rescaledY.ticks(tickCount);
    const gridLines = gridLayer.selectAll<SVGLineElement, number>("line.grid-tick")
      .data(ticks);

    gridLines.join("line")
      .attr("class", "grid-tick")
      .attr("x1", MARGIN.left - 2)
      .attr("x2", opts.width - MARGIN.right)
      .attr("y1", (d) => rescaledY(d))
      .attr("y2", (d) => rescaledY(d))
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,4");
  }

  function renderCards(rescaledY: d3.ScaleLinear<number, number>) {
    const cardGroups = cardLayer
      .selectAll<SVGGElement, LayoutCard>("g.card")
      .data(layoutCards, (d) => d.id);

    // EXIT
    cardGroups.exit().remove();

    // ENTER
    const enterGroups = cardGroups.enter().append("g").attr("class", "card");

    // Card background rect
    enterGroups.append("rect")
      .attr("class", "card-bg")
      .attr("width", CARD_W)
      .attr("height", CARD_H)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "#ffffff")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.05))");

    // Left color accent
    enterGroups.append("rect")
      .attr("class", "card-accent")
      .attr("width", 3)
      .attr("height", CARD_H)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", (d) => tipoColor(d.tipo));

    // Connection line from axis to card
    enterGroups.append("line")
      .attr("class", "card-connector")
      .attr("x1", -CARD_W) // will be computed in update
      .attr("y1", CARD_H / 2)
      .attr("x2", 0)
      .attr("y2", CARD_H / 2)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Title text
    enterGroups.append("text")
      .attr("class", "card-title")
      .attr("x", 12)
      .attr("y", 22)
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .attr("font-family", "'Fira Sans', sans-serif")
      .attr("fill", "#1e293b");

    // Tipo label
    enterGroups.append("text")
      .attr("class", "card-tipo")
      .attr("x", 12)
      .attr("y", 38)
      .attr("font-size", 9)
      .attr("font-family", "'Fira Sans', sans-serif");

    // Date label (right-aligned)
    enterGroups.append("text")
      .attr("class", "card-date")
      .attr("x", CARD_W - 10)
      .attr("y", 22)
      .attr("font-size", 9)
      .attr("text-anchor", "end")
      .attr("font-family", "'Fira Code', monospace")
      .attr("fill", "#94a3b8");

    // Transparent click target
    enterGroups.append("rect")
      .attr("class", "card-click-target")
      .attr("width", CARD_W)
      .attr("height", CARD_H)
      .attr("fill", "transparent")
      .attr("rx", 6)
      .attr("ry", 6)
      .style("cursor", "pointer");

    // MERGE (enter + update)
    const merged = enterGroups.merge(cardGroups);

    // Update content
    merged.select(".card-title").text((d) => truncate(d.titolo, 22));
    merged.select(".card-tipo")
      .attr("fill", (d) => tipoColor(d.tipo))
      .text((d) => d.tipo);
    merged.select(".card-date")
      .text((d) => (d.hasDate ? formatYear(d.yearStart) : ""));

    // Update connection line x1 = axis_x - card_x
    merged.select(".card-connector")
      .attr("x1", (d) => (MARGIN.left - 2) - d.x)
      .attr("x2", 0);

    // Click handler
    merged.select(".card-click-target")
      .on("click", (event: MouseEvent, d: LayoutCard) => {
        event.stopPropagation();
        const rect = (event.currentTarget as Element).getBoundingClientRect();
        opts.onCardClick(d.id, rect);
      });

    // Hover effect
    merged
      .on("mouseenter", function () {
        d3.select(this).select(".card-bg")
          .attr("stroke", "#0d9488")
          .attr("stroke-width", 1.5)
          .style("filter", "drop-shadow(0 2px 8px rgba(13,148,136,0.15))");
      })
      .on("mouseleave", function () {
        d3.select(this).select(".card-bg")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-width", 1)
          .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.05))");
      });

    // Update positions
    merged.attr("transform", (d) => {
      const y = d.hasDate ? rescaledY(d.yearStart) - CARD_H / 2 : opts.height - MARGIN.bottom - CARD_H - 10;
      return `translate(${d.x}, ${y})`;
    });
  }

  function applyTransform() {
    const rescaledY = currentTransform.rescaleY(yScale);
    renderAxis(rescaledY);
    // Update card y-positions (fast path: no layout recompute)
    cardLayer
      .selectAll<SVGGElement, LayoutCard>("g.card")
      .attr("transform", (d) => {
        const y = d.hasDate ? rescaledY(d.yearStart) - CARD_H / 2 : opts.height - MARGIN.bottom - CARD_H - 10;
        return `translate(${d.x}, ${y})`;
      });
  }

  function render() {
    yScale = buildYScale(opts.width, opts.height);
    layoutCards = assignColumns(cards, yScale);

    // Update SVG dimensions
    svg.attr("width", opts.width).attr("height", opts.height);
    bgRect.attr("width", opts.width).attr("height", opts.height);
    axisLine
      .attr("y1", MARGIN.top)
      .attr("y2", opts.height - MARGIN.bottom);

    const rescaledY = currentTransform.rescaleY(yScale);
    renderAxis(rescaledY);
    renderCards(rescaledY);

    const undatedCount = cards.filter((c) => !c.hasDate).length;
    if (undatedCount > 0) {
      undatedLabel
        .style("display", null)
        .text(`${undatedCount} elemento/i senza data`);
    } else {
      undatedLabel.style("display", "none");
    }
  }

  // Initial render
  render();

  // ── Controller ──

  return {
    update(newCards) {
      cards = newCards;
      render();
    },
    resize(w, h) {
      opts = { ...opts, width: w, height: h };
      render();
    },
    resetZoom() {
      svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    },
    destroy() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      svg.on(".zoom", null);
      svg.selectAll("*").remove();
    },
  };
}
