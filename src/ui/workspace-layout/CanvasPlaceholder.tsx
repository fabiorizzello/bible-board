import { Clock } from "lucide-react";

/**
 * Placeholder for spatial views (timeline, graph, genealogy).
 * Replaced by the real D3 timeline in S07.
 */
export function CanvasPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface">
      <Clock className="h-8 w-8 text-ink-dim" />
      <p className="text-sm text-ink-lo">
        Timeline — disponibile in S07
      </p>
    </div>
  );
}
