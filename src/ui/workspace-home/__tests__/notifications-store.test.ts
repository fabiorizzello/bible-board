import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  notifications$,
  notifyMutation,
  rollback,
  clearAll,
  useNotifications,
  useUnreadCount,
} from "../notifications-store";

beforeEach(() => {
  clearAll();
});

describe("notifyMutation", () => {
  it("inserts entry at head so newest is first, with tipo/label/ts/undone=false", () => {
    const before = Date.now();
    notifyMutation("create", "Prima");
    const id = notifyMutation("update", "Seconda");
    const after = Date.now();
    const items = notifications$.items.peek();
    expect(items[0].label).toBe("Seconda");
    expect(items[1].label).toBe("Prima");
    expect(items[0].tipo).toBe("update");
    expect(items[0].undone).toBe(false);
    expect(items[0].ts).toBeGreaterThanOrEqual(before);
    expect(items[0].ts).toBeLessThanOrEqual(after);
    expect(items[0].id).toBe(id);
  });

  it("returns a unique id per call", () => {
    const id1 = notifyMutation("create", "A");
    const id2 = notifyMutation("create", "B");
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
  });

  it("without undoFn: rollback is a no-op (undoFn absent from backing Map)", () => {
    const id = notifyMutation("delete", "Senza undo");
    rollback(id);
    const item = notifications$.items.peek().find((n) => n.id === id)!;
    // rollback does nothing when there is no undoFn — undone stays false
    expect(item.undone).toBe(false);
  });

  it("useNotifications merges undoFn from backing Map — null when not provided", () => {
    const id = notifyMutation("delete", "Senza undo");
    const { result } = renderHook(() => useNotifications());
    const item = result.current.find((n) => n.id === id)!;
    expect(item.undoFn).toBeNull();
  });
});

describe("rollback", () => {
  it("calls undoFn exactly once and sets undone=true", () => {
    const undoFn = vi.fn();
    const id = notifyMutation("update", "Con undo", undoFn);
    rollback(id);
    expect(undoFn).toHaveBeenCalledTimes(1);
    const item = notifications$.items.peek().find((n) => n.id === id)!;
    expect(item.undone).toBe(true);
  });

  it("on nonexistent id is a no-op and does not throw", () => {
    expect(() => rollback("id-inesistente")).not.toThrow();
  });

  it("on already-undone entry does not call undoFn again (idempotent)", () => {
    const undoFn = vi.fn();
    const id = notifyMutation("create", "Idempotent", undoFn);
    rollback(id);
    rollback(id);
    expect(undoFn).toHaveBeenCalledTimes(1);
  });
});

describe("clearAll", () => {
  it("empties the items list", () => {
    notifyMutation("create", "A");
    notifyMutation("update", "B");
    clearAll();
    expect(notifications$.items.peek()).toHaveLength(0);
  });
});

describe("useUnreadCount", () => {
  it("reflects count of !undone after notifyMutation and rollback", () => {
    notifyMutation("create", "A");
    notifyMutation("update", "B");
    const undoFn = vi.fn();
    const id = notifyMutation("delete", "C", undoFn);

    const { result } = renderHook(() => useUnreadCount());
    expect(result.current).toBe(3);

    act(() => {
      rollback(id);
    });

    expect(result.current).toBe(2);
  });
});
