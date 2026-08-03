"use client";

import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  defaultEnterTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/animations/variants";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type StaggerProps = HTMLMotionProps<"div"> & {
  /** Stagger between children (seconds). Default = token 80ms */
  stagger?: number;
};

/**
 * Parent: orchestrates children with stagger.
 * Children should use `StaggerItem` (or variants with hidden/visible).
 */
export function Stagger({
  className,
  stagger = staggerDelay,
  children,
  ...props
}: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn(className)}
      variants={staggerContainerVariants(reduced, reduced ? 0 : stagger)}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </m.div>
  );
}

export type StaggerItemProps = HTMLMotionProps<"div">;

export function StaggerItem({ className, children, ...props }: StaggerItemProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn(className)}
      variants={staggerItemVariants(reduced)}
      transition={defaultEnterTransition(reduced)}
      {...props}
    >
      {children}
    </m.div>
  );
}
