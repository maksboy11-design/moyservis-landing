import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";
import { VisuallyHidden } from "@/components/shared/VisuallyHidden";

export const buttonVariants = cva(
  [
    "btn-ds inline-flex items-center justify-center gap-2",
    "font-display font-bold uppercase tracking-wide",
    "select-none",
    "transition-[color,background-color,border-color,transform,opacity,box-shadow]",
    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)]",
    "active:scale-[0.98]",
    "cursor-pointer",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-action-primary text-action-primary-fg",
          "hover:bg-action-primary-hover",
          "active:bg-action-primary-pressed",
        ],
        secondary: [
          "bg-neutral-0 text-brand-purple",
          "hover:bg-neutral-50",
          "active:bg-neutral-100",
        ],
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-neutral-0/10",
          "active:bg-neutral-0/15",
        ],
        outline: [
          "bg-transparent text-foreground",
          "border border-border-strong",
          "hover:bg-neutral-0/10",
          "active:bg-neutral-0/15",
        ],
        link: [
          "bg-transparent text-foreground underline-offset-4",
          "hover:underline hover:opacity-[var(--opacity-muted)]",
          "active:opacity-100",
          "active:scale-100",
          "!px-0",
          "!min-h-0",
          "whitespace-nowrap",
        ],
      },
      size: {
        sm: "min-h-10 rounded-pill px-4 text-sm",
        md: "min-h-[var(--button-min-height)] rounded-pill px-[var(--button-px)] text-sm",
        lg: "min-h-12 rounded-pill px-8 text-md",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto max-w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = Boolean(disabled || loading);
  const showSpinner = loading && !asChild;

  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      {showSpinner ? (
        <>
          <Spinner size="sm" aria-hidden className="shrink-0" />
          <VisuallyHidden>Загрузка. </VisuallyHidden>
          <span className="inline-flex items-center gap-2">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}
