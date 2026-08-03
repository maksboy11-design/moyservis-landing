"use client";

import {
  m,
  useReducedMotion,
  type HTMLMotionProps,
  type UseInViewOptions,
} from "framer-motion";
import {
  defaultEnterTransition,
  fadeDownVariants,
  fadeUpVariants,
  fadeVariants,
  revealVariants,
  scaleVariants,
  slideVariants,
  type SlideDirection,
} from "@/animations/variants";
import { cn } from "@/lib/cn";

export type ScrollRevealPreset =
  | "fade"
  | "fadeUp"
  | "fadeDown"
  | "scale"
  | "slide"
  | "reveal";

export type ScrollRevealProps = HTMLMotionProps<"div"> & {
  preset?: ScrollRevealPreset;
  direction?: SlideDirection;
  /** Play once when entering viewport */
  once?: boolean;
  /** Margin for IntersectionObserver (FM useInView) */
  viewport?: UseInViewOptions;
  /** Delay in seconds */
  delay?: number;
};

function variantsFor(
  preset: ScrollRevealPreset,
  direction: SlideDirection,
  reduced: boolean | null,
) {
  switch (preset) {
    case "fade":
      return fadeVariants(reduced);
    case "fadeDown":
      return fadeDownVariants(reduced);
    case "scale":
      return scaleVariants(reduced);
    case "slide":
      return slideVariants(direction, reduced);
    case "fadeUp":
    case "reveal":
    default:
      return revealVariants(reduced) ?? fadeUpVariants(reduced);
  }
}

/**
 * Scroll Reveal — viewport-triggered enter.
 * Transform + opacity only → no CLS from animated box model.
 */
export function ScrollReveal({
  className,
  preset = "reveal",
  direction = "up",
  once = true,
  viewport,
  delay = 0,
  children,
  ...props
}: ScrollRevealProps) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn(className)}
      variants={variantsFor(preset, direction, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount: 0.15,
        margin: "0px 0px -8% 0px",
        ...viewport,
      }}
      transition={defaultEnterTransition(reduced, { delay })}
      {...props}
    >
      {children}
    </m.div>
  );
}
