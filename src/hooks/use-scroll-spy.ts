"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_ROOT_MARGIN = "-20% 0px -60% 0px";
const DEFAULT_THRESHOLD: readonly number[] = [0, 0.25, 0.5, 0.75];

type ScrollSpyOptions = {
  /** Extra offset matching sticky header */
  rootMargin?: string;
  threshold?: number | readonly number[];
};

/**
 * Active section hash via IntersectionObserver (no heavy scroll math).
 */
export function useScrollSpy(
  ids: readonly string[],
  options: ScrollSpyOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  const rootMargin = options.rootMargin ?? DEFAULT_ROOT_MARGIN;

  const key = useMemo(() => ids.join("|"), [ids]);
  const thresholdKey = useMemo(() => {
    const threshold = options.threshold ?? DEFAULT_THRESHOLD;
    return Array.isArray(threshold) ? threshold.join(",") : String(threshold);
  }, [options.threshold]);

  useEffect(() => {
    const sectionIds = key.split("|").filter(Boolean);
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();
    const observerThreshold: number | number[] = thresholdKey.includes(",")
      ? thresholdKey.split(",").map(Number)
      : Number(thresholdKey);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let bestId: string | null = null;
        let bestRatio = 0;

        for (const id of sectionIds) {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestId && bestRatio > 0) {
          setActiveId(bestId);
        }
      },
      { root: null, rootMargin, threshold: observerThreshold },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [key, rootMargin, thresholdKey]);

  return activeId;
}
