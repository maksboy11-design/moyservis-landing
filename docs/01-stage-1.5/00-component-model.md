# Этап 1.5 — Компонентная модель

**Проект:** МойСервис  
**Роль:** Senior Frontend Engineer  
**Статус:** Проектирование · код компонентов не реализуется  
**База:** Stage 0 inventory · Stage 1 architecture · Design Tokens  
**Дата:** 2026-07-29

---

## 0. Принципы модели

1. **Одна ответственность** — компонент решает одну UI/продуктовую задачу.  
2. **Только токены** — цвета, spacing, radius, motion через DS.  
3. **Variants через `cva` / props**, не через отдельные файлы `ButtonPrimary`.  
4. **Server by default**; `"use client"` только для state / RHF / motion / dialog.  
5. **Правило второго использования** — молекула во 2-й секции → `shared` / `ui`.  
6. **Секции не импортируют секции** — композиция только в `app/page.tsx`.

### Слои ↔ папки

| Категория | Папка |
|-----------|--------|
| Layout | `components/layout` |
| Navigation | `components/layout` + `features/mobile-menu` |
| UI (atoms/molecules) | `components/ui` + `components/shared` |
| Landing Sections | `sections/*` |
| CTA / Form logic | `features/lead` + `ui` Button |

---

## 1. Layout

### 1.1 `Header`

| | |
|--|--|
| **Путь** | `components/layout/Header.tsx` |
| **Ответственность** | Sticky top bar: nav + CTA + mobile trigger |
| **Props** | `navItems?: NavItem[]`; `ctaLabel?: string`; `ctaHref?: string`; `className?: string` |
| **Variants** | `transparent` (over hero purple) · `solid` (after scroll / dark sections) |
| **Состояния** | default · scrolled · menuOpen (delegate to MobileMenu) |
| **Reuse** | 1× на странице; CTA → `Button` |
| **Adaptive** | Desktop: inline `NavLinks` + CTA. Mobile (`<lg`): `MenuToggle` only + optional phone |
| **Client?** | partial — scroll listener / menu state в острове |

### 1.2 `Footer`

| | |
|--|--|
| **Путь** | `components/layout/Footer.tsx` |
| **Ответственность** | Юр.инфо, вторичные ссылки, каналы |
| **Props** | `navItems?`; `legal?: { privacyHref; termsHref }`; `showChannels?: boolean` |
| **Variants** | default (dark surface) |
| **Состояния** | — |
| **Reuse** | 1×; `ChannelLink`, `NavLink` |
| **Adaptive** | stack mobile → 2–3 col desktop |
| **Client?** | no |

### 1.3 `Container`

| | |
|--|--|
| **Путь** | `components/layout/Container.tsx` |
| **Ответственность** | max-width + horizontal gutters |
| **Props** | `as?: ElementType`; `size?: "sm"\|"md"\|"lg"\|"xl"\|"2xl"`; `className?`; `children` |
| **Variants** | size → `--container-*` tokens |
| **Состояния** | — |
| **Reuse** | все секции |
| **Adaptive** | gutters via `--gutter` token |
| **Client?** | no |

### 1.4 `Section`

| | |
|--|--|
| **Путь** | `components/layout/Section.tsx` |
| **Ответственность** | якорь, вертикальный ритм, surface context |
| **Props** | `id?: string`; `surface?: "dark"\|"light"\|"hero"\|"none"`; `paddingY?: "default"\|"tight"\|"none"`; `className?`; `children`; `ariaLabelledby?` |
| **Variants** | surface → `data-surface` / bg-hero |
| **Состояния** | — |
| **Reuse** | обёртка каждой landing section |
| **Adaptive** | `--section-y` responsive |
| **Client?** | no |

### 1.5 `Grid`

| | |
|--|--|
| **Путь** | `components/layout/Grid.tsx` |
| **Ответственность** | 12-col / auto-fit layout primitive |
| **Props** | `cols?: 1\|2\|3\|4\|12`; `gap?: "sm"\|"md"\|"lg"`; `className?`; `children` |
| **Variants** | cols + gap → token gaps |
| **Состояния** | — |
| **Reuse** | Services, Advantages, Masters |
| **Adaptive** | 1 → 2 → 3 cols по breakpoints |
| **Client?** | no |

---

## 2. Navigation

### 2.1 `Navbar` (= desktop nav region inside Header)

| | |
|--|--|
| **Путь** | `components/layout/Navbar.tsx` |
| **Ответственность** | горизонтальный список якорей |
| **Props** | `items: NavItem[]`; `activeHref?: string` |
| **Variants** | onPurple · onDark |
| **Состояния** | default · active (current hash) |
| **Reuse** | Header only |
| **Adaptive** | hidden `<lg` |
| **Client?** | optional (hash sync) |

### 2.2 `MobileMenu`

| | |
|--|--|
| **Путь** | `features/mobile-menu/MobileMenu.tsx` |
| **Ответственность** | drawer / overlay с якорями + CTA |
| **Props** | `open: boolean`; `onOpenChange`; `items`; `cta?` |
| **Variants** | slide-right overlay |
| **Состояния** | closed · open · closing (focus trap, body lock) |
| **Reuse** | Header |
| **Adaptive** | mobile/tablet only |
| **Client?** | **yes** |

### 2.3 `NavLink`

| | |
|--|--|
| **Путь** | `components/shared/NavLink.tsx` |
| **Ответственность** | один якорный / внешний линк навигации |
| **Props** | `href`; `children`; `active?`; `onNavigate?`; `variant?: "nav"\|"footer"\|"mobile"` |
| **Variants** | nav · footer · mobile |
| **Состояния** | default · hover · focus · active |
| **Reuse** | Header, Footer, MobileMenu |
| **Adaptive** | typography via variant |
| **Client?** | no (or yes if closes menu on click via callback) |

### 2.4 `MenuToggle`

| | |
|--|--|
| **Путь** | `components/shared/MenuToggle.tsx` |
| **Ответственность** | кнопка открыть/закрыть меню |
| **Props** | `open`; `onPressed`; `labelOpen?`; `labelClose?` |
| **Variants** | light (on purple) · dark |
| **Состояния** | closed · open |
| **Reuse** | Header |
| **Adaptive** | visible `<lg` |
| **Client?** | controlled; can be dumb button |

### 2.5 `CTA` (навигационный / секционный call-to-action)

| | |
|--|--|
| **Путь** | не отдельный атом — **композиция** `Button` + `href`/`onClick` |
| **Ответственность** | единый primary action pattern |
| **Props** | через `Button` + `asChild` Link |
| **Variants** | primary lime · secondary outline · ghost |
| **Состояния** | см. Button |
| **Reuse** | Header, About, Process, Contacts, StickyCtaBar |
| **Adaptive** | full-width optional on mobile |
| **Правило** | Hero **без** CTA-кластера (IA / refs) |

---

## 3. UI Primitives

### 3.1 `Button`

| | |
|--|--|
| **Путь** | `components/ui/button.tsx` |
| **Props** | `variant`; `size`; `loading?`; `disabled?`; `asChild?`; `type?`; `className?`; стандартные button attrs |
| **Variants** | `primary` (lime) · `secondary` (outline/white) · `ghost` · `link` |
| **Sizes** | `sm` · `md` · `lg` · `pill` (default radius pill for primary) |
| **Состояния** | default · hover · active · focus-visible · disabled · loading |
| **Reuse** | везде CTA / submit |
| **Adaptive** | min tap 44px; optional `fullWidth` |
| **Client?** | no (unless loading spinner needs client — обычно нет) |
| **DS** | `bg-action-primary`, `rounded-pill`, motion duration-fast |

### 3.2 `Badge`

| | |
|--|--|
| **Путь** | `components/ui/badge.tsx` |
| **Props** | `children`; `variant?: "caption"\|"status"\|"brand"` |
| **Variants** | caption («ремонт цифровой техники») · status · brand |
| **Состояния** | — |
| **Reuse** | Hero brand tab, Services labels |
| **Adaptive** | text-xs → sm |
| **Client?** | no |

### 3.3 `Card`

| | |
|--|--|
| **Путь** | `components/ui/card.tsx` |
| **Ответственность** | интерактивный / контентный контейнер (не декоративный wrapper) |
| **Props** | `as?`; `interactive?`; `surface?: "dark"\|"light"`; `padding?`; `className?`; `children` |
| **Variants** | static · interactive (hover lift) |
| **Состояния** | default · hover · focus-within |
| **Reuse** | base for `ServiceCard`, advantage tiles |
| **Adaptive** | padding token scale |
| **Client?** | no |
| **Правило DS** | card только если нужен interaction/grouping; не в Hero |

### 3.4 `Icon`

| | |
|--|--|
| **Путь** | `components/ui/icon.tsx` + `icons/*` |
| **Props** | `name: IconName`; `size?: "sm"\|"md"\|"lg"`; `className?`; `aria-hidden?` |
| **Variants** | size → `--icon-size-*` |
| **Состояния** | — |
| **Reuse** | IconBadge, channels, UI |
| **Adaptive** | — |
| **Client?** | no |

### 3.5 `Tag`

| | |
|--|--|
| **Путь** | `components/ui/tag.tsx` |
| **Ответственность** | компактная метка категории (устройства, услуги) |
| **Props** | `children`; `tone?: "neutral"\|"lime"\|"purple"` |
| **Variants** | tone |
| **Состояния** | default · optional selected |
| **Reuse** | Ticker items, Filters (if any) |
| **Adaptive** | wrap in flex |
| **Client?** | no |

### 3.6 `Input`

| | |
|--|--|
| **Путь** | `components/ui/input.tsx` |
| **Props** | standard input + `invalid?`; `inputSize?: "md"\|"lg"` |
| **Variants** | default on light/dark surface (inherits semantic tokens) |
| **Состояния** | default · hover · focus · invalid · disabled |
| **Reuse** | lead form (name, phone) |
| **Adaptive** | full width |
| **Client?** | no (forwardRef) |

### 3.7 `Textarea`

| | |
|--|--|
| **Путь** | `components/ui/textarea.tsx` |
| **Props** | standard textarea + `invalid?`; `rows?` |
| **Variants** | default |
| **Состояния** | как Input |
| **Reuse** | lead message |
| **Adaptive** | full width, min-height token |
| **Client?** | no |

### 3.8 `Select`

| | |
|--|--|
| **Путь** | `components/ui/select.tsx` (Radix/shadcn) |
| **Props** | `options`; `value`; `onValueChange`; `placeholder?`; `invalid?` |
| **Variants** | default |
| **Состояния** | closed · open · disabled · invalid |
| **Reuse** | optional device type in form |
| **Adaptive** | full width; touch-friendly |
| **Client?** | **yes** |
| **v1** | optional — можно отложить, если форма только name/phone/message |

### 3.9 `Modal` / `Dialog`

| | |
|--|--|
| **Путь** | `components/ui/dialog.tsx` |
| **Props** | `open`; `onOpenChange`; `title`; `children`; `footer?` |
| **Variants** | center dialog |
| **Состояния** | closed · open |
| **Reuse** | success lead, legal, optional |
| **Adaptive** | full-screen-ish on mobile, centered desktop |
| **Client?** | **yes** |
| **v1** | success state может быть inline в форме — Modal optional |

### 3.10 `Accordion`

| | |
|--|--|
| **Путь** | `components/ui/accordion.tsx` |
| **Props** | Radix Accordion root/item API wrapper |
| **Variants** | single · multiple |
| **Состояния** | collapsed · expanded |
| **Reuse** | FAQ |
| **Adaptive** | full width |
| **Client?** | **yes** |

### 3.11 `Tooltip`

| | |
|--|--|
| **Путь** | `components/ui/tooltip.tsx` |
| **Props** | `content`; `children`; `side?` |
| **Variants** | — |
| **Состояния** | closed · open |
| **Reuse** | rare (icon hints) |
| **Adaptive** | prefer none on touch; use label instead |
| **Client?** | **yes** |
| **v1 priority** | low — можно отложить |

### 3.12 `Divider`

| | |
|--|--|
| **Путь** | `components/ui/divider.tsx` |
| **Props** | `orientation?: "horizontal"\|"vertical"`; `className?` |
| **Variants** | subtle · strong (border tokens) |
| **Состояния** | — |
| **Reuse** | Footer, form sections |
| **Adaptive** | — |
| **Client?** | no |

---

## 4. Shared molecules (не в user-list, но обязательны DS)

| ID | Component | Props (кратко) | Reuse |
|----|-----------|----------------|-------|
| M-01 | `BrandWordmark` | `size`; `withSpark?` | Hero, Header optional |
| M-02 | `IconBadge` | `icon`; `label?` | About, Advantages |
| M-03 | `TrustFact` | `icon`; `title`; `description?` | About, Advantages |
| M-04 | `FormField` | `label`; `error?`; `children` | Contacts form |
| M-05 | `ProcessStep` | `index`; `title`; `body` | Process |
| M-06 | `ReviewItem` | `name`; `text`; `rating?` | Reviews |
| M-07 | `ChannelLink` | `channel`; `href` | Contacts, Footer |
| M-08 | `ServiceMedia` | `src`; `alt`; `priority?` | ServiceCard, Masters |
| M-09 | `TickerBar` | `items: string[]` | Hero zone |
| M-10 | `SectionHeading` | `title`; `align?`; `as?` | all sections |

---

## 5. Landing Sections

### 5.1 `HeroSection`

| | |
|--|--|
| **Путь** | `sections/hero` |
| **Состав** | Section(hero) + HeroFrame + BrandWordmark + Badge + TickerBar |
| **Props** | `media`; `brandLabel`; `caption`; `tickerItems` |
| **Variants** | desktop frame · mobile stacked card (по рефам) |
| **Состояния** | static + optional reveal motion |
| **Reuse** | organisms внутри только hero |
| **Adaptive** | full-bleed purple; brand orange dominant; **no CTA form** |
| **Client?** | motion island optional |

### 5.2 `ServicesSection`

| | |
|--|--|
| **Путь** | `sections/services` |
| **Состав** | Section + SectionHeading + Grid + `ServiceCard`×N |
| **Props** | `items: ServiceItem[]` |
| **ServiceCard variants** | `mediaTop` · `mediaBottom` (refs rhythm) |
| **Состояния** | card hover lift |
| **Reuse** | ServiceCard, ServiceMedia, Card |
| **Adaptive** | 1 col → 2 → 3 |
| **Client?** | no |

### 5.3 `AboutSection` (О нас)

| | |
|--|--|
| **Путь** | `sections/about` |
| **Состав** | light surface panel + overlap media + TrustFacts + CTA Button |
| **Props** | `title`; `body`; `facts`; `media`; `cta` |
| **Variants** | desktop 2-col · mobile stack |
| **Состояния** | — |
| **Reuse** | TrustFact, Button, Container |
| **Adaptive** | PC image overlap (z-overlap token) |
| **Client?** | no / light motion |

### 5.4 `AdvantagesSection` (Преимущества)

| | |
|--|--|
| **Путь** | `sections/advantages` |
| **Состав** | SectionHeading + Grid of advantage cards / TrustFacts |
| **Props** | `items: AdvantageItem[]` |
| **Variants** | icon+title+text cards |
| **Состояния** | optional hover |
| **Reuse** | IconBadge, Card/TrustFact |
| **Adaptive** | 1 → 2 → 3/4 |
| **Client?** | no |

### 5.5 `ProcessSection` (Repair Process)

| | |
|--|--|
| **Путь** | `sections/process` |
| **Состав** | SectionHeading + ProcessTimeline (`ProcessStep` list) + optional CTA |
| **Props** | `steps`; `cta?` |
| **Variants** | vertical timeline mobile · horizontal/grid desktop |
| **Состояния** | — |
| **Reuse** | ProcessStep, Button |
| **Adaptive** | stack → row |
| **Client?** | no |

### 5.6 `GuaranteesSection` (Warranty)

| | |
|--|--|
| **Путь** | `sections/guarantees` |
| **Состав** | GuaranteeBlock (terms list + emphasis) |
| **Props** | `title`; `items`; `footnote?` |
| **Variants** | dark panel |
| **Состояния** | — |
| **Reuse** | Icon, Divider |
| **Adaptive** | stack |
| **Client?** | no |

### 5.7 `Statistics` (опциональный блок)

| | |
|--|--|
| **Путь** | `sections/advantages` as sub-block **или** `shared/StatRow` |
| **Ответственность** | цифры доверия (годы / ремонты / гарантия) |
| **Props** | `items: { value; label }[]` |
| **Variants** | inline row · grid |
| **Состояния** | optional count-up (motion) |
| **Reuse** | внутри About / Advantages |
| **Adaptive** | 2×2 mobile → row desktop |
| **Client?** | only if animated |
| **v1** | **не отдельная IA-секция**; не выносить в первый viewport (hero budget) |

### 5.8 `MastersSection` (Team)

| | |
|--|--|
| **Путь** | `sections/masters` |
| **Состав** | gallery / cards of masters |
| **Props** | `people: Master[]` |
| **Variants** | photo card + name + role |
| **Состояния** | — |
| **Reuse** | ServiceMedia, Card |
| **Adaptive** | horizontal scroll optional · grid |
| **Client?** | no / carousel later |

### 5.9 `Workshop` / Parts proof

| | |
|--|--|
| **Путь** | усиление `Services` card «склад» **или** `sections/about` media |
| **Ответственность** | proof комплектующих |
| **Props** | `media`; `title`; `body` |
| **Variants** | media-led card |
| **Состояния** | — |
| **Reuse** | ServiceCard pattern |
| **Adaptive** | full bleed image in card |
| **v1** | **не отдельный route/section ID**, если закрыто Services#parts (IA) |

### 5.10 `ReviewsSection`

| | |
|--|--|
| **Путь** | `sections/reviews` |
| **Состав** | ReviewItem list **или** carousel (Embla — by need) |
| **Props** | `items: Review[]` |
| **Variants** | static grid · carousel |
| **Состояния** | carousel: idle · dragging |
| **Reuse** | ReviewItem |
| **Adaptive** | 1 → 2–3; swipe mobile |
| **Client?** | yes if carousel |

### 5.11 `FaqSection`

| | |
|--|--|
| **Путь** | `sections/faq` |
| **Состав** | Accordion of FaqItems |
| **Props** | `items: { q; a }[]` |
| **Variants** | single open |
| **Состояния** | collapsed · expanded |
| **Reuse** | Accordion |
| **Adaptive** | full width container-md |
| **Client?** | yes (accordion island) |

### 5.12 `ContactsSection`

| | |
|--|--|
| **Путь** | `sections/contacts` |
| **Состав** | ContactChannels + `features/lead` ContactForm |
| **Props** | channels from `siteConfig`; form via feature |
| **Variants** | 2-col desktop · stack mobile |
| **Состояния** | form: idle · validating · submitting · success · error |
| **Reuse** | Input, Textarea, Button, FormField, ChannelLink, Checkbox |
| **Adaptive** | stack; sticky CTA optional |
| **Client?** | form island yes |

### 5.13 `CtaBlock`

| | |
|--|--|
| **Путь** | `components/shared/CtaBlock.tsx` |
| **Ответственность** | промежуточный conversion band (после Process / Guarantees) |
| **Props** | `title`; `description?`; `primary`; `secondary?` |
| **Variants** | lime band · dark band |
| **Состояния** | — |
| **Reuse** | Button |
| **Adaptive** | stack buttons on mobile |
| **Client?** | no |

### 5.14 `FooterSection`

| | |
|--|--|
| **Путь** | композиция в `app/page` → `<Footer />` |
| **Ответственность** | page-level footer slot |
| **Примечание** | не дублировать `Footer` компонент отдельной «секцией-файлом», если нет уникальной логики |

### 5.15 `StickyCtaBar` (optional mobile)

| | |
|--|--|
| **Путь** | `components/layout/StickyCtaBar.tsx` |
| **Props** | `label`; `href` / `onClick`; `visibleAfterId?` |
| **Состояния** | hidden · visible |
| **Adaptive** | mobile only |
| **Client?** | yes |
| **v1** | optional |

---

## 6. Матрица переиспользования

| Примитив | Где |
|----------|-----|
| `Button primary` | Header, About, CtaBlock, Process end, Contacts submit |
| `TrustFact` / `IconBadge` | About, Advantages |
| `Section` + `Container` | все landing sections |
| `NavLink` | Header, Footer, MobileMenu |
| `Card` | Services, Advantages, Reviews |
| `Accordion` | FAQ only (v1) |
| `FormField` + inputs | Contacts / lead |

---

## 7. Адаптивное поведение (сводка)

| Named range | Min width | Tailwind | Layout behavior |
|-------------|-----------|----------|-----------------|
| Small Mobile | `< 480` | base | 1 col; drawer nav; fluid container; H1 40px |
| Large Mobile | `≥ 480` (sm) | `sm` | 2-col grids where useful; tighter CTA wrap |
| Tablet Vertical | `≥ 768` (md) | `md` | container-md; type scale ↑; span 4→6 |
| Tablet Horizontal | `≥ 1024` (lg) | `lg` | desktop Navbar + CTA; 3-col; span as authored |
| Laptop | `≥ 1280` (xl) | `xl` | container-xl |
| Desktop | `≥ 1440` (2xl) | `2xl` | container-2xl; section-y max |
| Large Desktop | `≥ 1920` (3xl) | `3xl` | cap 1320 + larger gutters |

**Единые правила:** `--layout-container-max`, `--gutter`, `--section-y`, `--grid-gap`, `--type-display-*`, `--card-padding`, `--button-*`, `--nav-*-display`, `.media-ds` — см. `src/styles/responsive.css`.

**QA widths:** 1920 · 1440 · 1366 · 1024 · 768 · 480 · 390 · 375 · 360 · 320 — без horizontal scroll / overlap / overflow / text clip.

Компоненты: только token gutters / section-y / adaptive CSS vars — без magic px.

---

## 8. Соответствие Design System — чеклист на реализацию

Для **каждого** компонента перед merge:

- [ ] Одна ответственность  
- [ ] Props типизированы; variants через `cva`  
- [ ] Состояния покрыты (hover/focus/disabled/…)  
- [ ] Только CSS tokens / Tailwind theme utilities  
- [ ] Переиспользуем существующие atoms, не копируем  
- [ ] Adaptive описан и проверен mobile+desktop  
- [ ] Легко тестируется (pure props → UI; logic в feature)  
- [ ] A11y: focus-visible, labels, dialog/accordion roles  

---

## 9. Порядок реализации (рекомендация)

1. Layout: Container → Section → Grid → Header/Footer shells  
2. UI: Button → Badge → Card → Icon → Form controls  
3. Shared: BrandWordmark, NavLink, TrustFact, ServiceMedia  
4. Sections by IA: Hero → Services → About → … → Contacts  
5. Features: mobile-menu → lead form  

---

## 10. Вне scope реализации на этом этапе

- Код JSX компонентов (кроме уже существующего foundation smoke)  
- shadcn codegen (следующий UI-этап)  
- Контент `data/site.ts` наполнения секций  
- Embla / Framer подключение до нужной секции  

**Этап 1.5 = карта утверждена как SoT для UI-кода.**
