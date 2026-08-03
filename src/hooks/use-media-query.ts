"use client";

import { useEffect, useState } from "react";
import {
  breakpoints,
  resolveViewportRange,
  type Breakpoint,
  type ViewportRange,
} from "@/lib/responsive";

/**
 * Subscribe to a min-width breakpoint (mobile-first).
 */
export function useMediaMin(bp: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[bp]}px)`;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when desktop nav should show (Tablet Horizontal+) */
export function useDesktopNav(): boolean {
  return useMediaMin("lg");
}

export function useViewportRange(): ViewportRange | null {
  const [range, setRange] = useState<ViewportRange | null>(null);

  useEffect(() => {
    const update = () => setRange(resolveViewportRange(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return range;
}
