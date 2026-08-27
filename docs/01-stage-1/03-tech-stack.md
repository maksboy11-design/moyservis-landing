# 1.2 — Технологический стек

**Роль:** Tech Lead  
**Проект:** МойСервис  
**Статус:** Зафиксирован окончательно для v1

---

## 1. Обязательный стек (утверждён)

| Технология | Версия / режим | Назначение |
|------------|----------------|------------|
| **Next.js** | 15 · App Router | SSG/SSR, routing, Metadata, Route Handlers, `next/image` |
| **React** | 19 | UI runtime |
| **TypeScript** | 5.x strict | Типобезопасность |
| **Tailwind CSS** | v4 | Utility styling + `@theme` ↔ design tokens |
| **shadcn/ui** | актуальной схемы | Примитивы (Button, Input, Checkbox, Accordion…) на Radix |
| **Framer Motion** | latest compatible | Reveal / menu / intentional motion (Stage 0) |
| **Lucide React** | latest | Иконки (trust badges, UI) |
| **React Hook Form** | latest | Форма заявки / звонка |
| **Zod** | latest | Валидация lead + env |
| **next/image** | built-in | LCP, WebP/AVIF, sizing |
| **ESLint** | flat config + next | Качество кода |
| **Prettier** | + tailwind plugin | Форматирование |

### Обязательные сопутствующие (технически нужны стеку)

| Пакет | Зачем |
|-------|-------|
| `class-variance-authority` | variants для ui (паттерн shadcn) |
| `clsx` + `tailwind-merge` | `cn()` |
| `@hookform/resolvers` | Zod ↔ RHF |
| `radix-ui` primitives (через shadcn) | a11y accordion/dialog/checkbox |

---

## 2. Соответствие требованиям проекта

| Требование | Чем закрывается |
|------------|-----------------|
| Production-ready landing | Next 15 SSG + TS strict |
| Design tokens / refs | Tailwind v4 `@theme` ← `tokens.css` |
| CDD / Atomic | shadcn `components/ui` + shared |
| Motion 2–3 intentional | Framer Motion islands |
| Trust photography | `next/image` |
| Форма заявки | RHF + Zod + Route Handler/Action |
| A11y | Radix via shadcn + focus tokens |
| SEO | Metadata API (не next-seo) |
| Maintainability | ESLint import boundaries + Prettier |

---

## 3. Опциональные технологии — решения

### Zustand — ❌ НЕ подключаем в v1

**Почему:** нет глобального клиентского состояния.  
Меню / accordion / form — локальный state.  
Добавление Zustand = лишняя зависимость без use-case.

**Когда пересмотреть:** корзина, multi-step wizard, сложный UI-state cross-sections.

---

### TanStack Query — ❌ НЕ подключаем в v1

**Почему:** нет клиентского fetching списков/ресурсов.  
Контент — статический `data/site.ts`. Lead — mutation через Action/POST.

**Когда пересмотреть:** личный кабинет статуса ремонта, CMS remote content на клиенте.

---

### Embla Carousel — ✅ УСЛОВНО (подключить при реализации Reviews)

**Почему:** в PRD отзывы могут быть слайдером; Embla лёгкий, headless, хорошо с a11y-обёрткой.

**Правило:** не ставить в scaffold «на всякий случай».  
Добавить в момент секции Reviews, если нужен carousel (не статичный список).

**Альтернатива:** CSS scroll-snap без библиотеки — допустима, если ≤3–4 отзыва.

---

### Lenis — ❌ НЕ подключаем

**Почему:** smooth scroll library даёт риск конфликтов с якорями, a11y (scroll hijack), perf на mobile.  
Native `scroll-behavior: smooth` + offset header достаточно для trust-landing.

**Когда пересмотреть:** отдельный art-direction заказчика на «luxury scroll» (сейчас рефы этого не требуют).

---

### GSAP — ❌ НЕ подключаем

**Почему:** Framer Motion покрывает reveal/hover/menu. GSAP тяжелее по весу/API и избыточен для лендинга без complex timeline storytelling.

**Когда пересмотреть:** сложный timeline Hero с scrubbing (рефы не требуют).

---

### next-seo — ❌ · Metadata API — ✅

**Почему:** Next.js 15 App Router имеет первоклассный `metadata` / `generateMetadata`.  
`next-seo` дублирует и хуже стыкуется с App Router.

Используем: `app/layout.tsx` metadata + `seo/` helpers (JSON-LD LocalBusiness).

---

### React Aria — ❌ как отдельная библиотека в v1

**Почему:** shadcn/Radix уже закрывает dialog, accordion, checkbox, focus.  
Два a11y-стека (Radix + React Aria) = конфликт паттернов и bundle.

**Когда пересмотреть:** кастомный combobox/date picker вне Radix.

**Допустимо:** точечные хуки/паттерны вручную + ESLint jsx-a11y.

---

## 4. Дополнительный tooling (рекомендован, не раздувает runtime)

| Инструмент | Решение | Зачем |
|------------|---------|-------|
| `prettier-plugin-tailwindcss` | ✅ | Порядок классов |
| `eslint-plugin-import` / boundaries | ✅ на scaffold | Enforce layer rules |
| Husky + lint-staged | ⚠️ optional | Если команда >1 |
| Playwright | ✅ на QA этапе | E2E form/nav |
| Vitest | ✅ на QA/foundation | Zod + utils |
| `@t3-oss/env-nextjs` или zod env | ✅ | Безопасный env |

---

## 5. Backend-минимум v1

| Элемент | Решение |
|---------|---------|
| Lead intake | Route Handler `POST /api/lead` или Server Action |
| Validation | Zod (`schemas/lead`) |
| Notify | MAX Bot и локальный SMTP Mail Service |
| Persistence | SQLite WAL для персистентной очереди писем |
| Spam | honeypot + rate limit; Turnstile — if needed |
| CMS | нет в v1 |

---

## 6. Hosting / Runtime

| | |
|--|--|
| Target | Node на Vercel / Cloudflare adapter / VPS |
| HTTPS | обязательно |
| Node | LTS актуальный под Next 15 |

---

## 7. Версионирование политики зависимостей

1. Только поддерживаемые major (не legacy Next Pages как основа).  
2. Не добавлять библиотеку без use-case в текущем этапе.  
3. Каждая новая зависимость — ADR в `docs/01-stage-1/adr/`.  
4. Запрет: jQuery, Bootstrap, Moment, axios-если-достаточно-fetch, UI-kit параллельно shadcn.

---

## 8. Стек vs Stage 0

| Stage 0 рекомендация | Stage 1 финал |
|----------------------|---------------|
| Next.js + TS | ✅ Next 15 + React 19 |
| CSS Modules или Tailwind + tokens | ✅ **Tailwind v4** + tokens |
| Framer точечно | ✅ Framer Motion |
| Zod | ✅ |
| Forms | ✅ RHF + Zod (уточнение) |
| shadcn | ✅ добавлен как UI foundation |
| Glass effects | ❌ по-прежнему запрещены |

---

## 9. Definition of Stack Done

- [x] Стек актуален и поддерживается  
- [x] Нет устаревших библиотек в плане  
- [x] Нет лишних зависимостей (Zustand/Query/Lenis/GSAP/next-seo/React Aria — отклонены)  
- [x] Embla — только by need  
- [x] Аргументация по каждому optional  
- [x] Соответствует PRD (perf, forms, SEO, a11y) и рефам (токены, motion)  

---

## 10. Итоговая матрица

| Lib | v1 |
|-----|-----|
| Next.js 15 | ✅ |
| React 19 | ✅ |
| TypeScript | ✅ |
| Tailwind CSS v4 | ✅ |
| shadcn/ui | ✅ |
| Framer Motion | ✅ |
| Lucide React | ✅ |
| React Hook Form | ✅ |
| Zod | ✅ |
| next/image | ✅ |
| ESLint + Prettier | ✅ |
| Metadata API | ✅ |
| Embla | ⏳ conditional |
| Zustand | ❌ |
| TanStack Query | ❌ |
| Lenis | ❌ |
| GSAP | ❌ |
| next-seo | ❌ |
| React Aria | ❌ |
