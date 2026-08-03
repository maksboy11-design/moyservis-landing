# Component Inventory

**Проект:** МойСервис  
**Подход:** Component Driven Development · атомы → молекулы → организмы → секции

---

## 1. Foundations (не UI, но обязательны)

| ID | Компонент | Описание |
|----|-----------|----------|
| F-01 | `ThemeProvider` / CSS vars | Токены |
| F-02 | `Container` | Max-width + gutters |
| F-03 | `Section` | Якорь, padding, bg variant |
| F-04 | `Stack` / `Grid` | Layout primitives |
| F-05 | `VisuallyHidden` | A11y |

---

## 2. Atoms

| ID | Компонент | Варианты / состояния |
|----|-----------|----------------------|
| A-01 | `Button` | primary (lime), secondary (outline/white), ghost; hover/active/focus/disabled/loading |
| A-02 | `Link` | nav, inline, footer |
| A-03 | `Text` | brand, h1–h3, body, small, ticker |
| A-04 | `Icon` | SVG sprite/set |
| A-05 | `Badge` / `CaptionLabel` | «ремонт цифровой техники» |
| A-06 | `Input` | text, tel, textarea |
| A-07 | `Checkbox` | consent |
| A-08 | `Logo` / `BrandWordmark` | orange display |
| A-09 | `SparkMark` | декоративный акцент у бренда (как в рефе) |
| A-10 | `Divider` | optional |

---

## 3. Molecules

| ID | Компонент | Состав |
|----|-----------|--------|
| M-01 | `IconBadge` | circle + icon |
| M-02 | `TrustFact` | IconBadge + label |
| M-03 | `NavLink` | anchor + active state |
| M-04 | `MenuToggle` | hamburger |
| M-05 | `FormField` | label + input + error |
| M-06 | `ProcessStep` | number + title + body |
| M-07 | `ReviewItem` | name + text + rating |
| M-08 | `FaqItem` | accordion button + panel |
| M-09 | `ChannelLink` | icon + VK/MAX/phone |
| M-10 | `ServiceMedia` | rounded image |

---

## 4. Organisms

| ID | Компонент | Назначение |
|----|-----------|------------|
| O-01 | `Header` | nav / logo optional / CTA / mobile menu |
| O-02 | `HeroFrame` | white frame, media, brand tab, caption |
| O-03 | `TickerBar` | lime full-bleed text |
| O-04 | `ServiceCard` | image/text order variants |
| O-05 | `ServicesGrid` | 3-col / stack |
| O-06 | `AboutPanel` | text + overlap media + trust + CTA |
| O-07 | `AdvantagesGrid` | fact cards |
| O-08 | `ProcessTimeline` | steps |
| O-09 | `MastersGallery` | people/proof |
| O-10 | `GuaranteeBlock` | conditions |
| O-11 | `ReviewsCarousel` | or static list |
| O-12 | `FaqAccordion` | FAQ list |
| O-13 | `ContactForm` | fields + submit + success |
| O-14 | `ContactChannels` | phone, messengers, map |
| O-15 | `Footer` | links, legal |
| O-16 | `MobileMenu` | drawer |
| O-17 | `StickyCtaBar` | optional mobile |

---

## 5. Sections (page organisms)

| ID | Section | Organisms |
|----|---------|-----------|
| S-01 | `HeroSection` | Header zone + HeroFrame + TickerBar |
| S-02 | `ServicesSection` | title + ServicesGrid |
| S-03 | `AboutSection` | AboutPanel |
| S-04 | `AdvantagesSection` | AdvantagesGrid |
| S-05 | `ProcessSection` | ProcessTimeline |
| S-06 | `MastersSection` | MastersGallery |
| S-07 | `GuaranteesSection` | GuaranteeBlock |
| S-08 | `ReviewsSection` | ReviewsCarousel |
| S-09 | `FaqSection` | FaqAccordion |
| S-10 | `ContactsSection` | ContactForm + ContactChannels |
| S-11 | `FooterSection` | Footer |

---

## 6. Состояния по ключевым компонентам

### Button
- default · hover · active · focus-visible · disabled · loading  

### ServiceCard
- default · hover (lift) · focus-within  

### Form
- idle · validating · submitting · success · error  

### MobileMenu
- closed · open (focus trap)  

### FaqItem
- collapsed · expanded  

---

## 7. Переиспользование

| Паттерн | Где ещё |
|---------|---------|
| `Button primary` | About, Process end, Contacts, Header |
| `TrustFact` | About, Advantages |
| `Section` | все блоки |
| `ServiceMedia` | Masters / Cases if added |

---

## 8. Вне scope v1 (не создавать без нужды)
- Dark mode toggle  
- Theme switcher  
- Complex chart widgets  
- Chatbot widget  
- Multi-step wizard checkout  

---

## 9. Inventory readiness

Статус Stage 0: **описан**.  
Статус кода: **не начат** (запрещён до закрытия Stage 0).
