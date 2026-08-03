import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const dividerVariants = cva("shrink-0 border-0", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px self-stretch",
    },
    variant: {
      subtle: "bg-border",
      strong: "bg-border-strong",
      accent: "bg-action-primary",
      lime: "bg-accent-lime",
    },
    thickness: {
      hairline: "",
      thin: "",
      bar: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      thickness: "hairline",
      className: "h-px",
    },
    {
      orientation: "horizontal",
      thickness: "thin",
      className: "h-[var(--border-width-thin)]",
    },
    {
      orientation: "horizontal",
      thickness: "bar",
      className: "h-10 md:h-12",
    },
    {
      orientation: "vertical",
      thickness: "hairline",
      className: "w-px",
    },
    {
      orientation: "vertical",
      thickness: "thin",
      className: "w-[var(--border-width-thin)]",
    },
    {
      orientation: "vertical",
      thickness: "bar",
      className: "w-2",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    variant: "subtle",
    thickness: "hairline",
  },
});

export type DividerProps = HTMLAttributes<HTMLHRElement> &
  VariantProps<typeof dividerVariants>;

export function Divider({
  className,
  orientation = "horizontal",
  variant,
  thickness,
  ...props
}: DividerProps) {
  return (
    <hr
      role="separator"
      aria-orientation={orientation ?? "horizontal"}
      className={cn(
        dividerVariants({ orientation, variant, thickness }),
        className,
      )}
      {...props}
    />
  );
}
