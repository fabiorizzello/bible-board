/**
 * NavSidebar — workspace navigation sidebar.
 *
 * Extracted from WorkspacePreviewPage monolith.
 * Reads/writes shared state via Legend State workspace-ui-store.
 */

import {
  AlertDialog,
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
  MoreHorizontal,
  PanelLeft,
  Plus,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useValue } from "@legendapp/state/react";

import {
  workspaceUi$,
  navigateToView,
  createBoardInWorkspace,
  renameBoardInWorkspace,
  deleteBoardFromWorkspace,
} from "./workspace-ui-store";
import type { ViewId } from "./workspace-ui-store";
import { getBoardDisplayItems } from "./display-helpers";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { NotificationBell } from "./NotificationBell";

export function NavSidebar() {
  const currentView = useValue(workspaceUi$.currentView);
  const sidebarOpen = useValue(workspaceUi$.sidebarOpen);
  const lastModified = useValue(workspaceUi$.lastModified);
  void lastModified;
  const boardItems = getBoardDisplayItems();

  // Create board modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  // Inline rename state
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation state
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const deletingBoard = boardItems.find((b) => b.id === deletingBoardId);

  function handleNavChange(viewId: ViewId) {
    navigateToView(viewId);
  }

  function handleCreateBoard() {
    const name = newBoardName.trim();
    if (!name) return;
    createBoardInWorkspace(name);
    setNewBoardName("");
    setShowCreate(false);
  }

  function startRename(boardId: string, currentNome: string) {
    setRenamingBoardId(boardId);
    setRenameValue(currentNome);
  }

  function confirmRename(boardId: string) {
    const name = renameValue.trim();
    if (name) renameBoardInWorkspace(boardId, name);
    setRenamingBoardId(null);
    setRenameValue("");
  }

  function cancelRename() {
    setRenamingBoardId(null);
    setRenameValue("");
  }

  function confirmDelete() {
    if (!deletingBoardId) return;
    deleteBoardFromWorkspace(deletingBoardId);
    setDeletingBoardId(null);
  }

  return (
    <div className={`flex-shrink-0 overflow-hidden ${sidebarOpen ? "w-[220px]" : "w-0"}`}>
    <nav
      className={`w-[220px] h-full flex flex-col border-r border-primary/10 bg-chrome transition-opacity duration-200 ${
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="Navigazione workspace"
      aria-hidden={!sidebarOpen}
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
            className="flex items-center gap-2 rounded-lg px-2.5 min-h-[44px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <Label>Recenti</Label>
          </ListBox.Item>
          <ListBox.Item
            id="tutti"
            textValue="Tutti gli elementi"
            className="flex items-center gap-2 rounded-lg px-2.5 min-h-[44px] text-[13px] font-medium text-ink-lo cursor-pointer data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-semibold"
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
              className="h-[44px] w-[44px] rounded text-ink-dim hover:bg-primary/6 hover:text-accent"
              aria-label="Nuovo board"
              onPress={() => { setNewBoardName(""); setShowCreate(true); }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Tooltip.Content>Nuovo board</Tooltip.Content>
          </Tooltip>
        </div>

        {/* Board items — custom rows to support inline rename */}
        <div role="listbox" aria-label="Board" className="flex flex-col gap-px">
          {boardItems.map((board) => {
            const isSelected = currentView === board.viewId;
            const isRenaming = renamingBoardId === board.id;
            return (
              <div
                key={board.id}
                role="option"
                aria-selected={isSelected}
                className={`group flex items-center gap-2 rounded-lg px-2.5 min-h-[44px] cursor-pointer text-[13px] font-medium transition-colors ${
                  isSelected
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-ink-lo hover:bg-primary/6"
                }`}
                onClick={() => {
                  if (!isRenaming) handleNavChange(board.viewId);
                }}
              >
                <LayoutGrid className="h-4 w-4 flex-shrink-0 text-ink-dim" />

                {isRenaming ? (
                  <input
                    autoFocus
                    className="flex-1 bg-transparent text-[13px] outline-none border-b border-primary/40 py-0.5 text-ink-hi"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); confirmRename(board.id); }
                      if (e.key === "Escape") cancelRename();
                      e.stopPropagation();
                    }}
                    onBlur={() => confirmRename(board.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Text
                    className="flex-1 truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(board.id, board.nome);
                    }}
                  >
                    {board.nome}
                  </Text>
                )}

                <Text className="font-heading text-[10px] text-ink-dim flex-shrink-0">
                  {board.count}
                </Text>

                {!isRenaming && (
                  <Dropdown>
                    <Button
                      variant="ghost"
                      isIconOnly
                      className="h-[44px] w-[44px] rounded opacity-0 group-hover:opacity-100 text-ink-dim hover:bg-primary/10 flex-shrink-0"
                      aria-label={`Azioni per ${board.nome}`}
                      onPress={(e) => { (e as any).stopPropagation?.(); }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                    <Dropdown.Popover placement="bottom end" className="min-w-[140px]">
                      <Dropdown.Menu
                        onAction={(key) => {
                          if (key === "rinomina") startRename(board.id, board.nome);
                          if (key === "elimina") setDeletingBoardId(board.id);
                        }}
                      >
                        <Dropdown.Item id="rinomina" textValue="Rinomina">
                          <Label>Rinomina</Label>
                        </Dropdown.Item>
                        <Dropdown.Item id="elimina" textValue="Elimina" className="text-danger">
                          <Label>Elimina</Label>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
                )}
              </div>
            );
          })}
          {boardItems.length === 0 && (
            <Text className="px-2.5 text-[12px] text-ink-ghost italic">
              Nessun board
            </Text>
          )}
        </div>

        {/* Create board dialog */}
        <AlertDialog isOpen={showCreate} onOpenChange={(open) => !open && setShowCreate(false)}>
          <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <AlertDialog.Header>
                  <AlertDialog.Heading>Nuovo board</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <input
                    autoFocus
                    className="w-full rounded-lg border border-primary/20 bg-transparent px-3 py-2 text-[13px] outline-none focus:border-primary/50 text-ink-hi placeholder:text-ink-ghost"
                    placeholder="Nome del board..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateBoard();
                      if (e.key === "Escape") setShowCreate(false);
                    }}
                  />
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button
                    variant="ghost"
                    onPress={() => setShowCreate(false)}
                    className="text-[13px]"
                  >
                    Annulla
                  </Button>
                  <Button
                    onPress={handleCreateBoard}
                    isDisabled={!newBoardName.trim()}
                    className="text-[13px]"
                  >
                    Crea
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>

        {/* Delete confirmation dialog */}
        <AlertDialog
          isOpen={deletingBoardId !== null}
          onOpenChange={(open) => !open && setDeletingBoardId(null)}
        >
          <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <AlertDialog.Header>
                  <AlertDialog.Heading>Elimina board</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <Text className="text-[13px] text-ink-md">
                    Elimina &ldquo;{deletingBoard?.nome}&rdquo;? Gli elementi del workspace non verranno eliminati.
                  </Text>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button
                    variant="ghost"
                    onPress={() => setDeletingBoardId(null)}
                    className="text-[13px]"
                  >
                    Annulla
                  </Button>
                  <Button
                    onPress={confirmDelete}
                    className="text-[13px] bg-danger text-white"
                  >
                    Elimina
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </ScrollShadow>

      {/* Settings footer */}
      <div className="border-t border-primary/6 px-1.5 py-1.5">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 rounded-lg px-2.5 min-h-[44px] text-[13px] font-medium text-ink-lo hover:bg-primary/6"
          >
            <Settings className="h-4 w-4" />
            Impostazioni
          </Button>
          <NotificationBell />
          <ThemeSwitcher />
          <Tooltip>
            <Button
              variant="ghost"
              isIconOnly
              className="h-[44px] w-[44px] rounded-lg text-ink-dim hover:bg-primary/6"
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
    </div>
  );
}
