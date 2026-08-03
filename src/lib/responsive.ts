/**

 * Responsive breakpoints + QA viewports.

 * Numeric SoT must stay aligned with tokens.css / theme.css / responsive.css.

 */



export const breakpoints = {

  /** Large Mobile */

  sm: 480,

  /** Tablet Vertical */

  md: 768,

  /** Tablet Horizontal */

  lg: 1024,

  /** Laptop */

  xl: 1280,

  /** Desktop */

  "2xl": 1440,

  /** Large Desktop */

  "3xl": 1920,

} as const;



export type Breakpoint = keyof typeof breakpoints;



/** Named ranges for docs / media helpers */

export const viewportRanges = {

  smallMobile: { min: 0, max: breakpoints.sm - 1, label: "Small Mobile" },

  largeMobile: {

    min: breakpoints.sm,

    max: breakpoints.md - 1,

    label: "Large Mobile",

  },

  tabletVertical: {

    min: breakpoints.md,

    max: breakpoints.lg - 1,

    label: "Tablet Vertical",

  },

  tabletHorizontal: {

    min: breakpoints.lg,

    max: breakpoints.xl - 1,

    label: "Tablet Horizontal",

  },

  laptop: {

    min: breakpoints.xl,

    max: breakpoints["2xl"] - 1,

    label: "Laptop",

  },

  desktop: {

    min: breakpoints["2xl"],

    max: breakpoints["3xl"] - 1,

    label: "Desktop",

  },

  largeDesktop: {

    min: breakpoints["3xl"],

    max: Infinity,

    label: "Large Desktop",

  },

} as const;



export type ViewportRange = keyof typeof viewportRanges;



/** Required QA widths — no horizontal scroll / overlap / overflow / clip */

export const qaViewports = [

  1920, 1440, 1366, 1024, 768, 480, 390, 375, 360, 320,

] as const;



export type QaViewport = (typeof qaViewports)[number];



export function resolveViewportRange(width: number): ViewportRange {

  if (width >= breakpoints["3xl"]) return "largeDesktop";

  if (width >= breakpoints["2xl"]) return "desktop";

  if (width >= breakpoints.xl) return "laptop";

  if (width >= breakpoints.lg) return "tabletHorizontal";

  if (width >= breakpoints.md) return "tabletVertical";

  if (width >= breakpoints.sm) return "largeMobile";

  return "smallMobile";

}



export function mediaMin(bp: Breakpoint): string {

  return `(min-width: ${breakpoints[bp]}px)`;

}


