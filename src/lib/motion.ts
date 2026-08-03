/**
 * Motion tokens for Framer Motion — aligned with `styles/tokens.css`.
 * Library budget: 150–350ms only (no long / decorative delays).
 */

/** Cubic-bezier from DS (commercial ease-out) */
export const motionEase = {
  /** cubic-bezier(0.22, 1, 0.36, 1) */
  standard: [0.22, 1, 0.36, 1] as const,
  /** cubic-bezier(0.2, 0.8, 0.2, 1) */
  emphasized: [0.2, 0.8, 0.2, 1] as const,
  linear: "linear" as const,
};

/** Seconds — must stay within 0.15–0.35 for UI motion library */
export const motionDuration = {
  fast: 0.15,
  normal: 0.3,
  /** Cap of library budget (replaces DS “slow/hero” for UI motion) */
  enter: 0.35,
} as const;

/** Milliseconds — same source as tokens.css where overlapping */
export const motionDurationMs = {
  fast: 150,
  normal: 300,
  enter: 350,
  stagger: 80,
} as const;

export type MotionDurationKey = keyof typeof motionDuration;
export type MotionEaseKey = keyof typeof motionEase;

export type TransitionOptions = {
  duration?: MotionDurationKey | number;
  ease?: MotionEaseKey;
  delay?: number;
};

export function createTransition({
  duration = "normal",
  ease = "standard",
  delay = 0,
}: TransitionOptions = {}) {
  const seconds =
    typeof duration === "number" ? duration : motionDuration[duration];

  return {
    duration: Math.min(Math.max(seconds, motionDuration.fast), motionDuration.enter),
    ease: motionEase[ease],
    delay,
  };
}

/** Instant / no-op transition when reduced motion is preferred */
export const reducedTransition = {
  duration: 0.01,
  ease: motionEase.linear,
  delay: 0,
} as const;

export const staggerDelay = motionDurationMs.stagger / 1000;

/** Distances in px — transform-only (no layout shift) */
export const motionDistance = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;
