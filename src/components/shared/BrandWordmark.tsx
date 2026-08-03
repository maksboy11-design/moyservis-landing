"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { getHashId, scrollToHash } from "@/lib/scroll-to-hash";

export const brandWordmarkVariants = cva(
  [
    "font-display font-extrabold uppercase tracking-wide",
    "transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
    "hover:opacity-90 focus-visible:outline-none focus-visible:shadow-focus rounded-xs",
  ],
  {
    variants: {
      size: {
        sm: "text-lg md:text-xl",
        md: "text-xl md:text-2xl",
        lg: "text-2xl md:text-3xl",
      },
      tone: {
        /** On purple/dark chrome — AA contrast */
        light: "text-neutral-0",
        /** On light surfaces */
        brand: "text-foreground-brand",
        dark: "text-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "light",
    },
  },
);

export type BrandWordmarkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof brandWordmarkVariants> & {
    href?: string;
  };

export function BrandWordmark({
  className,
  size,
  tone,
  href = "/#hero",
  children,
  onClick,
  ...props
}: BrandWordmarkProps) {
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
    }
  };

  return (
    <a
      href={href}
      className={cn(brandWordmarkVariants({ size, tone }), className)}
      aria-label={siteConfig.name}
      onClick={handleClick}
      {...props}
    >
      {children ?? siteConfig.shortName}
    </a>
  );
}
