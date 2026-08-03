import { Container, Grid, Section } from "@/components/layout";
import { IconBadge } from "@/components/shared/IconBadge";
import { IconShield } from "@/components/icons/advantage-icons";
import { Body, H2, H3, H4, Small } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { guaranteesContent } from "@/content/guarantees";
import { cn } from "@/lib/cn";

export type GuaranteesSectionProps = {
  className?: string;
  title?: string;
  titleId?: string;
  lead?: string;
};

/**
 * Guarantees — warranty terms + certificates + licenses (PRD trust).
 */
export function GuaranteesSection({
  className,
  title = guaranteesContent.title,
  titleId = guaranteesContent.titleId,
  lead = guaranteesContent.lead,
}: GuaranteesSectionProps) {
  return (
    <Section
      id={SECTION_IDS.guarantees}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("guarantees", className)}
    >
      <Container className="flex flex-col gap-10 md:gap-12">
        <header className="guarantees__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="guarantees__lead">
              {lead}
            </Body>
          ) : null}
        </header>

        <Grid
          cols={2}
          gap="md"
          className="guarantees__grid"
          role="list"
          aria-label="Условия гарантии"
        >
          {guaranteesContent.items.map((item) => (
            <article key={item.id} role="listitem" className="guarantee-card">
              <IconBadge className="guarantee-card__badge">
                <IconShield />
              </IconBadge>
              <div className="flex flex-col gap-2">
                <H4 as="h3">{item.title}</H4>
                <Body className="text-neutral-0/90">{item.body}</Body>
              </div>
            </article>
          ))}
        </Grid>

        <Small className="guarantees__footnote text-foreground-muted">
          {guaranteesContent.footnote}
        </Small>

        <div className="guarantees__proofs">
          <div className="guarantees__proof-block">
            <H3 className="guarantees__proof-title">Сертификаты</H3>
            <ul className="guarantees__proof-list" aria-label="Сертификаты">
              {guaranteesContent.certificates.map((item) => (
                <li key={item.id} className="guarantees__proof-item">
                  <H4 as="h4" className="text-[length:var(--font-size-sm)]">
                    {item.title}
                  </H4>
                  <Body tone="muted">{item.body}</Body>
                </li>
              ))}
            </ul>
          </div>

          <div className="guarantees__proof-block">
            <H3 className="guarantees__proof-title">Лицензии и документы</H3>
            <ul className="guarantees__proof-list" aria-label="Лицензии">
              {guaranteesContent.licenses.map((item) => (
                <li key={item.id} className="guarantees__proof-item">
                  <H4 as="h4" className="text-[length:var(--font-size-sm)]">
                    {item.title}
                  </H4>
                  <Body tone="muted">{item.body}</Body>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
