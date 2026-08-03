import { Container, Section } from "@/components/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Body, H2 } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { faqContent, type FaqItem } from "@/content/faq";
import { cn } from "@/lib/cn";
import { buildFaqPageJsonLd } from "@/seo/json-ld";

export type FaqSectionProps = {
  className?: string;
  items?: readonly FaqItem[];
  title?: string;
  titleId?: string;
  lead?: string;
};

/**
 * FAQ — Accordion + semantic FAQPage microdata (Schema-ready) + JSON-LD.
 * Questions map to PRD §4.10 and trust objections.
 */
export function FaqSection({
  className,
  items = faqContent.items,
  title = faqContent.title,
  titleId = faqContent.titleId,
  lead = faqContent.lead,
}: FaqSectionProps) {
  const jsonLd = buildFaqPageJsonLd(items);

  return (
    <Section
      id={SECTION_IDS.faq}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("faq", className)}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="flex flex-col gap-8 md:gap-10">
        <header className="faq__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="faq__lead">
              {lead}
            </Body>
          ) : null}
        </header>

        <Accordion
          name="faq"
          className="faq__accordion"
          role="list"
          aria-label={title}
        >
          {items.map((item) => (
            <div
              key={item.id}
              role="listitem"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <AccordionItem name="faq" id={`faq-${item.id}`}>
                <AccordionTrigger>
                  <h3 className="faq__question" itemProp="name">
                    {item.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <Body itemProp="text" className="text-neutral-0/90">
                    {item.answer}
                  </Body>
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}
