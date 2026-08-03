# Design System — МойСервис

**Версия:** 0.1 (Stage 0)  
**Характер:** High-contrast tech service · Purple / Lime / Orange / Dark  

---

## 1. Foundations

### Brand
- **Name:** МойСервис  
- **Display:** МОЙСЕРВИС или МойСервис в wordmark-стиле рефа (orange, extrabold, tracking tight)  
- **Tagline:** ремонт цифровой техники  
- **Tone:** честный, спокойный, компетентный, без давления  

### Visual pillars
1. Proof photography  
2. Color banding (purple → lime → dark → white)  
3. Squircle geometry  
4. Brand orange as primary identity signal  
5. Lime as action  

---

## 2. Color roles

| Role | Usage |
|------|--------|
| Purple | Hero plane, icon badges, brand energy |
| Lime | Ticker, primary CTA, accent line |
| Orange | Brand wordmark, About H2, emphasis links |
| Dark `#121212` | Main canvas after hero |
| Dark elevated `#232323` | Cards |
| White | Frames, About panel, contrast islands |
| Black text | On lime / on white |
| White text | On dark / on purple |

**Semantic (forms/system):**
- Success: green compatible with lime family  
- Error: `#E53935`  
- Warning: orange brand family  

---

## 3. Typography system

| Token | Size desktop | Size mobile | Weight | LH |
|-------|--------------|-------------|--------|-----|
| `font.brand` | 40–56 | 28–36 | 800 | 1.05 |
| `font.h1` | 40–48 | 28–32 | 700 | 1.1 |
| `font.h2` | 32–40 | 24–28 | 700 | 1.15 |
| `font.h3` | 20–24 | 18–20 | 700 | 1.2 |
| `font.body` | 16–18 | 16 | 400 | 1.55 |
| `font.small` | 13–14 | 12–13 | 400 | 1.4 |
| `font.nav` | 14–16 | 14 | 500 | 1.2 |
| `font.button` | 14–16 | 14 | 700 | 1 |

**Rules**
- Headings: UPPERCASE  
- Body: lowercase (стилистика рефов)  
- Max line length body: ~55–70 ch  
- No Inter/Roboto/Arial as primary brand font  

---

## 4. Spacing scale (4-based)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`

Section padding Y: `64–96` desktop / `40–64` mobile  
Card padding: `24–36`

---

## 5. Radius scale

См. токены `radius.*` в `07-design-tokens.md`.  
Закон: чем крупнее контейнер-плоскость, тем больше radius.

---

## 6. Component principles

1. Компоненты только на токенах — никаких magic values в UI  
2. Переиспользуемость: Button, Card, Section, Container, IconBadge, Input  
3. Состояния: default / hover / active / focus / disabled / loading  
4. Cards — для services и интерактивных групп; не плодить «карточки ради эстетики»  
5. Один primary button style на странице  

---

## 7. Iconography

- Style: outline / simple glyph, white on purple circle  
- Size circle: 40–48px  
- Stroke: 1.5–2px  
- Набор: star/medal, wrench, chip, phone, map, check  

---

## 8. Imagery guidelines

| Тип | Применение |
|-----|------------|
| Process close-up | Hero, service cards |
| Hardware stock | Parts proof |
| PC build | About overlap |
| Team (later) | Masters |

Aspect ratios: hero ~16:10 / 4:3; cards ~16:10; about object free PNG.

---

## 9. Motion guidelines

- Functional > decorative  
- Shared easing curve  
- Respect `prefers-reduced-motion`  
- Max simultaneous animated elements: modest (не «цирк»)  

---

## 10. Content patterns

| Pattern | Пример |
|---------|--------|
| Claim + Proof | «Свой склад» + фото коробок GPU |
| Fact row | Icon + UPPER label |
| Process step | Number + title + short lower body |
| Review | Name + text + optional rating |

---

## 11. Do / Don't

### Do
- Следовать рефам Hero/Services/About  
- Использовать реальные «грязные руки мастера» фото  
- Держать высокий контраст  

### Don't
- Glassmorphism / neon glow spam  
- Менять палитру  
- Пихать CTA-форму в Hero  
- Inter + purple gradient SaaS look  
- Cream + terracotta + serif  
- Broadsheet dense columns  
