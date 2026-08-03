import Image from "next/image";
import { Container, Grid, Section } from "@/components/layout";
import { BrandLogos } from "@/components/shared/BrandLogos";
import { Badge } from "@/components/ui/badge";
import { Body, H2, H3, H4, Small } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { mastersContent, type MasterPerson } from "@/content/masters";
import { deviceBrands } from "@/content/trust";
import { cn } from "@/lib/cn";

export type MastersSectionProps = {
  className?: string;
  people?: readonly MasterPerson[];
  title?: string;
  titleId?: string;
  lead?: string;
};

/**
 * Masters — engineer photos, experience, certificates + workshop + brands.
 */
export function MastersSection({
  className,
  people = mastersContent.people,
  title = mastersContent.title,
  titleId = mastersContent.titleId,
  lead = mastersContent.lead,
}: MastersSectionProps) {
  const { workshop } = mastersContent;

  return (
    <Section
      id={SECTION_IDS.masters}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("masters", className)}
    >
      <Container className="flex flex-col gap-10 md:gap-12">
        <header className="masters__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="masters__lead">
              {lead}
            </Body>
          ) : null}
        </header>

        <Grid
          cols={3}
          gap="md"
          className="masters__grid"
          role="list"
          aria-label="Инженеры"
        >
          {people.map((person) => (
            <article
              key={person.id}
              role="listitem"
              className="master-card"
            >
              <div className="master-card__media">
                <Image
                  src={person.imageSrc}
                  alt={person.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="master-card__body">
                <H4 as="h3" className="master-card__name">
                  {person.name}
                </H4>
                <Small className="master-card__role">{person.role}</Small>
                <Badge variant="accent" size="sm" className="master-card__exp w-fit">
                  {person.experience}
                </Badge>
                <ul className="master-card__certs" aria-label="Сертификаты">
                  {person.certificates.map((cert) => (
                    <li key={cert}>
                      <Badge variant="outline" size="sm">
                        {cert}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </Grid>

        <div className="masters__workshop">
          <header className="masters__workshop-heading">
            <H3 id="workshop-heading">{workshop.title}</H3>
            <Body tone="muted">{workshop.lead}</Body>
          </header>
          <ul
            className="masters__workshop-grid"
            aria-labelledby="workshop-heading"
          >
            {workshop.images.map((image) => (
              <li
                key={image.id}
                className={
                  image.featured
                    ? "masters__workshop-item masters__workshop-item--featured"
                    : "masters__workshop-item"
                }
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={Boolean(image.featured)}
                  className="object-cover"
                  sizes={
                    image.featured
                      ? "(max-width: 1024px) 100vw, 1100px"
                      : "(max-width: 768px) 100vw, 50vw"
                  }
                />
              </li>
            ))}
          </ul>
        </div>

        <BrandLogos brands={deviceBrands} />
      </Container>
    </Section>
  );
}
