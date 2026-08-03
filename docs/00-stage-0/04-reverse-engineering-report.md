# Reverse Engineering Report

**Проект:** МойСервис  
**Входные референсы:** 4 PNG (desktop hero, mobile hero, desktop mid, mobile services)

Цель: извлечь **систему**, не копировать пиксель-в-пиксель.

---

## 1. Карта экранов

| ID | Экран | Viewport | Содержание |
|----|-------|----------|------------|
| R1 | Hero + ticker + start Services | Desktop | Purple hero, media frame, brand tab, nav, lime ticker |
| R2 | Hero + ticker + Services title | Mobile | Hamburger, frame, vertical brand, lime strip |
| R3 | Services + About | Desktop | 3 service cards, white About panel, PC overlap, trust, CTA |
| R4 | Services stack | Mobile | Vertical cards, lime edge accent, About tab transition |

---

## 2. R1 — Desktop Hero (детальный разбор)

### Композиция
```
┌─────────────────────────────────────────────┐
│  PURPLE PLANE (large outer radius)          │
│   NAV: Услуги -------- О нас -------- Контакты │
│   ┌─────────────────────────────────────┐   │
│   │ WHITE FRAME / MEDIA                 │   │
│   │  [label top-right]                  │   │
│   │  photo: hands + motherboard         │   │
│   │  [BRAND TAB bottom]  ✦              │   │
│   └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  LIME TICKER (full width, uppercase)        │
├─────────────────────────────────────────────┤
│  DARK: НАШИ УСЛУГИ (section start)          │
└─────────────────────────────────────────────┘
```

### Акценты
1. Центральное фото ремонта (trust)  
2. Оранжевый бренд на белом tab  
3. Purple как «обёртка доверия/энергии»  
4. Lime как информационный мост к услугам  

### Что НЕ в первом viewport (по рефу)
- Длинный H1 поверх фото  
- Статистика / адрес / прайс  
- Floating promo badges (кроме маленького label + brand tab)  
- Primary form  

### UX-смысл
«Это современный сервис, который реально чинит технику» за <3 секунды.

---

## 3. R2 — Mobile Hero

### Отличия от desktop
- Hamburger вместо spread-nav  
- Brand wordmark **повторяется вертикально** (6 строк) — ритм/паттерн  
- Label «ремонт цифровой техники» top-right внутри frame  
- Directional cue (arrow) возможен  
- Outer shell более «телефонный» radius  

### Сохранить при адаптации бренда
Повторяющийся orange wordmark **МойСервис** (не ФИКС_СЕРВИС) как графический приём mobile hero.

---

## 4. R3 — Desktop Services + About

### Services
- Title centered UPPER white  
- 3 dark cards, large radius  
- **Visual rhythm:** Card1 image→text · Card2 text→image · Card3 image→text  
- Content (из рефа, правим опечатки):
  1. Ремонт мобильной техники  
  2. Ремонт компьютеров и другой цифровой техники  
  3. Комплектующие для цифровой техники  

### About
- White large rounded panel на dark bg  
- Left: orange «О НАС» + lowercase body  
- Center: gaming PC image **overlapping** panel edge (z-index depth)  
- Right: 3 trust rows (purple icon circles) + lime pill CTA «СВЯЖИТЕСЬ С НАМИ»  

### Trust facts (реф → продукт)
1. Работаем с 2017 года  
2. Более 600 единиц отремонтированной техники  
3. Собственные запасы комплектующих  

### Исправления контента (Design/Content QA)
- «насможно» → «нас можно»  
- «отремантированной» → «отремонтированной»  

---

## 5. R4 — Mobile Services

- Single column cards  
- Alternating image placement сохраняет ритм  
- Lime vertical accent на правом крае  
- Переход к About через белый tab «О НАС» (orange text)  

---

## 6. Извлечённая дизайн-система (ядро)

### Pattern library из рефов
1. **Color banding** — секции = цветовые плоскости  
2. **Squircle containers** — дружелюбный tech  
3. **Proof photography** — руки, железо, склад  
4. **Brand orange as signal** — wordmark сильнее любого H1  
5. **Lime as action/info** — ticker + CTA  
6. **Inverted card rhythm** — против монотонности  
7. **Overlap hero object** — PC в About  
8. **Lowercase body** — «живой» тон  

### Чего нет в рефах, но есть в PRD
Процесс ремонта, гарантия, отзывы, FAQ, мастера, форма, карта — **проектируются в той же DS**, без нового стиля.

---

## 7. Grid reverse-engineering (оценка)

| Параметр | Desktop | Mobile |
|----------|---------|--------|
| Columns | 12 conceptual / 3 content | 4 / 1 content |
| Gutter | 20–28px | 16–20px |
| Section padding Y | 64–96px | 40–64px |
| Card padding | 28–36px | 20–28px |
| Hero media inset | 40–64px from purple | 20–28px |

---

## 8. Motion reverse (implied)

Рефы статичны, но композиция подразумевает:
- Soft reveal of purple → media → brand  
- Scroll transition purple→lime→dark  
- Card hover lift  
- About PC slight float/parallax (subtle)  

Не подразумевает: particle systems, glow spam, infinite marquee distraction (ticker — да, но спокойный).

---

## 9. Accessibility notes from reverse

| Риск | Решение |
|------|---------|
| Orange on white — OK contrast | Verify WCAG AA |
| Lime on black text — OK | Keep black text on lime |
| White on #232323 — OK | Body ≥ 16px |
| Vertical repeated brand — decorative | aria-hidden на дубликатах, один sr-only brand |
| Hamburger | aria-expanded, focus trap |

---

## 10. Вывод Reverse Engineering

Референсы задают **узнаваемый high-energy dark+neon service brand**, где доверие строится фотографией процесса и фактами, а не «серым корпоративом».

Реализация должна:
1. Воспроизвести композицию Hero / Services / About 1:1 по структуре  
2. Заменить бренд на МойСервис  
3. Экстраполировать DS на остальные PRD-секции  
4. Не добавлять glass, purple SaaS gradients, cream+serif, broadsheet  
