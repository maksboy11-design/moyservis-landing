# Component Catalog (Stage 1)

**Статус:** каталог подготовлен · UI-реализация отложена на UI-этап  
**Модель (props/variants/states):** [`../01-stage-1.5/00-component-model.md`](../01-stage-1.5/00-component-model.md)  
**Inventory Stage 0:** `docs/00-stage-0/08-component-inventory.md`

---

## Карта каталога → файловая система

| ID | Компонент | Путь (целевой) | Статус Stage 1 |
|----|-----------|----------------|----------------|
| F-01 | Tokens / Theme | `styles/tokens.css`, `theme.css` | ✅ код |
| F-02 | `cn` | `lib/cn.ts` | ✅ код |
| F-03 | Fonts | `lib/fonts.ts` | ✅ код |
| F-04 | Section IDs | `constants/section-ids.ts` | ✅ код |
| L-01 | `Container` | `components/layout/Container.tsx` | 📋 catalog |
| L-02 | `Section` | `components/layout/Section.tsx` | 📋 catalog |
| L-03 | `Grid` | `components/layout/Grid.tsx` | 📋 catalog |
| L-04 | `Header` | `components/layout/Header.tsx` | 📋 catalog |
| L-05 | `Footer` | `components/layout/Footer.tsx` | 📋 catalog |
| N-01 | `NavLink` | `components/shared/NavLink.tsx` | 📋 catalog |
| N-02 | `MenuToggle` | `components/shared/MenuToggle.tsx` | 📋 catalog |
| N-03 | `MobileMenu` | `features/navigation/MobileMenu.tsx` | 📋 catalog |
| U-01 | `Button` | `components/ui/button.tsx` | 📋 catalog (shadcn) |
| U-02 | `Input` | `components/ui/input.tsx` | 📋 catalog |
| U-03 | `Textarea` | `components/ui/textarea.tsx` | 📋 catalog |
| U-04 | `Checkbox` | `components/ui/checkbox.tsx` | 📋 catalog |
| U-05 | `Label` | `components/ui/label.tsx` | 📋 catalog |
| U-06 | `Accordion` | `components/ui/accordion.tsx` | 📋 catalog |
| S-01 | `BrandWordmark` | `components/shared/BrandWordmark.tsx` | 📋 catalog |
| S-02 | `TrustFact` | `components/shared/TrustFact.tsx` | 📋 catalog |
| S-03 | `IconBadge` | `components/shared/IconBadge.tsx` | 📋 catalog |
| S-04 | `TickerBar` | `components/shared/TickerBar.tsx` | 📋 catalog |
| S-05 | `ServiceCard` | `components/shared/ServiceCard.tsx` | 📋 catalog |
| S-06 | `HeroFrame` | `components/shared/HeroFrame.tsx` | 📋 catalog |
| SEC-01…10 | Landing sections | `sections/{hero…contacts}/` | 📁 dirs ready |
| FEAT-01 | Lead form | `features/lead/` | 📁 + schema ✅ |
| FEAT-02 | Navigation | `features/navigation/` | 📁 ready |

**Легенда:** ✅ код · 📋 описан в component model · 📁 директория создана

---

## Порядок реализации (UI-этап)

1. `Container` → `Section` → `Grid`  
2. `Button` / `Input` (shadcn + токены)  
3. `Header` + `MobileMenu`  
4. `HeroSection` + `TickerBar`  
5. `Services` → `About` → остальные по IA  

---

## Правило каталога

Новый компонент **сначала** добавляется в этот файл + component model, **потом** код.
