import { cva, type VariantProps } from "class-variance-authority";

/**
 * Shared text-control surface — Input / Textarea / Select.
 * States: default · hover · focus · error · success · disabled.
 */
export const controlVariants = cva(
  [
    "flex w-full min-w-0 appearance-none",
    "rounded-md border bg-surface text-foreground",
    "font-body text-md leading-normal tracking-normal",
    "placeholder:text-foreground-muted",
    "transition-[color,background-color,border-color,box-shadow,opacity]",
    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
    "hover:border-border-strong/40",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]",
    "aria-busy:opacity-[var(--opacity-muted)]",
  ],
  {
    variants: {
      controlSize: {
        md: "min-h-11 px-4 py-2.5",
        lg: "min-h-12 px-5 py-3 text-lg",
      },
      state: {
        default: "border-border",
        error: "border-error focus-visible:shadow-[0_0_0_3px_rgb(229_57_53_/_0.35)]",
        success: "border-success",
      },
    },
    defaultVariants: {
      controlSize: "md",
      state: "default",
    },
  },
);

export type ControlVariants = VariantProps<typeof controlVariants>;

export function resolveControlState(options: {
  invalid?: boolean;
  success?: boolean;
}): NonNullable<ControlVariants["state"]> {
  if (options.invalid) return "error";
  if (options.success) return "success";
  return "default";
}
