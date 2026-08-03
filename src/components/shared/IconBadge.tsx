import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const iconBadgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-pill",
    "text-[var(--icon-badge-fg)]",
    "transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
  ],
  {
    variants: {
      tone: {
        purple: "bg-brand-purple",
        lime: "bg-action-primary text-action-primary-fg",
        muted: "bg-neutral-0/10 text-neutral-0",
      },
      size: {
        sm: "size-10",
        md: "size-[var(--icon-badge-size)]",
        lg: "size-14",
      },
    },
    defaultVariants: {
      tone: "purple",
      size: "md",
    },
  },
);

export type IconBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof iconBadgeVariants> & {
    children: ReactNode;
    label?: string;
  };

/**
 * Circular brand icon badge — purple circles from About / Advantages (refs + DS).
 */
export function IconBadge({
  children,
  className,
  tone,
  size,
  label,
  ...props
}: IconBadgeProps) {
  return (
    <span
      className={cn(iconBadgeVariants({ tone, size }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {children}
    </span>
  );
}
