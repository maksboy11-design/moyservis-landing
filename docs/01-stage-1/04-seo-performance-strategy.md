# 1.4 — SEO & Performance Strategy

**Роль:** SEO / Performance Specialist  
**Проект:** МойСервис · one-page landing (Краснодар)  
**Стек:** Next.js 15 App Router · Metadata API (ADR-004) · RSC islands (ADR-005)  
**Дата:** 2026-07-29  
**Статус кода:** Foundation smoke — стратегия обязательна до сборки секций (Этапы 2–5)

---

## 0. Целевые показатели (Definition of Done)

| Метрика | Цель | Инструмент |
|---------|------|------------|
| Lighthouse Performance | **≥ 95** | Lighthouse / PageSpeed (mobile + desktop) |
| Lighthouse SEO | **≥ 95** | Lighthouse |
| Lighthouse Accessibility | **≥ 95** | Lighthouse (смежный gate) |
| **LCP** | **< 2.5 с** | CrUX / Lighthouse / Web Vitals |
| **CLS** | **< 0.1** | CrUX / Lighthouse |
| **INP** | **< 200 мс** | CrUX / Lighthouse (field предпочтительнее) |

**Проверка:** Этап 5 · Quality gates · Performance + SEO audit.  
**Окружение измерения:** production build (`next build` + `next start`), throttling Mobile, без DevTools open на field-like run.

---

## 1. SEO Strategy

### 1.1 Semantic HTML

**Принцип:** одна страница = один документ с landmark-разметкой и осмысленными секциями (IA Stage 0).

| Элемент | Правило | Реализация |
|---------|---------|------------|
| `<html lang="ru">` | Обязательно | уже в `layout.tsx` |
| `<header>` | Site chrome: logo + nav + CTA | `components/layout/Header` |
| `<nav aria-label="Основная навигация">` | Якоря `#services` `#about` `#contacts` | Header + mobile menu |
| `<main id="main">` | Единственный main | `page.tsx` оборачивает все секции |
| `<section id="…">` | 1 секция = 1 IA-блок | `sections/*` |
| `<article>` | Отзывы (каждый review) | `sections/reviews` |
| `<footer>` | Контакты-дубль, legal, якоря | `components/layout/Footer` |
| Skip-link | `a.href="#main"` visually hidden → focus | layout |

**Запрещено:**
- `<div>` вместо landmark без причины;
- несколько `<h1>`;
- секции без `id` из IA (ломает якоря и a11y).

**Карта landmarks (целевая):**

```
header > nav
main
  section#hero
  section#services
  section#about
  section#advantages
  section#process
  section#masters
  section#guarantees
  section#reviews
  section#faq
  section#contacts
footer
```

---

### 1.2 Heading hierarchy

**Правило:** строго один **H1**; дальше без пропусков уровней (`h1 → h2 → h3`).

| Уровень | Контент | Где |
|---------|---------|-----|
| **H1** | Бренд + ценность (не «Design System») | Hero: визуально интегрирован; при конфликте с brand-as-image — текст H1 + `aria` на wordmark |
| **H2** | Заголовок каждой секции | Services, About, Advantages, Process, Masters, Guarantees, Reviews, FAQ, Contacts |
| **H3** | Карточки услуг, шаги процесса, вопросы FAQ, имена мастеров | внутри секций |
| H4+ | Не использовать в v1 | — |

**Целевой H1 (черновик копирайта):**  
`МойСервис — ремонт цифровой техники в Краснодаре`

**H2 примеры:**
- Наши услуги  
- О нас  
- Почему нам доверяют  
- Как проходит ремонт  
- Мастера  
- Гарантия  
- Отзывы клиентов  
- Частые вопросы  
- Контакты и заявка  

**Проверка:** outline-документ (HeadingsMap / Lighthouse SEO / axe) — одна H1, логичный TOC.

---

### 1.3 Metadata (Next.js Metadata API)

**Файлы:** `src/app/layout.tsx` + `src/seo/metadata.ts` + `src/config/site.ts`  
**Не использовать:** `next-seo` (ADR-004).

```ts
// Целевая форма (layout / generateMetadata)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!), // https://example.ru
  title: {
    default: "МойСервис — ремонт смартфонов и техники в Краснодаре",
    template: "%s · МойСервис",
  },
  description:
    "Сервисный центр МойСервис в Краснодаре: ремонт смартфонов, ноутбуков, ПК и игровых консолей. Фиксированная цена после согласования, большинство ремонтов за 1–2 дня.",
  keywords: [
    "ремонт телефонов Краснодар",
    "ремонт ноутбуков Краснодар",
    "сервисный центр Краснодар",
    "МойСервис",
  ],
  authors: [{ name: "МойСервис" }],
  creator: "МойСервис",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
};
```

| Поле | Правило |
|------|---------|
| `title` | ≤ ~60 символов; бренд + услуга + город |
| `description` | 140–160 символов; UVP + город + CTA-смысл |
| `metadataBase` | Обязателен для абсолютных OG URL |
| `canonical` | Всегда production origin + `/` (one-page) |
| Preview / staging | `robots: { index: false, follow: false }` через env |

**Блокер контента:** финальный телефон/адрес (Stage 0 open Q #2) — вставлять в description только после утверждения, не выдумывать.

---

### 1.4 Open Graph

```ts
openGraph: {
  type: "website",
  locale: "ru_RU",
  url: "/",
  siteName: "МойСервис",
  title: "МойСервис — ремонт цифровой техники в Краснодаре",
  description:
    "Честный сервисный центр: оригинальные комплектующие, согласованная цена, ремонт за 1–2 дня.",
  images: [
    {
      url: "/og/og-default.jpg", // 1200×630, ≤ 300 KB, WebP/JPG
      width: 1200,
      height: 630,
      alt: "МойСервис — сервисный центр в Краснодаре",
    },
  ],
},
```

| Требование | Значение |
|------------|----------|
| Размер OG | **1200×630** |
| Путь | `public/og/og-default.jpg` (+ `@2x` не нужен) |
| Контент изображения | Бренд + атмосфера мастерской / техника; без мелкого текста |
| `og:locale` | `ru_RU` |

---

### 1.5 Twitter Cards

```ts
twitter: {
  card: "summary_large_image",
  title: "МойСервис — ремонт цифровой техники в Краснодаре",
  description:
    "Ремонт смартфонов, ноутбуков, ПК и консолей. Краснодар.",
  images: ["/og/og-default.jpg"],
},
```

Карточка: `summary_large_image` (тот же ассет, что OG).  
Twitter/`X` handle — только если появится официальный аккаунт (сейчас не задан).

---

### 1.6 Schema.org (JSON-LD)

**Файлы:** `src/seo/jsonLd.ts` → inject через `<script type="application/ld+json">` в `layout` или `page` (RSC).

#### A. LocalBusiness (обязательно)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://SITE_URL/#business",
  "name": "МойСервис",
  "description": "Сервисный центр по ремонту цифровой техники в Краснодаре",
  "url": "https://SITE_URL/",
  "image": "https://SITE_URL/og/og-default.jpg",
  "telephone": "+7…",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "…",
    "addressLocality": "Краснодар",
    "addressRegion": "Краснодарский край",
    "postalCode": "…",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 0,
    "longitude": 0
  },
  "openingHoursSpecification": [],
  "priceRange": "₽₽",
  "areaServed": {
    "@type": "City",
    "name": "Краснодар"
  },
  "sameAs": ["https://vk.com/…", "https://max.ru/…"]
}
```

**Блокеры LocalBusiness (не публиковать неполную схему):** телефон, streetAddress, geo, openingHours, sameAs — из open Q Stage 0.

Опционально уточнить тип: `ElectronicsStore` / `ComputerStore` только если соответствует реальной деятельности; иначе оставить `LocalBusiness`.

#### B. Service (обязательно, массив / ItemList)

На каждую услугу из IA:

| name | Описание |
|------|----------|
| Ремонт мобильной техники | Смартфоны, планшеты |
| Ремонт компьютеров и цифровой техники | Ноутбуки, ПК, приставки |
| Комплектующие для цифровой техники | Оригинальные / качественные ЗИП |

```json
{
  "@type": "Service",
  "serviceType": "Ремонт мобильной техники",
  "provider": { "@id": "https://SITE_URL/#business" },
  "areaServed": { "@type": "City", "name": "Краснодар" }
}
```

Связать через `makesOffer` / `hasOfferCatalog` на LocalBusiness **или** отдельный `@graph`.

#### C. FAQPage (обязательно при секции FAQ)

Генерировать **только** из реально видимых Q&A на странице (паритет HTML ↔ JSON-LD).

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Не вырастет ли цена после диагностики?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "…"
      }
    }
  ]
}
```

**Темы FAQ (из UX objections, копирайт — Этап 3):**
1. Подмена комплектующих  
2. Рост цены после диагностики  
3. Сохранность данных  
4. Сроки ремонта  
5. Формальная гарантия  

#### D. WebSite / WebPage (опционально v1)

Минимальный `@graph`: `WebSite` + `WebPage` + `LocalBusiness` + `FAQPage`.

**Валидация:** [Rich Results Test](https://search.google.com/test/rich-results) + Schema Markup Validator перед релизом.

---

### 1.7 Sitemap

**Файл:** `src/app/sitemap.ts` (Next.js Metadata Route).

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

One-page → **один URL**. Якоря (`#faq`) в sitemap **не** включать.  
После появления `/privacy` — добавить второй entry.

---

### 1.8 Robots

**Файл:** `src/app/robots.ts`

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  return {
    rules: {
      userAgent: "*",
      allow: isProd ? "/" : undefined,
      disallow: isProd ? undefined : "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

| Env | Политика |
|-----|----------|
| production | `Allow: /` + sitemap |
| preview / local | `Disallow: /` (не индексировать стенды) |

---

### 1.9 Canonical URLs

| Правило | Деталь |
|---------|--------|
| Единственный canonical | `metadataBase` + `alternates.canonical: "/"` |
| www / non-www | Один host на CDN/hosting (301) |
| trailing slash | Единая политика Next (`trailingSlash: false` по умолчанию) |
| UTM / query | Canonical без query |
| Preview URLs | `noindex` + свой canonical не на prod |

---

### 1.10 Alt-тексты

| Тип изображения | Правило alt | Пример |
|-----------------|-------------|--------|
| Hero (LCP) | Описательный, с брендом/контекстом | `Мастер МойСервис ремонтирует смартфон в сервисном центре` |
| Услуги / proof | Что на фото + смысл | `Оригинальные комплектующие на складе МойСервис` |
| Портрет мастера | Имя + роль | `Алексей, мастер по ремонту смартфонов` |
| Декоративные паттерны / ticker bg | `alt=""` + `role="presentation"` или CSS background | — |
| OG / share | См. Open Graph `images[].alt` | — |
| Логотип в header | Текст бренда, если нет рядом видимого названия | `МойСервис` |
| Иконки UI (SVG) | Через `aria-hidden` если рядом текст кнопки | — |

**Запрещено:** `alt="image1"`, keyword stuffing, пустой alt на смысловых фото.

---

### 1.11 SEO checklist по этапам

| Этап | SEO-задачи |
|------|------------|
| 2 Foundation | `site.ts`, `seo/` stubs, `robots.ts`, `sitemap.ts`, расширенный `metadata`, `public/og`, favicon |
| 3 UI sections | Semantic landmarks, H1–H3, alt на ассетах, FAQ markup ready |
| 4 Conversion | Contacts → LocalBusiness fields, privacy page URL в footer/sitemap |
| 5 Quality | Rich Results, Lighthouse SEO ≥ 95, Search Console property |

---

## 2. Performance Strategy

### 2.1 Бюджет и критический путь

**LCP-элемент (прогноз):** hero-изображение или H1+brand block.

| Фаза | Цель |
|------|------|
| TTFB | SSG/ISR static HTML с edge/CDN |
| LCP | Hero `next/image` + `priority` + sized width/height |
| CLS | Резерв места под media, шрифты `swap` + метрики, sticky header без скачка |
| INP | Минимум client JS; deferred islands; no heavy handlers на scroll |

---

### 2.2 Lazy loading

| Ресурс | Стратегия |
|--------|-----------|
| Hero image | **Не lazy** — `priority` / `loading="eager"` + `fetchPriority="high"` |
| Below-fold images | `next/image` default lazy |
| iframe карты (Contacts) | Lazy + placeholder; грузить по `IntersectionObserver` или по клику «Открыть карту» |
| Framer Motion reveals | Подключать только client islands ниже fold |
| Video (если появится) | `preload="none"` + poster |

```tsx
// Hero
<Image src={hero} alt="…" priority sizes="100vw" />

// Below fold
<Image src={proof} alt="…" loading="lazy" sizes="(max-width:768px) 100vw, 50vw" />
```

---

### 2.3 Code splitting

| Модуль | Стратегия |
|--------|-----------|
| Page shell / sections static | Server Components по умолчанию (ADR-005) |
| Mobile menu | `"use client"` island |
| FAQ accordion | client island (Radix) |
| Lead form | `features/lead` client + server action |
| Framer Motion | `next/dynamic(() => import(…), { ssr: false })` **или** lazy section wrappers |
| Analytics | После consent, dynamic import |

```tsx
const MotionReveal = dynamic(
  () => import("@/components/shared/MotionReveal"),
  { ssr: false }
);
```

**Правило:** не импортировать `framer-motion` в layout/root — только в islands.

---

### 2.4 Image optimization

| Правило | Деталь |
|---------|--------|
| API | Только `next/image` |
| Форматы | AVIF → WebP → fallback (`images.formats` в `next.config`) |
| Размеры | Явные `width`/`height` или `fill` + aspect-ratio CSS |
| `sizes` | Обязателен для responsive |
| Hero | ≤ ~200–250 KB compressed; LCP ≤ 2.5s |
| Srcset | Автоматически через Next |
| CDN | Hosting image optimizer (Vercel/Cloudflare) |
| CLS | Никогда не вставлять `<img>` без размеров |

```ts
// next.config.ts (целевое)
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},
```

Ассеты: `public/images/` — исходники оптимизировать до коммита (Squoosh); не класть 5MB JPG.

---

### 2.5 Font optimization

**Уже сделано:** `next/font/google` · Geologica + Manrope · `display: "swap"` · subset `latin`+`cyrillic`.

| Доработка | Зачем |
|-----------|-------|
| Сузить `weight` до реально используемых (напр. 400/500/700) | Меньше байт шрифтов → LCP/CLS |
| Не грузить оба семейства всеми весами «про запас» | Audit на Этапе 5 |
| Избегать FOIT | `swap` уже ок; следить CLS от font metrics |
| Self-host через next/font | Уже self-host (нет runtime Google CSS) |

**Preload шрифтов:** next/font делает автоматически — ручной `<link rel="preload">` для woff2 **не дублировать**.

---

### 2.6 Preconnect / Preload / Prefetch

| Hint | Когда | Пример |
|------|-------|--------|
| **preconnect** | Сторонние origins на critical path | analytics, map tiles, Telegram API — **только** если реально hit на first paint |
| **dns-prefetch** | Дешёвый fallback для низкоприоритетных third-party | VK/MAX виджеты (если iframe) |
| **preload** | LCP image (если не покрыт `priority` у next/image) | редко нужно вручную |
| **prefetch** | Следующие маршруты | one-page → почти не актуально; privacy page — `next/link` prefetch |
| **modulepreload** | Критичный chunk | отдаём Next bundler |

```tsx
// layout — только при реальном third-party на critical path
<link rel="preconnect" href="https://*.ingest…" crossOrigin="" />
```

**Политика v1:** минимум third-party. Карта — lazy. Аналитика — после interaction/consent. Не preconnect «на будущее».

---

### 2.7 Bundle optimization

| Мера | Деталь |
|------|--------|
| RSC default | Нет `"use client"` без интерактива |
| Tree-shaking | Именованные импорты из `lucide-react` / Radix |
| shadcn | Только нужные примитивы |
| Zod | Только в form/feature lead, не в layout |
| Analyze | `@next/bundle-analyzer` на Этапе 5 |
| Initial JS budget (ориентир) | **≤ 150–180 KB gzip** first load JS (цель-стретч для Lighthouse 95) |
| CSS | Tailwind purge/content paths; tokens в CSS vars |
| Polyfills | Не тянуть legacy вручную |

**Запрещено в v1:** GSAP, heavy chart libs, full lodash, moment.js, smooth-scroll libraries (tech-stack).

---

### 2.8 CLS / INP конкретные меры

**CLS < 0.1**
- Размеры всем media + aspect-ratio контейнеры  
- Sticky header: фиксированная высота + `scroll-padding-top`  
- Шрифты: ограничить веса; избегать поздней подмены крупного display  
- Skeleton/placeholder для map и accordion (без скачка высоты при hydrate)  
- Не вставлять баннеры над контентом после load  

**INP < 200 ms**
- Debounce input validation  
- `startTransition` для некритичных UI updates (меню)  
- Не вешать тяжёлые listeners на `scroll`/`mousemove` без rAF  
- Motion: `prefers-reduced-motion` (уже в globals)  
- Отложить non-critical JS (analytics)  

---

### 2.9 Performance checklist по этапам

| Этап | Perf-задачи |
|------|-------------|
| 2 | `next.config` images; font weight trim; headers cache; `public/` structure |
| 3 | Hero priority; lazy below-fold; dynamic motion; aspect ratios |
| 4 | Lazy map; form island isolation; no blocking third-party |
| 5 | Lighthouse ≥ 95; LCP/CLS/INP; bundle analyzer; Web Vitals field |

---

## 3. Файловая карта реализации

```
src/
  app/
    layout.tsx          # metadata + fonts + json-ld script
    page.tsx            # composition only
    robots.ts
    sitemap.ts
  config/
    site.ts             # name, url, contacts, social (SoT)
  seo/
    metadata.ts         # buildMetadata()
    jsonLd.ts           # localBusiness, services, faqPage
  sections/...
public/
  og/og-default.jpg
  favicon/
  images/
```

Env:
- `NEXT_PUBLIC_SITE_URL` — обязателен для canonical / OG / sitemap / JSON-LD.

---

## 4. Проверка результата (Этап 5)

### 4.1 Автоматизируемо

```bash
npm run build && npm run start
# Lighthouse CI / PageSpeed Insights на production URL
# npx unlighthouse (опционально)
```

| Gate | Порог | Fail = |
|------|-------|--------|
| Performance | ≥ 95 | блокер релиза |
| SEO | ≥ 95 | блокер |
| Best Practices | ≥ 95 | желательно |
| LCP | < 2.5s | блокер |
| CLS | < 0.1 | блокер |
| INP | < 200ms | блокер (field/lab) |

### 4.2 Ручные SEO-проверки

- [ ] Один H1, корректный outline  
- [ ] `view-source`: title, description, canonical, OG, Twitter  
- [ ] JSON-LD валиден; FAQ = видимый контент  
- [ ] `/robots.txt` и `/sitemap.xml` отдают prod URL  
- [ ] Все смысловые img имеют alt  
- [ ] Preview env = noindex  

### 4.3 Ручные Perf-проверки

- [ ] Network: LCP image early, high priority  
- [ ] Coverage: нет лишнего framer/analytics на first load  
- [ ] Mobile throttling: LCP < 2.5s  
- [ ] Interaction: меню, accordion, форма — INP ок  
- [ ] Layout shift log пуст на hero/fonts/header  

---

## 5. Риски и зависимости

| Риск | Влияние | Митигация |
|------|---------|-----------|
| Нет адреса/телефона | Слабый LocalBusiness / local SEO | Open Q #2 до Этапа 4 |
| Тяжёлые фото мастерской | LCP > 2.5s | Сжатие + AVIF + priority only hero |
| Framer на всём page | INP / TBT | Islands + dynamic import |
| Индексация preview | Дубли в выдаче | robots disallow + noindex |
| Keyword stuffing в H1/alt | Санкции / a11y | Редактура: люди > алгоритмы |

---

## 6. Итог стратегии

1. **SEO:** semantic one-page + Metadata API + OG/Twitter + JSON-LD (`LocalBusiness` + `Service` + `FAQPage`) + `robots`/`sitemap` + canonical + осмысленные alt.  
2. **Perf:** RSC-first, hero priority, lazy below-fold, image/font/bundle discipline, hints только по факту third-party.  
3. **DoD:** Lighthouse ≥ 95 · LCP < 2.5s · CLS < 0.1 · INP < 200ms — gate Этапа 5.

**Связанные документы:** ADR-004, ADR-005, `09-tech-architecture.md` §7–8, `01-application-architecture.md` (`seo/`, `sitemap.ts`, `robots.ts`), IA Stage 0.
