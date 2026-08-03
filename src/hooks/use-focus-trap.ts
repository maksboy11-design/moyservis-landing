"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";

type FocusTrapOptions = {
  enabled: boolean;
  /** Element to restore focus on disable */
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Minimal focus trap for mobile menu overlay.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { enabled, restoreFocusRef }: FocusTrapOptions,
): void {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const getFocusable = useCallback(() => {
    const root = containerRef.current;
    if (!root) return [] as HTMLElement[];

    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-hidden") !== "true" &&
        el.tabIndex !== -1,
    );
  }, [containerRef]);

  useEffect(() => {
    if (!enabled) return;

    previouslyFocused.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const focusables = getFocusable();
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const restore =
        restoreFocusRef?.current ?? previouslyFocused.current;
      restore?.focus();
    };
  }, [enabled, getFocusable, restoreFocusRef]);
}
