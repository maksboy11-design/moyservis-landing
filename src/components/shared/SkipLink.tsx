import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SkipLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Target landmark id (without #). Default: main */
  targetId?: string;
};

/**
 * First focusable control — jump to main content.
 * Visible only on keyboard focus.
 */
export function SkipLink({
  targetId = "main",
  className,
  children = "Перейти к содержимому",
  ...props
}: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className={cn("skip-link", className)} {...props}>
      {children}
    </a>
  );
}
