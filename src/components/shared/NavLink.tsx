"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { getHashId, scrollToHash } from "@/lib/scroll-to-hash";

export const navLinkVariants = cva(
  [
    "inline-flex items-center font-display font-bold uppercase tracking-wider",
    "transition-[color,opacity,transform]",
    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
    "focus-visible:outline-none focus-visible:shadow-focus rounded-xs",
  ],
  {
    variants: {
      variant: {
        nav: [
          "text-[0.8125rem] xl:text-sm tracking-[0.12em]",
          "text-neutral-0/95 hover:text-neutral-0",
        ].join(" "),
        footer:
          "text-sm text-foreground-muted hover:text-foreground normal-case tracking-wide font-medium",
        mobile:
          "w-full justify-start text-2xl tracking-[0.06em] text-neutral-0 py-3.5 border-b border-neutral-0/10",
      },
      active: {
        true: "text-action-primary",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "nav",
        active: true,
        className: "text-action-primary",
      },
      {
        variant: "mobile",
        active: true,
        className: "text-action-primary",
      },
    ],
    defaultVariants: {
      variant: "nav",
      active: false,
    },
  },
);

export type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof navLinkVariants> & {
    href: string;
    onNavigate?: () => void;
  };

export function NavLink({
  href,
  className,
  variant,
  active = false,
  onNavigate,
  onClick,
  children,
  ...props
}: NavLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const hashId = getHashId(href);
    const onHome =
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "");

    if (hashId && onHome) {
      event.preventDefault();
      scrollToHash(`#${hashId}`);
      onNavigate?.();
      return;
    }

    onNavigate?.();
  };

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(navLinkVariants({ variant, active }), className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
