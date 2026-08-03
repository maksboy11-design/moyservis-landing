"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/shared/NavLink";
import type { NavItem } from "@/config/site";
import { siteConfig } from "@/config/site";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useLockedBody } from "@/hooks/use-locked-body";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly NavItem[];
  activeHref?: string | null;
  ctaLabel?: string;
  ctaHref?: string;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Mobile drawer — slide from right + fade scrim (refs / component model).
 * Includes CTA, phone and social channels from siteConfig.
 */
export function MobileMenu({
  open,
  onOpenChange,
  items,
  activeHref,
  ctaLabel = "Свяжитесь с нами",
  ctaHref = "/#contacts",
  restoreFocusRef,
}: MobileMenuProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const close = () => onOpenChange(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockedBody(open);
  useFocusTrap(panelRef, { enabled: open, restoreFocusRef });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn("mobile-menu", open && "mobile-menu--open")}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Закрыть меню"
        className="mobile-menu__scrim"
        onClick={close}
      />

      <div
        ref={panelRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mobile-menu__panel"
      >
        <div className="flex items-center justify-between gap-4 border-b border-neutral-0/10 pb-5">
          <p
            id={titleId}
            className="font-display text-sm font-bold tracking-wider text-neutral-0/70 uppercase"
          >
            Меню
          </p>
          <p className="font-display text-sm font-bold tracking-wide text-foreground-brand uppercase">
            {siteConfig.shortName}
          </p>
        </div>

        <nav aria-label="Мобильная навигация" className="mt-6 flex flex-1 flex-col">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active =
                activeHref != null &&
                (activeHref === item.href ||
                  activeHref === item.href.slice(1));

              return (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    variant="mobile"
                    active={active}
                    tabIndex={open ? 0 : -1}
                    onNavigate={close}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-4 pt-8">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            tabIndex={open ? 0 : -1}
            onClick={() => {
              close();
              window.setTimeout(() => {
                if (!scrollToHash(ctaHref)) {
                  window.location.assign(ctaHref);
                }
              }, 0);
            }}
          >
            {ctaLabel}
          </Button>

          <a
            href={`tel:${siteConfig.phoneTel}`}
            tabIndex={open ? 0 : -1}
            className={cn(
              "text-center font-display text-base font-bold tracking-wide",
              "text-action-primary underline-offset-4 hover:underline",
              "rounded-xs focus-visible:outline-none focus-visible:shadow-focus",
            )}
          >
            {siteConfig.phoneDisplay}
          </a>

          <div className="flex items-center justify-center gap-5 pt-1">
            <a
              href={siteConfig.social.vk}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              className="font-display text-xs font-bold tracking-[0.14em] text-neutral-0/85 uppercase underline-offset-4 hover:text-neutral-0 hover:underline focus-visible:outline-none focus-visible:shadow-focus rounded-xs"
            >
              VK
            </a>
            <a
              href={siteConfig.social.max}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              className="font-display text-xs font-bold tracking-[0.14em] text-neutral-0/85 uppercase underline-offset-4 hover:text-neutral-0 hover:underline focus-visible:outline-none focus-visible:shadow-focus rounded-xs"
            >
              MAX
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
