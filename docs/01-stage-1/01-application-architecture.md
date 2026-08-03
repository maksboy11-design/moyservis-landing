# 1.1 — Архитектура приложения

**Роль:** Tech Lead / Solution Architect  
**Проект:** МойСервис · Production-ready one-page landing  
**App Router:** Next.js 15

---

## 1. Цели архитектуры

| Цель | Как достигается |
|------|-----------------|
| Масштабируемость | Feature-модули + секции как независимые единицы |
| Поддерживаемость | Однонаправленные зависимости, явные правила импорта |
| Reuse | Atomic UI (`components/ui`) + shared molecules |
| Performance | SSG, `next/image`, code-split motion, минимальный client JS |
| PRD / Trust-first | Секции = вопросы пользователя (IA Stage 0) |
| Design refs | Design tokens → Tailwind theme → компоненты |
| Долгосрок | Слои позволяют CMS/CRM без переписывания UI |

---

## 2. Архитектурный стиль — выбор

### Решение: **Hybrid Architecture**

**Hybrid = Component-Driven (Atomic Design для UI) + Feature/Section-Based для продуктовых блоков + тонкий Domain слой для leads/content.**

| Подход | Берём? | Роль |
|--------|--------|------|
| Component-Driven Architecture | ✅ Ядро | Все UI через переиспользуемые компоненты |
| Atomic Design | ✅ Для `ui` / `shared` | atoms → molecules → organisms |
| Feature-Based | ✅ Для секций и form | `features/lead`, `sections/*` |
| Domain-Based | ⚠️ Частично | `domain/lead`, `domain/content` — без тяжёлого DDD |
| Чистый Domain-Only | ❌ | Overkill для лендинга |
| Только плоский Atomic | ❌ | Секции раздуются, сложно масштабировать контент |

### Почему Hybrid

1. **Лендинг = narrative из секций** (IA Stage 0). Секции — естественные feature-границы.  
2. **Рефы требуют сильной UI-системы** (radius, colors, buttons) → Atomic / CDD обязателен.  
3. **Форма заявки** — единственный «домен» с валидацией/API → отдельный feature + schemas.  
4. Чистый Feature-Based без atomic даст дубли кнопок/полей.  
5. Чистый Atomic без features размажет lead-логику по организмам.  

**Итог:** UI-библиотека снизу, продуктовые секции сверху, домен — узкий и явный.

---

## 3. Логические слои

```
┌─────────────────────────────────────────────┐
│  app/          (routing, layout, metadata)  │  Composition Root
├─────────────────────────────────────────────┤
│  sections/     (page blocks, IA mapping)    │  Product UI
├─────────────────────────────────────────────┤
│  features/     (lead form, mobile menu…)    │  Feature logic + UI
├─────────────────────────────────────────────┤
│  components/   (ui, shared, layout)         │  Reusable UI
├─────────────────────────────────────────────┤
│  domain/       (types, content models)      │  Business shapes
├─────────────────────────────────────────────┤
│  services/     (notify, analytics adapters) │  Side effects
├─────────────────────────────────────────────┤
│  lib/          (cn, motion helpers, http)   │  Technical utils
├─────────────────────────────────────────────┤
│  styles/       (tokens → Tailwind)          │  Design System
└─────────────────────────────────────────────┘
```

**Поток зависимостей (строго вниз):**  
`app` → `sections` → `features` → `components` → `domain` / `lib` / `styles`  
`features` → `services` (только через server actions / route handlers)  
**Запрещено:** `components` → `sections` | `lib` → `features` | `domain` → React components

---

## 4. Целевая структура директорий

```
/
├── docs/
│   ├── 00-stage-0/
│   └── 01-stage-1/
├── public/
│   ├── images/
│   ├── og/
│   └── favicon/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # только композиция секций
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── not-found.tsx
│   │   └── api/
│   │       └── lead/
│   │           └── route.ts         # HTTP boundary (позже)
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn + project primitives (Button, Input…)
│   │   ├── shared/                  # BrandWordmark, TrustFact, IconBadge…
│   │   ├── layout/                  # Header, Footer, Container, Section shell
│   │   └── providers/               # Motion, theme (если понадобится)
│   │
│   ├── sections/                    # 1 файл/папка = 1 IA-секция
│   │   ├── hero/
│   │   ├── services/
│   │   ├── about/
│   │   ├── advantages/
│   │   ├── process/
│   │   ├── masters/
│   │   ├── guarantees/
│   │   ├── reviews/
│   │   ├── faq/
│   │   └── contacts/
│   │
│   ├── features/
│   │   ├── lead/                    # форма, action, UI-состояния
│   │   ├── navigation/              # mobile menu, smooth anchors
│   │   └── analytics/               # event helpers (client)
│   │
│   ├── domain/
│   │   ├── lead/
│   │   │   └── types.ts
│   │   └── content/
│   │       └── types.ts
│   │
│   ├── data/                        # статический контент (site copy)
│   │   └── site.ts
│   │
│   ├── schemas/                     # Zod schemas
│   │   └── lead.ts
│   │
│   ├── services/                    # server-only adapters
│   │   ├── notify/
│   │   └── rate-limit/
│   │
│   ├── lib/
│   │   ├── cn.ts
│   │   ├── utils.ts
│   │   └── motion.ts                # shared variants (tokens-based)
│   │
│   ├── hooks/                       # client hooks (useMediaQuery, useLockedBody…)
│   ├── constants/
│   ├── config/                      # siteConfig, nav, env schema
│   ├── types/                       # глобальные вспомогательные типы
│   ├── seo/                         # json-ld builders, metadata helpers
│   ├── icons/                       # обёртки Lucide + custom SVG
│   ├── animations/                  # именованные motion presets
│   ├── assets/                      # статичные импортируемые ассеты (редко)
│   └── styles/
│       ├── tokens.css               # CSS variables = Design Tokens Stage 0
│       └── theme.css                # Tailwind @theme mapping
│
├── tests/                           # позже: unit / e2e
├── .editorconfig
├── eslint.config.mjs
├── prettier.config.mjs
├── tailwind.config.ts               # или CSS-first config v4
├── tsconfig.json
├── next.config.ts
├── components.json                  # shadcn
└── package.json
```

### Ответственность директорий

| Директория | Ответственность | Не класть сюда |
|------------|-----------------|----------------|
| `app/` | Маршруты, metadata, composition root | Бизнес-логику, разметку секций «в лоб» |
| `components/ui` | Примитивы DS / shadcn | Секции, API |
| `components/shared` | Переиспользуемые молекулы бренда | Страничные блоки |
| `components/layout` | Каркас страницы | Контент услуг |
| `sections/` | Продуктовые блоки IA | HTTP, Zod |
| `features/` | Сценарии с логикой (lead, menu) | Глобальные токены |
| `domain/` | Типы/правила предметной области | JSX |
| `data/` | Контент лендинга | Секреты |
| `schemas/` | Zod | UI |
| `services/` | I/O (email, telegram, limits) | React |
| `lib/` | Технические хелперы | Feature-знание |
| `hooks/` | Client React hooks | Server secrets |
| `seo/` | SEO helpers | UI layout |
| `styles/` | Токены и theme bridge | Component-specific hacks |
| `config/` | Публичный конфиг сайта | Runtime secrets (только schema имён env) |
| `constants/` | Магические константы домена UI | Секреты |
| `animations/` | Presets Framer | Бизнес-условия |
| `icons/` | Иконки | Растровые фото |

---

## 5. Mapping IA → sections

| IA ID (Stage 0) | `sections/*` |
|-----------------|--------------|
| hero + ticker | `sections/hero` |
| services | `sections/services` |
| about | `sections/about` |
| advantages | `sections/advantages` |
| process | `sections/process` |
| masters | `sections/masters` |
| guarantees | `sections/guarantees` |
| reviews | `sections/reviews` |
| faq | `sections/faq` |
| contacts | `sections/contacts` |
| header/footer | `components/layout` |

`app/page.tsx` только импортирует и упорядочивает секции.

---

## 6. Runtime модель

```
SSG page (Server Components by default)
  ├─ layout: fonts, metadata, providers
  ├─ sections: mostly Server Components
  │    └─ interactive islands: "use client"
  │         (menu, form, accordion, carousel, motion)
  └─ api/lead: Route Handler (POST)
```

**Принцип:** минимум `"use client"`. Motion и формы — островки.

---

## 7. Definition of Architecture Done

- [x] Нет циклических зависимостей (правила слоёв зафиксированы)  
- [x] Каждый модуль — одна ответственность  
- [x] Структура масштабируема (новые секции = новая папка)  
- [x] Компоненты переиспользуемы (`ui` + `shared`)  
- [x] Расширение (CMS/CRM) не ломает UI-слои  
- [x] Соответствует Next.js App Router  
- [x] Соответствует Stage 0 IA / DS / CDD inventory  

---

## 8. Риски и митигация

| Риск | Митигация |
|------|-----------|
| shadcn defaults ≠ рефы | Токены + кастом theme; shadcn только как база примитивов |
| Framer раздует bundle | Lazy motion / islands; CSS для micro-hover |
| Секции раздуваются | Выносить молекулы в `shared` при втором использовании |
| Контент хардкод в JSX | Весь copy в `data/site.ts` |

---

## 9. Связь со Stage 0

- Design Tokens → `styles/tokens.css` + Tailwind `@theme`  
- Component Inventory → `components/ui|shared|layout` + `sections`  
- Trust-first Hero → `sections/hero` без form feature  
- Lead → `features/lead` + `schemas` + `services`  
