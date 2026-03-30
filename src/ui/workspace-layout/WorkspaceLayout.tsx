import { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router";
import { NavSidebar } from "./NavSidebar";

// ── Component ──

export function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { elementoId } = useParams<{ elementoId?: string; boardId?: string }>();

  // Auto-hide sidebar when an elemento is selected (R004)
  useEffect(() => {
    if (elementoId) {
      setSidebarOpen(false);
    }
  }, [elementoId]);

  return (
    <div className="flex h-screen bg-panel font-body">
      {/* Sidebar */}
      <NavSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* List pane (placeholder — T02 fills this) */}
      <div className="flex w-[300px] min-w-[300px] flex-col border-r border-primary/10 overflow-hidden">
        <div className="flex flex-1 items-center justify-center text-xs text-ink-dim">
          List pane
        </div>
      </div>

      {/* Detail pane (placeholder — T02 fills this) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 items-center justify-center text-xs text-ink-dim">
          Detail pane
        </div>
      </div>

      {/* Outlet renders null but enables child route matching for useParams() */}
      <Outlet />
    </div>
  );
}
