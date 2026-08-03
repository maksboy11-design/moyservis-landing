import Link from "next/link";
import { BrandWordmark } from "@/components/shared/BrandWordmark";
import { Container } from "@/components/layout/Container";
import { Body, Small } from "@/components/ui/typography";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

export type FooterProps = {
  className?: string;
};

type SocialChannel = {
  id: string;
  label: string;
  href: string;
};

function getSocialChannels(): SocialChannel[] {
  const channels: SocialChannel[] = [];

  if (siteConfig.social.vk) {
    channels.push({ id: "vk", label: "VK", href: siteConfig.social.vk });
  }
  if (siteConfig.social.max) {
    channels.push({ id: "max", label: "MAX", href: siteConfig.social.max });
  }

  return channels;
}

/**
 * Site footer — logo, semantic contacts, hours, social, legal links (PRD §4.12).
 */
export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();
  const social = getSocialChannels();
  const { address, legal, legalLinks, hours } = siteConfig;
  const mapsHref = `https://yandex.ru/maps/?pt=${siteConfig.geo.lng},${siteConfig.geo.lat}&z=16&l=map`;

  return (
    <footer
      className={cn("site-footer", className)}
      role="contentinfo"
      aria-label="Подвал сайта"
    >
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandWordmark size="sm" tone="light" href="/#hero" />
          <Body className="site-footer__tagline text-neutral-0/70">
            {siteConfig.tagline} · {siteConfig.city}
          </Body>
        </div>

        <address
          className="site-footer__contacts"
          itemScope
          itemType="https://schema.org/Organization"
        >
          <meta itemProp="name" content={siteConfig.name} />
          <p className="site-footer__heading">Контакты</p>

          <ul className="site-footer__contact-list">
            <li>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="site-footer__link"
                itemProp="telephone"
              >
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="site-footer__link"
                itemProp="email"
              >
                {siteConfig.email}
              </a>
            </li>
            <li
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <a
                href={mapsHref}
                className="site-footer__link site-footer__address-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span itemProp="streetAddress">{address.street}</span>
                {", "}
                <span itemProp="addressLocality">{address.city}</span>
                {address.postalCode ? (
                  <>
                    {", "}
                    <span itemProp="postalCode">{address.postalCode}</span>
                  </>
                ) : null}
                <meta itemProp="addressCountry" content={address.country} />
              </a>
            </li>
            <li>
              <span className="site-footer__hours">
                <span className="site-footer__hours-label">График работы:</span>{" "}
                {hours}
              </span>
            </li>
          </ul>
        </address>

        {social.length > 0 ? (
          <nav className="site-footer__social" aria-label="Мессенджеры и соцсети">
            <p className="site-footer__heading">Связь</p>
            <ul className="site-footer__social-list">
              {social.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    className="site-footer__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <nav className="site-footer__legal-nav" aria-label="Юридическая информация">
          <p className="site-footer__heading">Документы</p>
          <ul className="site-footer__legal-list">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__legal">
          <Small className="site-footer__entity">
            {legal.entityName}
            {legal.inn ? ` · ИНН ${legal.inn}` : null}
            {legal.ogrn ? ` · ОГРН ${legal.ogrn}` : null}
          </Small>
          <Small className="site-footer__copy">
            © {year} {siteConfig.name}. Все права защищены.
          </Small>
        </div>
      </Container>
    </footer>
  );
}
