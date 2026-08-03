import { siteConfig } from "@/config/site";
import { env } from "@/config/env";
import type { FaqItem } from "@/content/faq";

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: siteConfig.name,
    description: siteConfig.description,
    url: env.siteUrl,
    telephone: siteConfig.phoneTel,
    email: siteConfig.email,
    image: `${env.siteUrl}/og/og-default.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    areaServed: {
      "@type": "City",
      name: siteConfig.city,
    },
    sameAs: [siteConfig.social.vk, siteConfig.social.max].filter(Boolean),
  };
}

/**
 * FAQPage JSON-LD — pairs with FAQ section microdata.
 */
export function buildFaqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
