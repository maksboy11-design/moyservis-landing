import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Visually hidden, available to screen readers (sr-only).
 */
export function VisuallyHidden({
  className,
  ...props
}: VisuallyHiddenProps) {
  return <span className={cn("sr-only", className)} {...props} />;
}
