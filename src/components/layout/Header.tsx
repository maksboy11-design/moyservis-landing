"use client";

import { useMemo, useRef, useState } from "react";
import { BrandWordmark } from "@/components/shared/BrandWordmark";
import { MenuToggle } from "@/components/shared/MenuToggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { siteConfig, type NavItem } from "@/config/site";
import { MobileMenu } from "@/features/mobile-menu/MobileMenu";
import { useMediaMin } from "@/hooks/use-media-query";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type HeaderProps = {
  navItems?: readonly NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

/**
 * Sticky header — transparent spread-nav over hero (refs),
 * solid logo | nav | phone + CTA after scroll (PRD §4.2).
 * Fixed height prevents layout jump on state change.
 */
export function Header({
  navItems = siteConfig.nav,
  ctaLabel = "Связаться",
  ctaHref = "/#contacts",
  className,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(40);
  /** Phone only when desktop width fits logo + nav + tel + CTA (2xl ≥ 1440). */
  const showPhone = useMediaMin("2xl");
  const toggleRef = useRef<HTMLButtonElement>(null);

  const spyIds = useMemo(
    () => [
      "hero",
      ...navItems.map((item) =>
        item.href.replace(/^\/#/, "").replace(/^#/, ""),
      ),
    ],
    [navItems],
  );
  const activeId = useScrollSpy(spyIds);
  const activeHref =
    activeId && activeId !== "hero" ? `/#${activeId}` : null;

  const solid = scrolled || menuOpen;
  const mobileCtaLabel =
    ctaLabel === "Связаться" ? "Свяжитесь с нами" : ctaLabel;

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0",
          "h-[var(--header-height)]",
          "transition-[background-color,box-shadow,backdrop-filter]",
          "duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-standard)]",
          /* Above overlay while menu open — hamburger ↔ close stays tappable */
          menuOpen ? "z-[calc(var(--z-overlay)+1)]" : "z-[var(--z-header)]",
          solid
            ? "bg-bg-page/92 shadow-sm backdrop-blur-md"
            : "bg-transparent",
          className,
        )}
        data-scrolled={solid || undefined}
        data-state={solid ? "solid" : "transparent"}
        aria-label="Шапка сайта"
      >
        <Container className="relative flex h-full min-w-0 items-center">
          {/* Desktop · one mode at a time (spread XOR solid) — avoids dual-layer
              paint where absolute “Контакты” lands on the phone. */}
          {!solid ? (
            <Navbar
              items={navItems}
              activeHref={activeHref}
              layout="spread"
              className="absolute inset-x-0 top-0 h-full"
            />
          ) : (
            <div className="nav-desktop w-full min-w-0">
              {/* Explicit columns — nav cannot paint into the phone/CTA track */}
              <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 xl:gap-6">
                <BrandWordmark
                  size="sm"
                  tone="brand"
                  className="shrink-0"
                  tabIndex={0}
                />

                <Navbar
                  items={navItems}
                  activeHref={activeHref}
                  layout="cluster"
                  className="min-w-0 justify-center overflow-hidden"
                />

                <div className="flex shrink-0 items-center gap-2 xl:gap-4">
                  {showPhone ? (
                    <a
                      href={`tel:${siteConfig.phoneTel}`}
                      tabIndex={0}
                      className={cn(
                        "font-display text-sm font-bold tracking-wide whitespace-nowrap",
                        "text-action-primary underline-offset-4 hover:underline",
                        "rounded-xs focus-visible:outline-none focus-visible:shadow-focus",
                      )}
                    >
                      {siteConfig.phoneDisplay}
                    </a>
                  ) : null}
                  <Button
                    variant="primary"
                    size="sm"
                    tabIndex={0}
                    onClick={() => {
                      if (!scrollToHash(ctaHref)) {
                        window.location.assign(ctaHref);
                      }
                    }}
                  >
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile: hamburger (refs); logo appears when solid */}
          <div className="nav-mobile w-full items-center justify-between gap-3">
            <BrandWordmark
              size="sm"
              tone={solid ? "brand" : "light"}
              tabIndex={solid ? 0 : -1}
              aria-hidden={!solid}
              className={cn(
                "min-w-0 shrink transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-standard)]",
                solid ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
            <MenuToggle
              ref={toggleRef}
              className="relative z-[1] ml-auto shrink-0"
              open={menuOpen}
              tone="light"
              onPressed={() => setMenuOpen((value) => !value)}
            />
          </div>
        </Container>
      </header>

      <MobileMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={navItems}
        activeHref={activeHref}
        ctaLabel={mobileCtaLabel}
        ctaHref={ctaHref}
        restoreFocusRef={toggleRef}
      />
    </>
  );
}
