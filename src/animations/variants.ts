import type { Transition, Variants } from "framer-motion";
import {
  createTransition,
  motionDistance,
  reducedTransition,
  staggerDelay,
  type TransitionOptions,
} from "@/lib/motion";

export type MotionVariantSet = Variants;

function withReduced(
  reduced: boolean | null | undefined,
  options?: TransitionOptions,
): Transition {
  if (reduced) return { ...reducedTransition };
  return createTransition(options);
}

/** Fade */
export function fadeVariants(reduced?: boolean | null): MotionVariantSet {
  if (reduced) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 }, exit: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

/** Fade Up — transform only */
export function fadeUpVariants(reduced?: boolean | null): MotionVariantSet {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
    };
  }
  return {
    hidden: { opacity: 0, y: motionDistance.md },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: motionDistance.sm },
  };
}

/** Fade Down */
export function fadeDownVariants(reduced?: boolean | null): MotionVariantSet {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
    };
  }
  return {
    hidden: { opacity: 0, y: -motionDistance.md },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -motionDistance.sm },
  };
}

/** Scale — avoid layout: scale from center via transform */
export function scaleVariants(reduced?: boolean | null): MotionVariantSet {
  if (reduced) {
    return {
      hidden: { opacity: 1, scale: 1 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 1, scale: 1 },
    };
  }
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };
}

export type SlideDirection = "left" | "right" | "up" | "down";

/** Slide — transform translate only */
export function slideVariants(
  direction: SlideDirection = "up",
  reduced?: boolean | null,
): MotionVariantSet {
  if (reduced) {
    return {
      hidden: { opacity: 1, x: 0, y: 0 },
      visible: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 1, x: 0, y: 0 },
    };
  }

  const offset = motionDistance.lg;
  const hidden =
    direction === "left"
      ? { opacity: 0, x: -offset, y: 0 }
      : direction === "right"
        ? { opacity: 0, x: offset, y: 0 }
        : direction === "down"
          ? { opacity: 0, x: 0, y: -offset }
          : { opacity: 0, x: 0, y: offset };

  return {
    hidden,
    visible: { opacity: 1, x: 0, y: 0 },
    exit: { ...hidden, opacity: 0 },
  };
}

/** Reveal (= fade-up enter, used for section content) */
export function revealVariants(reduced?: boolean | null): MotionVariantSet {
  return fadeUpVariants(reduced);
}

/** Stagger container */
export function staggerContainerVariants(
  reduced?: boolean | null,
  staggerChildren = staggerDelay,
): MotionVariantSet {
  return {
    hidden: {},
    visible: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren, delayChildren: 0.04 },
    },
  };
}

/** Stagger child — default fade-up */
export function staggerItemVariants(reduced?: boolean | null): MotionVariantSet {
  return fadeUpVariants(reduced);
}

/** Page transition */
export function pageVariants(reduced?: boolean | null): MotionVariantSet {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }
  return {
    initial: { opacity: 0, y: motionDistance.sm },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -motionDistance.sm },
  };
}

/** Hover / Tap micro — used as whileHover / whileTap targets */
export const hoverLift = { y: -2, transition: createTransition({ duration: "fast" }) };
export const hoverLiftReduced = { y: 0 };
export const tapPress = { scale: 0.98, transition: createTransition({ duration: "fast" }) };
export const tapPressReduced = { scale: 1 };

export const microPulse = {
  scale: [1, 1.03, 1] as number[],
  transition: createTransition({ duration: "normal", ease: "emphasized" }),
};

export function defaultEnterTransition(
  reduced?: boolean | null,
  options?: TransitionOptions,
): Transition {
  return withReduced(reduced, {
    duration: "enter",
    ease: "emphasized",
    ...options,
  });
}

export function defaultExitTransition(
  reduced?: boolean | null,
): Transition {
  return withReduced(reduced, { duration: "fast", ease: "standard" });
}
