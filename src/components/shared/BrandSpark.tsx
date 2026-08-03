import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export type BrandSparkProps = SVGProps<SVGSVGElement>;

/**
 * Decorative spark near brand tab (refs) — aria-hidden.
 */
export function BrandSpark({ className, ...props }: BrandSparkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("hero-frame__spark", className)}
      {...props}
    >
      <path
        d="M16 2.5 17.8 12.2 27.5 14 17.8 15.8 16 25.5 14.2 15.8 4.5 14 14.2 12.2 16 2.5Z"
        fill="currentColor"
      />
      <path
        d="M25 19.5 25.7 23.2 29.5 24 25.7 24.8 25 28.5 24.3 24.8 20.5 24 24.3 23.2 25 19.5Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
