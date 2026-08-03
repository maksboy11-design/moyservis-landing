/**
 * Публичный конфиг сайта (не секреты).
 * URL и ключи уведомлений — через env.
 */

export const siteConfig = {
  name: "МойСервис",
  shortName: "МойСервис",
  tagline: "ремонт цифровой техники",
  description:
    "Сервисный центр в Краснодаре: ремонт смартфонов, ноутбуков, компьютеров и игровых консолей. Прозрачные сроки, оригинал комплектующих, гарантия.",
  locale: "ru_RU",
  language: "ru",
  city: "Краснодар",
  phoneDisplay: "+7 (918) 351-51-41",
  phoneTel: "+79183515141",
  email: "hello@moyservis.local",
  address: {
    street: "ул. Васнецова, д. 38, мкр-н Хлопчато-бумажный Комбинат",
    city: "Краснодар",
    postalCode: "350000",
    country: "RU",
  },
  hours: "со вторника по воскресенье: 10:00–18:00",
  geo: {
    lat: 45.0355,
    lng: 38.9753,
  },
  social: {
    vk: "https://vk.com/",
    max: "https://max.ru/",
  },
  legal: {
    entityName: "Сервисный центр «МойСервис»",
    /** Заполните реальные реквизиты перед публикацией */
    inn: "",
    ogrn: "",
  },
  legalLinks: [
    { href: "/privacy", label: "Политика конфиденциальности" },
    { href: "/terms", label: "Пользовательское соглашение" },
  ],
  nav: [
    { href: "/#services", label: "Наши услуги" },
    { href: "/#about", label: "О нас" },
    { href: "/#guarantees", label: "Гарантия" },
    { href: "/#reviews", label: "Отзывы" },
    { href: "/#contacts", label: "Контакты" },
  ],
  themeColor: "#6B2CF5",
  backgroundColor: "#121212",
} as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = (typeof siteConfig.nav)[number];
