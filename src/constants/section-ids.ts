/**
 * Section anchor IDs — единый SoT для nav / SEO / scroll.
 * Совпадает с IA Stage 0.
 */
export const SECTION_IDS = {
  hero: "hero",
  services: "services",
  about: "about",
  advantages: "advantages",
  process: "process",
  masters: "masters",
  guarantees: "guarantees",
  reviews: "reviews",
  faq: "faq",
  contacts: "contacts",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const SECTION_ORDER: SectionId[] = [
  SECTION_IDS.hero,
  SECTION_IDS.services,
  SECTION_IDS.about,
  SECTION_IDS.advantages,
  SECTION_IDS.process,
  SECTION_IDS.masters,
  SECTION_IDS.guarantees,
  SECTION_IDS.reviews,
  SECTION_IDS.faq,
  SECTION_IDS.contacts,
];
