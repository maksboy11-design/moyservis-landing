# Этап 0 — Product Discovery

**Проект:** МойСервис (Мой сервис)  
**Статус:** Анализ завершён · Код запрещён до прохождения внутреннего ревью  
**Дата:** 2026-07-29  
**Город:** Краснодар

## Source of Truth (приоритет)

1. **PRD** — продуктовые решения, IA, контент, KPI, сценарии  
2. **Дизайн-референсы** — визуальный язык, композиция, палитра, UI-паттерны  
3. **Modern best practices** — a11y, SEO, performance, security, CDD

## Артефакты

| # | Документ | Файл |
|---|----------|------|
| 1 | Product Analysis Report | `01-product-analysis-report.md` |
| 2 | UX Analysis Report | `02-ux-analysis-report.md` |
| 3 | UI Analysis Report | `03-ui-analysis-report.md` |
| 4 | Reverse Engineering Report | `04-reverse-engineering-report.md` |
| 5 | Information Architecture | `05-information-architecture.md` |
| 6 | Design System | `06-design-system.md` |
| 7 | Design Tokens | `07-design-tokens.md` |
| 8 | Component Inventory | `08-component-inventory.md` |
| 9 | Технологическая архитектура | `09-tech-architecture.md` |
| 10 | План разработки | `10-development-plan.md` |
| — | Внутреннее ревью Этапа 0 | `11-stage-0-review.md` |

## Главный принцип

> Главный продукт сайта — **доверие**, не ремонт.  
> Любое решение проходит тест: *помогает ли оно доверить устройству сервис?*

## Критическое разрешение конфликтов

| Конфликт | Решение |
|----------|---------|
| В референсах бренд «ФИКС_СЕРВИС», в PRD — «Мой сервис» | **Бренд: МойСервис / Мой сервис.** Визуальная подача бренда (оранжевый display, tab/cutout) — из референсов |
| PRD упоминает glass/liquid glass | **Не применять.** Референсы — solid high-contrast surfaces. Glass противоречит Priority 2 |
| PRD-generic Hero (H1+CTA в первом экране) vs рефы (бренд + фото + ticker) | **Композиция Hero — по референсам.** CTA выносится логично (sticky/header/после trust), без перегрузки первого viewport |
| PRD-секции шире, чем на скринах | **Полная IA по PRD**; визуальный язык секций без скринов — экстраполяция DS из референсов |

## Следующий шаг

После утверждения Этапа 0 → Этап 1: Design System в коде (токены) → scaffold → секции по плану.
