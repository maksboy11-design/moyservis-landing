import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export type SpinnerProps = SVGProps<SVGSVGElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export function Spinner({
  size = "md",
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  ...props
}: SpinnerProps) {
  const isDecorative = ariaHidden === true || ariaHidden === "true";

  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : (ariaLabel ?? "Загрузка")}
      role={isDecorative ? undefined : "status"}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
