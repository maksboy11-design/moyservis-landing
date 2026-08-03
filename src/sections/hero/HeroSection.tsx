"use client";

import { Stagger, StaggerItem } from "@/components/motion";
import { HeroFrame } from "@/components/shared/HeroFrame";
import { TickerBar } from "@/components/shared/TickerBar";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/constants/section-ids";
import { heroContent } from "@/content/hero";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type HeroSectionProps = {
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Hero — purple plane + media frame + brand + lime ticker (refs).
 * Fits popular viewports (100dvh). Single CTA in fold (PRD).
 */
export function HeroSection({
  className,
  ctaLabel = heroContent.ctaLabel,
  ctaHref = heroContent.ctaHref,
}: HeroSectionProps) {
  return (
    <section
      id={SECTION_IDS.hero}
      aria-labelledby="hero-heading"
      className={cn("hero", className)}
    >
      <div className="hero__plane">
        <Stagger className="flex min-h-0 flex-1 flex-col">
          <StaggerItem className="hero__frame-slot min-h-0">
            <HeroFrame
              media={heroContent.media}
              caption={heroContent.caption}
              brand={heroContent.brand}
              title={heroContent.title}
              brandStackCount={heroContent.brandStackCount}
              priority
            />
          </StaggerItem>

          <StaggerItem className="hero__cta">
            <Button
              variant="primary"
              size="lg"
              onClick={() => scrollToHash(ctaHref)}
            >
              {ctaLabel}
            </Button>
          </StaggerItem>
        </Stagger>
      </div>

      <TickerBar items={heroContent.tickerItems} />
    </section>
  );
}
