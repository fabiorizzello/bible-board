/**
 * NavSidebar — workspace navigation sidebar.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads/writes shared state via Legend State workspace-ui-store.
 */

import {
  Avatar,
  Button,
  Dropdown,
  Label,
  ListBox,
  ScrollShadow,
  Separator,
  Text,
  Tooltip,
} from "@heroui/react";
import {
  Check,
  ChevronDown,
  Clock,
  LayoutGrid,
  List,
  PanelLeft,
  Plus,
  Settings,
} from "lucide-react";
import { useValue } from "@legendapp/state/react";

import { workspaceUi$, navigateToView } from "./workspace-ui-store";
import type { ViewId } from "./workspace-ui-store";
import { getBoardDisplayItems } from "./display-helpers";

const BOARD_ITEMS = getBoardDisplayItems();

export function NavSidebar() {
  const currentView = useValue(workspaceUi$.currentView);
  const sidebarOpen = useValue(workspaceUi$.sidebarOpen);

  function handleNavChange(viewId: ViewId) {
    navigateToView(viewId);
  }

  return (
    <nav
      className={`flex flex-col border-r border-primary/10 bg-chrome transition-all duration-200 ease-in-out overflow-hidden ${
        sidebarOpen ? "w-[220px] min-w-[220px]" : "w-0 min-w-0"
      }`}
      aria-label="Navigazione workspace"
    >
      {/* Workspace switcher — Dropdown + Avatar */}
      <div className="px-2 pt-2 pb-1">
        <Dropdown>
          <Button
            variant="ghost"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 min-h-[44px] text-left hover:bg-primary/6 cursor-pointer"
          >
            <Avatar size="sm" className="h-7 w-7 flex-shrink-0">
              <Avatar.Fallback className="bg-primary text-[11px] font-bold text-white">W</Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Text className="block font-heading text-[13px] font-semibold text-ink-hi truncate">
                Il mio workspace
              </Text>
              <Text className="flex items-center gap-1 text-[10px] text-ink-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Sincronizzato
              </Text>
            </div>
            <ChevronDown className="h-3 w-3 text-ink-dim flex-shrink-0" />
          </Button>
          <Dropdown.Popover placement="bottom start" className="min-w-[200px]">
            <Dropdown.Menu onAction={() => {}}>
              <Dropdown.Section>
                <Dropdown.Item id="current" textValue="Il mio workspace">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink-md">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <Label>Il mio workspace</Label>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item id="marco" textValue="Workspace di Marco">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink-lo">
                    <span className="w-3.5" />
                    <Label>Workspace di Marco</Label>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item id="gruppo" textValue="Studio gruppo">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink-lo">
                    <span className="w-3.5" />
                    <Label>Studio gruppo</Label>
                  </div>
                </Dropdown.Item>
              </Dropdown.Section>
              <Separator />
              <Dropdown.Section>
                <Dropdown.Item id="new" textValue="Nuovo workspace">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
                    <Plus className="h-3.5 w-3.5" />
                    <Label>Nuovo workspace</Label>
                  </div>
                </Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <Separator className="mx-3 my-1 border-primary/6" />

      {/* Nav ListBox — keyboard-navigable selection */}
      <ScrollShadow className="flex-1 overflow-y-auto px-1.5">
        <ListBox
          aria-label="Navigazione principale"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={!currentView.startsWith("board-") ? new Set([currentView]) : new Set()}
          onSelectionChange={(keys) => {
            if (keys !== "all" && keys.size > 0) {
              handleNavChange(String([...keys][0]) as ViewId);
            }
          }}
          className="border-none p-0 outline-none"
        >
          <ListBox.Item
            id="recenti"
            textValue="Recenti"
            className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <Label>Recenti</Label>
          </ListBox.Item>
          <ListBox.Item
            id="tutti"
            textValue="Tutti gli elementi"
            className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
          >
            <List className="h-4 w-4 flex-shrink-0" />
            <Label>Tutti gli elementi</Label>
          </ListBox.Item>
        </ListBox>

        {/* Board section header */}
        <div className="mt-4 mb-1 flex items-center justify-between px-2.5">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-ink-dim">Board</Text>
          <Tooltip>
            <Button
              variant="ghost"
              isIconOnly
              className="h-[24px] w-[24px] rounded text-ink-dim hover:bg-primary/6 hover:text-accent"
              aria-label="Nuovo board"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Tooltip.Content>Nuovo board</Tooltip.Content>
          </Tooltip>
        </div>

        {/* Board ListBox — separate to keep orange selection styling */}
        <ListBox
          aria-label="Board"
          selectionMode="single"
          selectedKeys={currentView.startsWith("board-") ? new Set([currentView]) : new Set()}
          onSelectionChange={(keys) => {
            if (keys !== "all" && keys.size > 0) {
              handleNavChange(String([...keys][0]) as ViewId);
            }
          }}
          className="border-none p-0 outline-none"
        >
          {BOARD_ITEMS.map((board) => (
            <ListBox.Item
              key={board.id}
              id={board.viewId}
              textValue={board.nome}
              className="flex items-center gap-2 rounded-lg px-2.5 min-h-[40px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-accent/10 data-[selected]:text-accent data-[selected]:font-semibold"
            >
              <LayoutGrid className="h-4 w-4 flex-shrink-0 text-ink-dim" />
              <Text className="flex-1 truncate">{board.nome}</Text>
              <Text className="font-heading text-[10px] text-ink-dim">{board.count}</Text>
            </ListBox.Item>
          ))}
        </ListBox>
      </ScrollShadow>

      {/* Settings footer */}
      <div className="border-t border-primary/6 px-1.5 py-1.5">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 rounded-lg px-2.5 min-h-[36px] text-[13px] font-medium text-ink-lo hover:bg-primary/6"
          >
            <Settings className="h-4 w-4" />
            Impostazioni
          </Button>
          <Tooltip>
            <Button
              variant="ghost"
              isIconOnly
              className="h-[36px] w-[36px] rounded-lg text-ink-dim hover:bg-primary/6"
              onPress={() => workspaceUi$.sidebarOpen.set(false)}
              aria-label="Chiudi navigazione"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
            <Tooltip.Content>Chiudi navigazione</Tooltip.Content>
          </Tooltip>
        </div>
      </div>
    </nav>
  );
}
