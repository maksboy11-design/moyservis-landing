import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Container, Section } from "@/components/layout";
import { Body, H1, H2 } from "@/components/ui/typography";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

export type LegalPageProps = {
  title: string;
  titleId: string;
  updatedAt: string;
  intro: string;
  sections: readonly LegalSection[];
  children?: ReactNode;
};

/**
 * Shared shell for privacy / terms documents.
 */
export function LegalPage({
  title,
  titleId,
  updatedAt,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <>
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="min-h-dvh bg-bg-page text-foreground outline-none"
      >
        <Section
          surface="dark"
          paddingY="default"
          aria-labelledby={titleId}
          className="legal-page"
        >
          <Container size="md" className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <H1 id={titleId} className="text-[length:var(--type-display-h2)]">
                {title}
              </H1>
              <Body tone="muted">{intro}</Body>
              <Body tone="muted" className="text-sm">
                Дата обновления: {updatedAt}
              </Body>
            </header>

            <div className="flex flex-col gap-8">
              {sections.map((section) => (
                <section
                  key={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="flex flex-col gap-3"
                >
                  <H2
                    id={`${section.id}-heading`}
                    className="text-[length:var(--type-display-h4)]"
                  >
                    {section.title}
                  </H2>
                  {section.paragraphs.map((text, index) => (
                    <Body key={`${section.id}-${index}`} className="text-neutral-0/90">
                      {text}
                    </Body>
                  ))}
                </section>
              ))}
            </div>
          </Container>
        </Section>
      </main>
    </>
  );
}
