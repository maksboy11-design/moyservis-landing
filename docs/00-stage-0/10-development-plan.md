# План разработки

**Проект:** МойСервис  
**Правило:** следующий этап только после закрытия предыдущего.

---

## Этап 0 — Product Discovery ✅ (текущий)

**Выход:** полный пакет `docs/00-stage-0/*` + внутреннее ревью.

**Критерий готовности:** все 10 артефактов + review PASS.

---

## Этап 1 — Project Foundation & Solution Architecture ✅

Документы: `docs/01-stage-1/*` (архитектура Hybrid, правила слоёв, стек Next 15 / TW v4 / shadcn, ADR).

**Код на Этапе 1 не пишется.**

## Этап 1b / 2 — Foundation in code (после PASS Stage 1)

1. Scaffold Next.js 15 + React 19 + TS  
2. Tailwind v4 + токены (`tokens.css` → `@theme`)  
3. shadcn init + ESLint import boundaries + Prettier  
4. Каркас директорий по Stage 1  
5. Базовые атомы только после явного старта UI-этапа  

**Definition of Done:** smoke build green, токены подключены, секции ещё пустые/заглушки по ТЗ этапа.

---

## Этап 2 — Core sections (visual SoT)

Порядок строго по IA и рефам:

1. Header + MobileMenu  
2. HeroSection + HeroFrame + Brand  
3. TickerBar  
4. ServicesSection (3 cards + rhythm)  
5. AboutSection (overlap PC + trust + CTA)  

**DoD:** Desktop + Mobile совпадают с рефами по композиции (Design QA).

---

## Этап 3 — Trust narrative sections

1. Advantages  
2. Process  
3. Masters  
4. Guarantees  
5. Reviews  
6. FAQ  

**DoD:** каждый страх PRD закрыт; единый DS; motion reveals.

---

## Этап 4 — Conversion

1. Contacts + Form  
2. API lead + validation + notify  
3. Success/error UX  
4. Channels VK/MAX/phone/map  
5. Footer  

**DoD:** заявка проходит E2E; spam baseline.

---

## Этап 5 — Quality gates

1. Code Review  
2. Debug / cross-browser  
3. Security Review  
4. QA (func + a11y + responsive)  
5. Design QA vs refs  
6. Performance + SEO audit  
7. Final Production Ready checklist  

---

## Параллельные треки (не ломают последовательность UI)

| Трек | Когда |
|------|-------|
| Контент/копирайт | с Этапа 1 |
| Фото/ассеты | с Этапа 1–2 |
| Аналитика events map | Этап 4 |
| Legal (consent, privacy) | Этап 4–5 |

---

## Вехи (milestone)

| M | Результат |
|---|-----------|
| M0 | Discovery approved |
| M1 | Design system in code |
| M2 | Hero+Services+About = refs |
| M3 | Full page scroll narrative |
| M4 | Leads working |
| M5 | Production Ready |

---

## Риски плана

| Риск | План |
|------|------|
| Нет финальных фото | временные high-quality placeholders с пометкой replace |
| Спам заявок | Turnstile early |
| Расхождение PRD↔refs | ADR уже зафиксированы в Stage 0 |
| Scope creep | Out of scope v1 жёстко |

---

## Следующее действие после approve

Пользователь подтверждает Stage 0 → начинаем **Этап 1 (Foundation)** — первая строка кода.
