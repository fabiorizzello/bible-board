import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFieldStatus } from "../useFieldStatus";

function mockMatchMedia(prefersReduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersReduced && query === "(prefers-reduced-motion: reduce)",
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

describe("useFieldStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("(1) onBlur with same value does not call onCommit and status stays idle", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
      result.current.onBlur("hello");
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("(2) onBlur with different value calls onCommit(prev, next) exactly once", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
      result.current.onBlur("world");
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("hello", "world");
  });

  it("(3) status transitions to success after a value change", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
      result.current.onBlur("world");
    });

    expect(result.current.status).toBe("success");
  });

  it("(4) status returns to idle after 1500ms", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
      result.current.onBlur("world");
    });
    expect(result.current.status).toBe("success");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe("idle");
  });

  it("(5) prefers-reduced-motion: resets to idle immediately without waiting 1500ms", () => {
    mockMatchMedia(true);

    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
      result.current.onBlur("world");
    });

    // With delay=0, advancing by 1ms is enough to fire the reset timer
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.status).toBe("idle");
  });

  it("(6) focus without blur does not call onCommit (idempotency)", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useFieldStatus("hello", onCommit));

    act(() => {
      result.current.onFocus();
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });
});
