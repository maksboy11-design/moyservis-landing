# ADR-005: Server Components default + client islands

**Статус:** Accepted  
**Дата:** 2026-07-29  

**Решение:** Секции — Server Components; `"use client"` только для menu, form, accordion, motion, carousel.

**Последствия:** Лучше TTFB/LCP; строже границы импортов server-only services.
