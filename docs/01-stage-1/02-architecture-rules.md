# 1.1 — Архитектурные правила

**Проект:** МойСервис  
**Обязательны для всех последующих этапов**

---

## 1. Правила зависимостей между слоями

### Разрешено (→)

| From | To |
|------|-----|
| `app` | `sections`, `components/layout`, `components/providers`, `seo`, `config`, `data` |
| `sections` | `features`, `components/*`, `data`, `hooks`, `lib`, `icons`, `animations`, `constants` |
| `features` | `components/*`, `schemas`, `domain`, `hooks`, `lib`, `services`*, `data`, `icons` |
| `components/*` | `lib`, `hooks` (редко), `icons`, `styles` tokens via className, `domain` types only |
| `services` | `domain`, `schemas`, `lib`, `config` (env) |
| `schemas` | `domain`, `zod` |
| `seo` | `config`, `data`, `domain` |
| `hooks` | `lib`, `constants` |
| `lib` | внешние утилиты, `types` |
| `data` | `domain` types |

\* `services` вызываются **только** из Server Actions / Route Handlers / server components — не из client components напрямую.

### Запрещено

- `components` → `sections` | `features` | `app`
- `lib` → `features` | `sections` | `components`
- `domain` → любой React/UI
- `data` → `components` / `features`
- `styles` → JS-логика
- Циклические импорты любого вида
- Cross-import секций: `sections/a` → `sections/b`

### Shared state

Для v1 глобальный клиентский store **не нужен** (см. tech stack).  
Если появится — только в `features/*` или `providers`, не в `components/ui`.

---

## 2. Правила `"use client"`

1. По умолчанию — Server Component.  
2. `"use client"` только если нужны: state, effects, browser APIs, Framer Motion, RHF.  
3. Client-границу ставить **как можно ниже** (остров внутри секции).  
4. Не помечать всю секцию client без необходимости.

---

## 3. Naming conventions

### Файлы и папки

| Тип | Convention | Пример |
|-----|------------|--------|
| React component | `PascalCase.tsx` | `ServiceCard.tsx` |
| Папка секции | `kebab-case` | `sections/about/` |
| Хук | `useCamelCase.ts` | `useLockedBody.ts` |
| Утилита | `camelCase.ts` | `cn.ts` |
| Схема Zod | `camelCase.ts` | `lead.ts` |
| Константы | `camelCase.ts` / `SCREAMING` values | `NAV_LINKS` |
| CSS | `kebab-case.css` | `tokens.css` |
| Тесты | `*.test.ts(x)` / `*.spec.ts(x)` | `lead.test.ts` |

### Компоненты

- Имя = роль, не страница: `Button`, не `LimeButtonPage`  
- Варианты через props/`cva`, не через `ButtonPrimary.tsx` + `ButtonSecondary.tsx`  
- Секция: `HeroSection` export из `sections/hero/index.tsx`  
- Feature public API: `features/lead/index.ts` (barrel только на границе feature)

### CSS / Tailwind

- Утилитарные классы + semantic tokens (`bg-brand-purple`, `text-brand-orange`)  
- Запрет сырых hex в className / style (кроме разовых SVG path)  
- Составные варианты: `cva` / `cn`

### Типы

- `PascalCase` для типов/интерфейсов: `LeadPayload`  
- Prefикс `I` не использовать  
- Zod → `z.infer<typeof leadSchema>`

---

## 4. Организация компонентов

```
components/ui      → примитивы (shadcn + кастом под DS)
components/shared  → бренд-молекулы (TrustFact, BrandWordmark)
components/layout  → Header, Footer, Container, Section
sections/*         → сборка страницы
features/*         → UI + логика сценария
```

**Правило второго использования:**  
Если молекула нужна во второй секции → вынести в `shared` или `ui`.

**shadcn:**  
Генерировать в `components/ui`. Сразу адаптировать под токены МойСервис (не оставлять default zinc/violet).

---

## 5. Организация стилей

1. **Source of Truth:** `styles/tokens.css` (= Stage 0 Design Tokens)  
2. **Bridge:** Tailwind v4 `@theme` в `styles/theme.css` / `globals.css`  
3. **Компоненты:** только token-based utility classes  
4. **Запрет:** CSS Modules параллельно Tailwind без причины; inline magic values  
5. **Responsive:** mobile-first breakpoints из токенов Stage 0  

---

## 6. Организация утилит

| Место | Что |
|-------|-----|
| `lib/cn.ts` | clsx + tailwind-merge |
| `lib/motion.ts` | duration/easing из токенов |
| `lib/utils.ts` | formatPhone и пр. |
| `hooks/` | только React hooks |
| Не создавать `helpers/`, `common/`, `misc/` | |

---

## 7. Организация типов

| Место | Что |
|-------|-----|
| `domain/**/types.ts` | предметные модели |
| `types/` | кросс-cutting (`Nullable`, props helpers) |
| `schemas/` | runtime validation (Zod) |
| Коллокация | локальные props рядом с компонентом |

Не дублировать Zod-тип и ручной interface — один source.

---

## 8. Импорты (абсолютные)

`tsconfig` paths:

```json
{
  "@/*": ["./src/*"]
}
```

Примеры:
- `@/components/ui/button`
- `@/sections/hero`
- `@/features/lead`
- `@/data/site`
- `@/schemas/lead`

Относительные — только внутри одной папки компонента (`./parts/Media`).

---

## 9. Barrel exports

| Разрешено | Запрещено |
|-----------|-----------|
| `features/*/index.ts` | Глубокий `components/index.ts` на всё |
| `sections/*/index.ts` | Реэкспорт server-only из client barrel |
| `components/ui/*` по файлу (shadcn style) | Circular barrels |

---

## 10. Server / Client boundaries для lead

```
Client: features/lead/LeadForm.tsx (RHF)
   ↓ submit
Server Action или POST /api/lead
   ↓
schemas/lead.ts (Zod)
   ↓
services/notify/*
```

Клиент **не** импортирует `services/*`.

---

## 11. Контент

- Весь пользовательский copy → `data/site.ts`  
- Секции получают данные через props или импорт `site`  
- Запрет «захардкоженных абзацев» внутри глубоких UI-атомов  

---

## 12. Accessibility & SEO (архитектурно)

- Интерактив: предпочтительно примитивы с a11y (shadcn/Radix)  
- SEO helpers только в `seo/` + `app` metadata API  
- Якоря секций: стабильные `id` из `constants` / `config`  

---

## 13. Definition of Rules Done

Правила считаются принятыми, если:
- новый код можно ревьюить чеклистом этого файла;
- слойность проверяема (ESLint `import/no-restricted-paths` — на этапе scaffold);
- naming единообразен;
- токены — единственный источник визуальных значений.
