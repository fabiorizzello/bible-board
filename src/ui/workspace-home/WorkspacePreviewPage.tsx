/**
 * WorkspacePreviewPage — thin composition shell.
 *
 * Assembles the 3-pane layout from extracted components:
 * NavSidebar, ListPane, DetailPane, ThemeSwitcher, FullscreenOverlay.
 *
 * Mounts Toast.Provider here (composition shell level) so imperative
 * `toast()` calls from any pane render into a shared bottom region.
 * iPad-native: bottom placement keeps undo affordances near the thumb.
 */

import { Toast } from "@heroui/react";

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
      <Toast.Provider placement="bottom" />
    </div>
  );
}
