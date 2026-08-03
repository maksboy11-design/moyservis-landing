"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export type MotionProviderProps = {
  children: ReactNode;
};

/**
 * Island wrapper — load FM features once per tree (not in root layout).
 * Uses `domAnimation` feature bundle for smaller payload.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
