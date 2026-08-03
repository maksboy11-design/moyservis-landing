/**
 * Named Framer Motion presets — Source of Truth for UI motion.
 * Durations capped at 150–350ms per Motion Library rules.
 */

export {
  motionDuration,
  motionDurationMs,
  motionEase,
  motionDistance,
  createTransition,
  reducedTransition,
  staggerDelay,
} from "@/lib/motion";

export {
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,
  scaleVariants,
  slideVariants,
  revealVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pageVariants,
  hoverLift,
  hoverLiftReduced,
  tapPress,
  tapPressReduced,
  microPulse,
  defaultEnterTransition,
  defaultExitTransition,
} from "./variants";

/** @deprecated Use motionDuration / createTransition — kept for Stage 1 imports */
export const motionPresets = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    enter: 0.35,
  },
  ease: [0.22, 1, 0.36, 1] as const,
  stagger: 0.08,
} as const;
