"use client";

import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  hoverLift,
  microPulse,
  revealVariants,
  tapPress,
} from "@/animations/variants";
import { createTransition } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type HoverProps = HTMLMotionProps<"div"> & {
  disabled?: boolean;
};

/** Hover — translateY only (no layout shift) */
export function Hover({
  className,
  disabled = false,
  children,
  ...props
}: HoverProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("will-change-transform", className)}
      whileHover={disabled || reduced ? undefined : hoverLift}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type TapProps = HTMLMotionProps<"div"> & {
  disabled?: boolean;
};

/** Tap / press — scale transform only */
export function Tap({
  className,
  disabled = false,
  children,
  ...props
}: TapProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("will-change-transform", className)}
      whileHover={
        disabled || reduced
          ? undefined
          : { y: -1, transition: createTransition({ duration: "fast" }) }
      }
      whileTap={disabled || reduced ? undefined : tapPress}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type MicroInteractionProps = HTMLMotionProps<"div"> & {
  /** One-shot pulse on mount */
  pulse?: boolean;
};

/**
 * Micro interactions — subtle pulse / hover / tap.
 * Budget ≤350ms; transform + opacity only.
 */
export function MicroInteraction({
  className,
  pulse = false,
  children,
  ...props
}: MicroInteractionProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("will-change-transform", className)}
      variants={revealVariants(reduced)}
      animate={pulse && !reduced ? microPulse : undefined}
      whileHover={
        reduced
          ? undefined
          : { y: -1, transition: createTransition({ duration: "fast" }) }
      }
      whileTap={reduced ? undefined : tapPress}
      {...props}
    >
      {children}
    </m.div>
  );
}
