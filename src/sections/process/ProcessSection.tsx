"use client";

import { Container, Section } from "@/components/layout";
import { ProcessTimeline } from "@/components/shared/ProcessTimeline";
import { Button } from "@/components/ui/button";
import { Body, H2 } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { processContent, type ProcessStepContent } from "@/content/process";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type ProcessSectionProps = {
  className?: string;
  steps?: readonly ProcessStepContent[];
  title?: string;
  titleId?: string;
  lead?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showCta?: boolean;
};

/**
 * Process — visual repair scheme (IA 5 steps).
 * Mobile vertical timeline · desktop horizontal track + CTA.
 */
export function ProcessSection({
  className,
  steps = processContent.steps,
  title = processContent.title,
  titleId = processContent.titleId,
  lead = processContent.lead,
  ctaLabel = processContent.ctaLabel,
  ctaHref = processContent.ctaHref,
  showCta = true,
}: ProcessSectionProps) {
  return (
    <Section
      id={SECTION_IDS.process}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("process", className)}
    >
      <Container className="flex flex-col gap-8 md:gap-10">
        <header className="process__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="process__lead">
              {lead}
            </Body>
          ) : null}
        </header>

        <ProcessTimeline steps={steps} aria-label={title} />

        {showCta ? (
          <div className="process__cta">
            <Button
              variant="primary"
              size="lg"
              onClick={() => scrollToHash(ctaHref)}
            >
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
