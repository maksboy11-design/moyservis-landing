/**
 * JS-facing token references for motion / layout helpers.
 * Values live in CSS (tokens.css). Do not hardcode durations/easings here.
 */

export const motion = {
  duration: {
    fast: "var(--motion-duration-fast)",
    normal: "var(--motion-duration-normal)",
    slow: "var(--motion-duration-slow)",
    hero: "var(--motion-duration-hero)",
  },
  easing: {
    standard: "var(--motion-easing-standard)",
    emphasized: "var(--motion-easing-emphasized)",
    linear: "var(--motion-easing-linear)",
  },
  delay: {
    stagger: "var(--motion-delay-stagger)",
  },
} as const;

/** Numeric ms for Framer Motion (must stay aligned with tokens.css) */
export const motionMs = {
  fast: 150,
  normal: 300,
  /** UI Motion Library cap (150–350ms budget) */
  enter: 350,
  /** CSS-only legacy tokens — do not use in FM library presets */
  slow: 500,
  hero: 800,
  stagger: 80,
} as const;

export const zIndex = {
  base: "var(--z-base)",
  content: "var(--z-content)",
  overlap: "var(--z-overlap)",
  sticky: "var(--z-sticky)",
  header: "var(--z-header)",
  dropdown: "var(--z-dropdown)",
  overlay: "var(--z-overlay)",
  modal: "var(--z-modal)",
  toast: "var(--z-toast)",
} as const;

/** @deprecated Import from `@/lib/responsive` — kept for re-export compat */
export {
  breakpoints,
  type Breakpoint,
} from "@/lib/responsive";
