import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-pill font-body font-medium",
    "whitespace-nowrap",
    "transition-[color,background-color,border-color,opacity]",
    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
  ],
  {
    variants: {
      variant: {
        success: "bg-success text-neutral-0",
        accent: "bg-action-primary text-action-primary-fg",
        outline:
          "bg-transparent text-foreground border border-border-strong",
        neutral: "bg-neutral-800 text-neutral-0 border border-border",
      },
      size: {
        sm: "min-h-7 px-3 text-xs",
        md: "min-h-8 px-4 text-sm",
        lg: "min-h-9 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({
  className,
  variant,
  size,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
