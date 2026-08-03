"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/config/site";
import { NavLink } from "@/components/shared/NavLink";

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  items: readonly NavItem[];
  activeHref?: string | null;
  onNavigate?: () => void;
  /** spread = full-width refs hero; cluster = compact solid header */
  layout?: "spread" | "cluster";
};

/**
 * Desktop horizontal nav — white uppercase links (refs).
 */
export function Navbar({
  items,
  activeHref,
  onNavigate,
  layout = "cluster",
  className,
  ...props
}: NavbarProps) {
  return (
    <nav
      aria-label="Основная навигация"
      className={cn("nav-desktop items-center", className)}
      {...props}
    >
      <ul
        className={cn(
          "flex max-w-full items-center",
          layout === "spread"
            ? "h-full w-full justify-between"
            : "w-full min-w-0 justify-center gap-x-2 lg:gap-x-3 xl:gap-x-4 2xl:gap-x-6",
        )}
      >
        {items.map((item) => {
          const active =
            activeHref != null &&
            (activeHref === item.href || activeHref === item.href.slice(1));

          return (
            <li key={item.href} className="shrink-0">
              <NavLink
                href={item.href}
                variant="nav"
                active={active}
                onNavigate={onNavigate}
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
