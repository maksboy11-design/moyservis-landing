/**
 * Hero section content — SoT for copy / media paths.
 */

export const heroContent = {
  /** Accessible H1 — brand is the visual hero signal (refs) */
  title: "МойСервис — ремонт цифровой техники в Краснодаре",
  caption: "ремонт цифровой техники",
  brand: "МойСервис",
  ctaLabel: "Оставить заявку",
  ctaHref: "#contacts",
  media: {
    src: "/images/hero/repair-bench.webp",
    srcFallback: "/images/hero/repair-bench.jpg",
    srcMobile: "/images/hero/repair-bench-mobile.webp",
    alt: "Диагностика материнской платы ноутбука мультиметром",
    width: 1024,
    height: 576,
    /** Tiny LQIP — avoids layout shift / flash */
    blurDataURL:
      "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAQAgCdASoQAAoAA4BaJagCdADcrSjzfstoAP7mmFbKw22j3/PnPTYQ/RIz2p1cTxOJULsblbcTFNa12Bp3ZOEfkGCM8HRR/bJMVRzkPfSDhVEQhVys4IWvEIh4AAAA",
  },
  tickerItems: [
    "Сервисный центр по ремонту цифровой техники",
    "Смартфонов",
    "Ноутбуков",
    "Компьютеров",
    "Игровых приставок",
  ],
  /** Mobile vertical brand rhythm (refs) */
  brandStackCount: 6,
} as const;

export type HeroContent = typeof heroContent;
