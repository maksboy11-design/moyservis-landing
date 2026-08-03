"use client";

import { Container, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Body, H2, H3, Small } from "@/components/ui/typography";
import { siteConfig } from "@/config/site";
import { SECTION_IDS } from "@/constants/section-ids";
import { contactsContent } from "@/content/contacts";
import { LeadForm } from "@/features/lead";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/scroll-to-hash";

export type ContactsSectionProps = {
  className?: string;
};

type ContactChannel = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

function getChannels(): ContactChannel[] {
  const channels: ContactChannel[] = [];

  if (siteConfig.email) {
    channels.push({
      id: "email",
      label: "Email",
      href: `mailto:${siteConfig.email}`,
    });
  }

  if (siteConfig.social.vk) {
    channels.push({
      id: "vk",
      label: "VK",
      href: siteConfig.social.vk,
      external: true,
    });
  }

  if (siteConfig.social.max) {
    channels.push({
      id: "max",
      label: "MAX",
      href: siteConfig.social.max,
      external: true,
    });
  }

  return channels;
}

/**
 * Final CTA — strong ask, benefit recap, phone + alt channels, lead form.
 */
export function ContactsSection({ className }: ContactsSectionProps) {
  const {
    title,
    titleId,
    lead,
    benefits,
    ctaLabel,
    ctaHref,
    phoneLabel,
    formTitle,
    formLead,
    afterHint,
    channelsLabel,
  } = contactsContent;

  const channels = getChannels();

  return (
    <Section
      id={SECTION_IDS.contacts}
      surface="none"
      paddingY="none"
      reveal
      aria-labelledby={titleId}
      className={cn("contacts", className)}
    >
      <Container className="contacts__shell">
        <div className="contacts__plane">
          <div className="contacts__copy">
            <H2 id={titleId} className="contacts__title">
              {title}
            </H2>
            <Body className="contacts__lead text-neutral-0/90">{lead}</Body>

            <ul className="contacts__benefits" aria-label="Ключевые преимущества">
              {benefits.map((item) => (
                <li key={item.id} className="contacts__benefit">
                  {item.title}
                </li>
              ))}
            </ul>

            <div className="contacts__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToHash(ctaHref)}
              >
                {ctaLabel}
              </Button>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="contacts__phone"
                aria-label={`${phoneLabel}: ${siteConfig.phoneDisplay}`}
              >
                <span className="contacts__phone-label">{phoneLabel}</span>
                <span className="contacts__phone-number">
                  {siteConfig.phoneDisplay}
                </span>
              </a>
            </div>

            {channels.length > 0 ? (
              <div className="contacts__channels">
                <Small className="contacts__channels-label">
                  {channelsLabel}
                </Small>
                <ul className="contacts__channels-list">
                  {channels.map((channel) => (
                    <li key={channel.id}>
                      <a
                        href={channel.href}
                        className="contacts__channel"
                        {...(channel.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {channel.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Small className="contacts__hint text-neutral-0/65">
              {afterHint}
              {siteConfig.hours ? ` · ${siteConfig.hours}` : null}
            </Small>
          </div>

          <div id="lead-form" className="contacts__form-panel" tabIndex={-1}>
            <div className="contacts__form-heading">
              <H3 className="contacts__form-title">{formTitle}</H3>
              <Body tone="muted" className="contacts__form-lead">
                {formLead}
              </Body>
            </div>
            <LeadForm className="contacts__form" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
