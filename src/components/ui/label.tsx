import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

/**
 * Accessible form label (`<label htmlFor>`).
 * Distinct from Typography `Label` (visual style only).
 */
export function FormLabel({
  className,
  children,
  required,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(
        "font-display text-sm font-bold tracking-wider text-foreground uppercase",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-[var(--opacity-disabled)]",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-1 text-error" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}
