import { Container, Grid, Section } from "@/components/layout";
import { serviceIcons } from "@/components/icons/service-icons";
import { ServiceCard } from "@/components/ui/card";
import { H2 } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { servicesContent, type ServiceItem } from "@/content/services";
import { cn } from "@/lib/cn";

export type ServicesSectionProps = {
  className?: string;
  items?: readonly ServiceItem[];
  title?: string;
  titleId?: string;
};

/**
 * Services — 3 dark cards, media top/bottom rhythm, centered title (refs).
 * Grid: 1 → 2 → 3 cols. Hover lift + media zoom (CSS).
 */
export function ServicesSection({
  className,
  items = servicesContent.items,
  title = servicesContent.title,
  titleId = servicesContent.titleId,
}: ServicesSectionProps) {
  return (
    <Section
      id={SECTION_IDS.services}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("services", className)}
    >
      <Container className="flex flex-col gap-8 md:gap-10">
        <header className="services__heading">
          <H2 id={titleId}>{title}</H2>
        </header>

        <Grid
          cols={3}
          gap="md"
          className="services__grid"
          role="list"
          aria-label={title}
        >
          {items.map((item) => {
            const Icon = serviceIcons[item.icon];

            return (
              <div key={item.id} role="listitem" className="min-w-0 h-full">
                <ServiceCard
                  title={item.title}
                  description={item.description}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  imagePosition={item.mediaPosition}
                  icon={<Icon />}
                />
              </div>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}
