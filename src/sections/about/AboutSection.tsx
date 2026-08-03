"use client";

import Image from "next/image";
import { Container, Section } from "@/components/layout";
import { advantageIcons } from "@/components/icons/advantage-icons";
import { StatRow } from "@/components/shared/StatRow";
import { TrustFact } from "@/components/shared/TrustFact";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/card";
import { SECTION_IDS } from "@/constants/section-ids";
import { aboutContent, type AboutFact } from "@/content/about";
import { trustStats } from "@/content/trust";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type AboutSectionProps = {
  className?: string;
  facts?: readonly AboutFact[];
  title?: string;
  titleId?: string;
};

/**
 * About — brand story + trust facts + statistics (PRD proof matrix).
 */
export function AboutSection({
  className,
  facts = aboutContent.facts,
  title = aboutContent.title,
  titleId = aboutContent.titleId,
}: AboutSectionProps) {
  return (
    <Section
      id={SECTION_IDS.about}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("about", className)}
    >
      <Container className="flex flex-col gap-8 md:gap-10">
        <FeatureCard
          title={title}
          titleId={titleId}
          description={aboutContent.body}
          media={
            <Image
              src={aboutContent.media.src}
              alt={aboutContent.media.alt}
              width={1024}
              height={682}
              priority
              className="h-auto w-full bg-neutral-0"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          }
          aside={
            <div className="about__aside flex flex-col gap-5">
              <ul className="about__facts flex flex-col gap-4" aria-label="Факты о сервисе">
                {facts.map((fact) => {
                  const Icon = advantageIcons[fact.icon];
                  return (
                    <li key={fact.id}>
                      <TrustFact
                        variant="row"
                        icon={<Icon />}
                        title={fact.title}
                      />
                    </li>
                  );
                })}
              </ul>
              <Button
                variant="primary"
                fullWidth
                onClick={() => scrollToHash(aboutContent.ctaHref)}
              >
                {aboutContent.ctaLabel}
              </Button>
            </div>
          }
        />

        <StatRow items={trustStats} />
      </Container>
    </Section>
  );
}
