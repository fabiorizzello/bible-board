import { useState, useEffect, useMemo } from "react";
import { Outlet, useParams } from "react-router";
import { NavSidebar } from "./NavSidebar";
import { ListPane } from "./ListPane";
import { DetailPane } from "./DetailPane";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { CanvasPlaceholder } from "./CanvasPlaceholder";
import { ELEMENTI_MAP, BOARDS } from "@/mock";

// ── Component ──

export function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { elementoId, boardId } = useParams<{ elementoId?: string; boardId?: string }>();

  // Auto-hide sidebar when an elemento is selected (R004)
  useEffect(() => {
    if (elementoId) {
      setSidebarOpen(false);
    }
  }, [elementoId]);

  // Resolve selected element from URL param
  const elemento = elementoId ? ELEMENTI_MAP.get(elementoId) ?? null : null;

  // Canvas mode: board present with a non-lista view (R005)
  const isCanvasMode = useMemo(() => {
    if (!boardId) return false;
    const board = BOARDS.find((b) => b.id === boardId);
    return !!board && board.ultimaVista !== "lista";
  }, [boardId]);

  return (
    <div className="flex h-screen bg-panel font-body">
      {/* Sidebar */}
      <NavSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* List pane — collapses in canvas mode */}
      <ListPane
        sidebarOpen={sidebarOpen}
        onOpenSidebar={() => setSidebarOpen(true)}
        visible={!isCanvasMode}
      />

      {/* Canvas placeholder or detail pane */}
      {isCanvasMode ? (
        <CanvasPlaceholder />
      ) : (
        <DetailPane
          elemento={elemento}
          onMaximize={() => setFullscreen(true)}
        />
      )}

      {/* Fullscreen overlay */}
      <FullscreenOverlay
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        elemento={elemento}
      />

      {/* Outlet renders null but enables child route matching for useParams() */}
      <Outlet />
    </div>
  );
}
