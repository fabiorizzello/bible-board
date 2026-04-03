/**
 * WorkspacePreviewPage — thin composition shell.
 *
 * Assembles the 3-pane layout from extracted components:
 * NavSidebar, ListPane, DetailPane, ThemeSwitcher, FullscreenOverlay.
 */

import { NavSidebar } from "./NavSidebar";
import { ListPane } from "./ListPane";
import { DetailPane } from "./DetailPane";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { FullscreenOverlay } from "./FullscreenOverlay";

export function WorkspacePreviewPage() {
  return (
    <div className="flex h-screen bg-panel font-body">
      <NavSidebar />
      <ListPane />
      <DetailPane />
      <ThemeSwitcher />
      <FullscreenOverlay />
    </div>
  );
}
