import { Container, Grid, Section } from "@/components/layout";
import { advantageIcons } from "@/components/icons/advantage-icons";
import { TrustFact } from "@/components/shared/TrustFact";
import { Body, H2 } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import {
  advantagesContent,
  type AdvantageItem,
} from "@/content/advantages";
import { cn } from "@/lib/cn";

export type AdvantagesSectionProps = {
  className?: string;
  items?: readonly AdvantageItem[];
  title?: string;
  titleId?: string;
  lead?: string;
};

/**
 * Advantages — «Почему мы»: IconBadge + title + text cards (PRD / DS).
 * Grid 1 → 2 → 3; scroll-reveal + hover micro-motion.
 */
export function AdvantagesSection({
  className,
  items = advantagesContent.items,
  title = advantagesContent.title,
  titleId = advantagesContent.titleId,
  lead = advantagesContent.lead,
}: AdvantagesSectionProps) {
  return (
    <Section
      id={SECTION_IDS.advantages}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("advantages", className)}
    >
      <Container className="flex flex-col gap-8 md:gap-10">
        <header className="advantages__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="advantages__lead">
              {lead}
            </Body>
          ) : null}
        </header>

        <Grid
          cols={3}
          gap="md"
          className="advantages__grid"
          role="list"
          aria-label={title}
        >
          {items.map((item) => {
            const Icon = advantageIcons[item.icon];

            return (
              <div key={item.id} role="listitem" className="h-full min-w-0">
                <TrustFact
                  variant="card"
                  icon={<Icon />}
                  title={item.title}
                  description={item.description}
                />
              </div>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}
