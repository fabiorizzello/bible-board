import { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router";
import { NavSidebar } from "./NavSidebar";
import { ListPane } from "./ListPane";
import { DetailPane } from "./DetailPane";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { ELEMENTI_MAP } from "@/mock";

// ── Component ──

export function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { elementoId } = useParams<{ elementoId?: string; boardId?: string }>();

  // Auto-hide sidebar when an elemento is selected (R004)
  useEffect(() => {
    if (elementoId) {
      setSidebarOpen(false);
    }
  }, [elementoId]);

  // Resolve selected element from URL param
  const elemento = elementoId ? ELEMENTI_MAP.get(elementoId) ?? null : null;

  return (
    <div className="flex h-screen bg-panel font-body">
      {/* Sidebar */}
      <NavSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* List pane */}
      <ListPane
        sidebarOpen={sidebarOpen}
        onOpenSidebar={() => setSidebarOpen(true)}
        visible={true} /* canvas mode toggle added in T03 */
      />

      {/* Detail pane */}
      <DetailPane
        elemento={elemento}
        onMaximize={() => setFullscreen(true)}
      />

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
