"use client";

import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  defaultEnterTransition,
  pageVariants,
} from "@/animations/variants";
import { cn } from "@/lib/cn";

export type PageTransitionProps = HTMLMotionProps<"div"> & {
  /** Unique key for AnimatePresence (route pathname) */
  transitionKey?: string;
};

/**
 * Soft page enter/exit — opacity + 8px Y.
 * Wrap with AnimatePresence at the app shell when routing.
 */
export function PageTransition({
  className,
  transitionKey,
  children,
  ...props
}: PageTransitionProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      key={transitionKey}
      className={cn(className)}
      variants={pageVariants(reduced)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={defaultEnterTransition(reduced, { duration: "normal" })}
      {...props}
    >
      {children}
    </m.div>
  );
}
