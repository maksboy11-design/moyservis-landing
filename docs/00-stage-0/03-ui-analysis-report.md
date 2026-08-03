# UI Analysis Report

**Проект:** МойСервис  
**Источники:** 4 дизайн-референса (Desktop Hero, Mobile Hero, Desktop Services+About, Mobile Services)

---

## 1. Визуальная концепция

**Характер:** bold tech · high-contrast · energetic · modern service  
**Не:** «пыльная мастерская», корпоративный синий, glassmorphism, purple-on-white SaaS-клише в смысле generic AI look — здесь purple **осознанный бренд-фон Hero**, закреплённый референсами.

### Композиционные законы
- Крупные «squircle» контейнеры (radius 32–80px+)
- Чередование цветовых плоскостей: Purple → Lime → Dark → White → Dark
- Фото реального ремонта = главный trust-визуал
- Заголовки UPPERCASE / body lowercase (стилистический паттерн рефов)
- Минимум декоративных оверлеев; бренд-tab и маленький label допустимы как в рефах

---

## 2. Color System (из рефов)

| Роль | Токен-имя | Значение (целевое) | Где |
|------|-----------|-------------------|-----|
| Hero / brand plane | `color.brand.purple` | `#6B2CF5` (±) | Hero bg |
| Action / ticker | `color.accent.lime` | `#C8FF00` | Banner, CTA |
| Brand wordmark | `color.brand.orange` | `#FF4D00` | МойСервис |
| Page dark | `color.bg.dark` | `#121212` | Services, footer zones |
| Card dark | `color.surface.dark` | `#232323` | Service cards |
| Surface light | `color.surface.light` | `#FFFFFF` | About panel, frames |
| Text on dark | `color.text.inverse` | `#FFFFFF` | Headings on dark |
| Text on light | `color.text.primary` | `#111111` | About body |
| Text muted | `color.text.muted` | `#C8C8C8` | Body on dark |
| Icon circle | `color.brand.purple` | `#6B2CF5` | Trust icons |

Точные hex фиксируются в `07-design-tokens.md` после калибровки по PNG.

---

## 3. Typography

**Семья:** геометрический grotesk, expressive (не Inter/Roboto/Arial как primary).  
Кандидаты для реализации: **Unbounded / Manrope / Golos Text / Geologica** — финальный выбор в Design System с учётом кириллицы и лицензии.

| Уровень | Case | Weight | Назначение |
|---------|------|--------|------------|
| Display Brand | UPPER | ExtraBold 800 | МойСервис |
| Section H2 | UPPER | Bold 700 | НАШИ УСЛУГИ, О НАС |
| Card H3 | UPPER | Bold 700 | Названия услуг |
| Body | lower | Regular 400 | Описания |
| Body emphasis | lower | Bold 700 | Ключевые фразы |
| Nav | UPPER | Medium 500 | Меню |
| Ticker | UPPER | SemiBold 600 | Lime banner |
| Caption | lower | Regular 400 | «ремонт цифровой техники» |
| Button | UPPER | Bold 700 | CTA |

**Ритм:** крупный line-height для body (1.5–1.65), плотнее для display (1.05–1.15).

---

## 4. Layout & Grid

### Desktop
- Max content width: ~1200–1320px  
- Outer page padding: 24–40px  
- Hero: full-bleed purple plane внутри page radius / outer frame  
- Services: 3 колонки, gutter 20–28px  
- About: 3 зоны (текст | изображение-overlap | trust+CTA) в белой панели

### Mobile
- 1 колонка  
- Services: stack cards  
- Hero: hamburger, центральный frame, vertical brand stack  
- About: stack → image → trust list → CTA  

### Breakpoints (целевые)
| Token | px |
|-------|-----|
| `bp.sm` | 480 |
| `bp.md` | 768 |
| `bp.lg` | 1024 |
| `bp.xl` | 1280 |
| `bp.2xl` | 1440 |

---

## 5. Radius & Shape Language

| Token | px | Применение |
|-------|-----|------------|
| `radius.xs` | 8 | Мелкие image insets |
| `radius.sm` | 12–16 | Фото в карточках |
| `radius.md` | 24 | Внутренние панели |
| `radius.lg` | 32–40 | Service cards, About panel |
| `radius.xl` | 48–64 | Hero media frame |
| `radius.2xl` | 72–96 | Outer hero shell (desktop) |
| `radius.pill` | 999 | Primary CTA |

**Характерная деталь:** asymmetrical cutout / brand tab на Hero frame (white notch с wordmark).

---

## 6. Elevation & Borders

- Shadows: минимальные / мягкие (dark theme не требует тяжёлых теней)
- Карточки: отличие через surface lift (`#121212` → `#232323`), не через multi-layer shadow
- Hero media: толстая белая «рамка» (border 8–16px visual)
- Accent line: тонкая lime вертикаль справа (desktop) — brand accent / optional scroll cue

---

## 7. Components (UI-состояния)

### Buttons
- **Primary:** lime bg, black text, pill, UPPER  
- Hover: slight scale 1.02 / brightness  
- Active: scale 0.98  
- Focus: visible ring (purple или lime contrast)  
- Disabled: opacity 0.4, no pointer  

### Cards (Services)
- Dark surface, radius.lg, padding 24–32  
- Image radius.sm  
- Alternating image/text order (card 2 inverted)  
- Hover: subtle translateY(-2px) + surface lighten  

### Nav
- Desktop: 3 links spread (услуги / о нас / контакты)  
- Mobile: hamburger → drawer/fullscreen menu  

### Trust list
- Purple circular icon + white glyph + uppercase label  

### Forms (экстраполяция DS)
- Light или dark surface по секции  
- Large inputs, radius.md  
- Labels lowercase или sentence  
- Error: orange/red semantic (не ломая бренд)

---

## 8. Motion (UI)

| Тип | Duration | Easing | Где |
|-----|----------|--------|-----|
| Micro | 120–200ms | ease-out | hover, press |
| UI | 300–450ms | cubic-bezier | menu, accordion |
| Reveal | 500–700ms | ease-out | section enter |
| Hero enter | 600–900ms | ease-out | first paint sequence |

**Обязательный минимум (2–3 intentional motions):**
1. Hero frame + brand reveal  
2. Service cards stagger on scroll  
3. CTA hover / About panel enter  

`prefers-reduced-motion`: отключать decorative reveals.

---

## 9. Imagery Rules

- Реальные «hands-on» фото ремонта, не stock-generic  
- PC tower с RGB — якорь About (overlap контейнера)  
- GPU boxes / склад — доказательство комплектующих  
- Оптимизация: WebP/AVIF, srcset, lazy below fold  

---

## 10. Design QA checklist (UI)

- [ ] Палитра = рефы (purple/lime/orange/dark/white)  
- [ ] Нет glassmorphism  
- [ ] Brand orange читается как hero-level signal  
- [ ] Body lowercase на dark/light как в рефах  
- [ ] Radius система консистентна  
- [ ] 3-col services на desktop, stack на mobile  
- [ ] About image overlap сохранён  
- [ ] Нет «карточек ради карточек» вне интерактивных/контентных контейнеров рефов  
