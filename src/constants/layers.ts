/**
 * Каталог слоёв — Stage 1 foundation.
 * Реализация UI — следующие этапы. Здесь только границы модулей.
 */

export const LAYER_CATALOG = {
  ui: "components/ui — Button, Form controls, Card, Typography…",
  shared: "components/shared — BrandWordmark, NavLink, MenuToggle",
  layout: "components/layout — Header, Navbar, Container, Section, Grid",
  sections: "sections/* — IA landing blocks",
  features: "features/* — lead, navigation, analytics",
  domain: "domain/* — types only",
  schemas: "schemas/* — Zod",
  services: "services/* — server-only I/O",
} as const;
