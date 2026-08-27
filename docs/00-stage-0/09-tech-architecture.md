# Технологическая архитектура

> **Актуализация:** финальный стек и структура директорий зафиксированы на **Этапе 1** — см. `docs/01-stage-1/`. Этот документ Stage 0 сохраняется как discovery-контекст.

**Проект:** МойСервис  
**Тип:** Production-ready marketing landing (SPA/SSG one-page)

---

## 1. Архитектурные цели

- Максимальное визуальное качество при высокой производительности  
- Простая поддержка и расширение секций  
- Безопасная обработка заявок  
- SEO + a11y из коробки  
- Минимум технического долга  

---

## 2. Рекомендуемый стек (решение Tech Lead)

| Слой | Выбор | Почему |
|------|-------|--------|
| Framework | **Next.js (App Router) + React + TypeScript** | SSG/SSR, SEO, image opt, production DX |
| Styling | **CSS Modules или Tailwind + CSS variables (токены)** | Токены SoT; без styled-chaos |
| Motion | **CSS + Framer Motion (точечно)** или CSS-only reveals | Контроль perf |
| Forms | Server Action / Route Handler | Без тяжёлого BFF |
| Validation | **Zod** | Типобезопасные формы |
| Email/Notify | Локальный SMTP Mail Service / MAX Bot | Уведомление владельцу без внешнего email API |
| Analytics | YM + optional GA (consent) | РФ-контекст: Метрика приоритетнее |
| Hosting | Vercel / Cloudflare Pages / VPS Nginx | HTTPS обязателен |
| Images | `next/image` + WebP/AVIF | LCP |

### Альтернатива (если нужен максимально простой статический сайт)
Vite + React + TS + static form endpoint — допустима, если заказчик против Next.  
**Базовый выбор проекта: Next.js.**

### Что из PRD не берём как must
- Glass/Liquid Glass эффекты — **отклонено** (конфликт с рефами)  
- Полноценная CMS в v1 — опционально later (Contentlayer/MDX или headless)  

---

## 3. Высокоуровневая схема

```
Browser
  └─ Next.js Landing (SSG)
       ├─ Sections (CDD)
       ├─ Design Tokens (CSS vars)
       └─ Contact Form
            └─ POST /api/lead
                 ├─ Validate (Zod)
                 ├─ Rate limit
                 ├─ Honeypot / Turnstile (opt)
                 └─ Notify (Email/Telegram) + store (optional DB)
```

---

## 4. Структура репозитория (целевая)

```
/
  docs/00-stage-0/          # discovery artifacts
  public/
    images/
    icons/
  src/
    app/
      layout.tsx
      page.tsx
      api/lead/route.ts
    components/
      atoms/
      molecules/
      organisms/
      sections/
    styles/
      tokens.css
      globals.css
    lib/
      validation/
      analytics/
    content/
      site.ts               # texts, facts, links
  tests/
```

---

## 5. Data & Content

v1: контент в typed `content/site.ts` (или MDX).  
Позже: headless CMS без переписывания секций.

Модель Lead:
- name, phone, message?, source, createdAt, userAgent (server)

---

## 6. Security baseline

- HTTPS only  
- Input sanitization + Zod  
- Rate limiting on `/api/lead`  
- Honeypot field  
- Optional CAPTCHA (Turnstile) при спаме  
- No secrets in client bundle  
- Security headers (CSP, X-Frame-Options, Referrer-Policy)  
- Consent для аналитики при необходимости  

---

## 7. Performance budget

| Метрика | Цель |
|---------|------|
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |
| Bundle JS (initial) | минимальный; motion code-split |

Hero image: priority + sized; ниже fold — lazy.

---

## 8. SEO

- Semantic HTML sections  
- One H1 (brand/value — согласовать с Hero: sr-only или visually integrated)  
- Meta title/description Краснодар  
- Open Graph  
- JSON-LD LocalBusiness  
- sitemap + robots  

---

## 9. Accessibility

- Keyboard nav + focus rings  
- Aria for menu/accordion/form errors  
- Contrast AA  
- `prefers-reduced-motion`  
- Alt texts for proof images  

---

## 10. Environments

| Env | Назначение |
|-----|------------|
| local | dev |
| preview | PR deploys |
| production | live |

Env vars: `TELEGRAM_BOT_TOKEN`, `LEAD_NOTIFY_TO`, `TURNSTILE_SECRET`, etc.

---

## 11. Testing strategy

- Unit: validation schemas  
- Component: critical UI (Button, Form)  
- E2E: Playwright — nav anchors, form happy path  
- Manual Design QA vs refs  
- Lighthouse CI threshold  

---

## 12. Architectural decisions log (ADR short)

1. **Trust-first Hero без формы** — PRD psychology + refs  
2. **No glass** — refs override PRD glass suggestion  
3. **Next.js + TS** — production + SEO  
4. **Tokens-first CSS** — no magic values  
5. **Brand МойСервис** — PRD over ref placeholder name  
