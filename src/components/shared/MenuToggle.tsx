"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const menuToggleVariants = cva(
  [
    "relative inline-flex size-11 items-center justify-center rounded-md",
    "transition-[background-color,opacity]",
    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "cursor-pointer",
  ],
  {
    variants: {
      tone: {
        light: "text-neutral-0 hover:bg-neutral-0/10",
        dark: "text-foreground hover:bg-neutral-0/10",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  },
);

export type MenuToggleProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof menuToggleVariants> & {
    open: boolean;
    onPressed: () => void;
    labelOpen?: string;
    labelClose?: string;
  };

/**
 * Hamburger ↔ close — matches ref white bars on purple / dark chrome.
 */
export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(
  function MenuToggle(
    {
      open,
      onPressed,
      labelOpen = "Открыть меню",
      labelClose = "Закрыть меню",
      tone,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={open ? labelClose : labelOpen}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className={cn(menuToggleVariants({ tone }), className)}
        onClick={onPressed}
        {...props}
      >
        <span className="sr-only">{open ? labelClose : labelOpen}</span>
        <span
          aria-hidden
          className="relative block size-5"
          data-state={open ? "open" : "closed"}
        >
          <span
            className={cn(
              "absolute left-0 top-[3px] block h-0.5 w-5 bg-current",
              "transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-emphasized)]",
              open && "top-1/2 -translate-y-1/2 rotate-45",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 bg-current",
              "transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute bottom-[3px] left-0 block h-0.5 w-5 bg-current",
              "transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-emphasized)]",
              open && "bottom-auto top-1/2 -translate-y-1/2 -rotate-45",
            )}
          />
        </span>
      </button>
    );
  },
);
