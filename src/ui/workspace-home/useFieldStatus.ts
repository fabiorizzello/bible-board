import { useCallback, useEffect, useRef, useState } from "react";

export type FieldStatus = "idle" | "saving" | "success" | "error";

/**
 * Generic field state machine: idle → success → idle.
 * onBlur with the same value is a no-op (fixes R049 toast-on-no-op).
 * onCommit is called with (prev, next) only when the value actually changed.
 * Resets to idle after 1500ms; immediately if prefers-reduced-motion is active.
 */
export function useFieldStatus<T>(
  value: T,
  onCommit: (prev: T, next: T) => void,
): { status: FieldStatus; onFocus: () => void; onBlur: (next: T) => void } {
  const [status, setStatus] = useState<FieldStatus>("idle");

  // Keep a stable ref to the latest value to avoid stale closures in callbacks
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  // prevRef holds the value captured at focus time (the "before" baseline)
  const prevRef = useRef<T>(value);

  // Keep onCommit ref fresh so we don't close over a stale prop
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync prevRef when Jazz CRDT pushes an external value update while not focused
  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  // Cancel pending reset on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const onFocus = useCallback(() => {
    // Capture the committed value at focus time as the comparison baseline
    prevRef.current = valueRef.current;
  }, []);

  const onBlur = useCallback((next: T) => {
    const prev = prevRef.current;

    // No-op guard (R049): identical value → no commit, no notification
    if (prev === next) return;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    onCommitRef.current(prev, next);
    setStatus("success");

    // Read prefers-reduced-motion at blur time, not render time
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setStatus("idle");
    }, prefersReduced ? 0 : 1500);
  }, []);

  return { status, onFocus, onBlur };
}
