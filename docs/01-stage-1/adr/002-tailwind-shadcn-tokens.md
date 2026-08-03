# ADR-002: Tailwind v4 + tokens + shadcn

**Статус:** Accepted  
**Дата:** 2026-07-29  

**Контекст:** Stage 0 токены; рефы high-contrast; нужен CDD и скорость разработки примитивов.

**Решение:**  
- Design Tokens → CSS variables → Tailwind `@theme`  
- shadcn/ui как база примитивов, сразу перекрашенная под МойСервис  
- Запрет default shadcn «zinc/violet» look в проде  

**Последствия:** Быстрый UI scaffold; риск рассинхрона с рефами — митигируется Design QA и токенами.
