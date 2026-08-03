# Motion Library (Framer Motion)

Токены: `@/lib/motion` · пресеты: `@/animations` · компоненты: `@/components/motion`.

## Правила
- Длительность **150–350 ms**
- Только `opacity` + `transform` (без CLS)
- Easing DS: `standard` / `emphasized`
- `prefers-reduced-motion` через `useReducedMotion` + `MotionConfig`
- Не импортировать в `app/layout` — только islands + `MotionProvider`

## Компоненты
| API | Назначение |
|-----|------------|
| `MotionProvider` | LazyMotion + reducedMotion |
| `Fade` / `FadeUp` / `FadeDown` | Enter |
| `Scale` / `Slide` / `Reveal` | Enter |
| `ScrollReveal` | whileInView |
| `Stagger` + `StaggerItem` | список |
| `Hover` / `Tap` / `MicroInteraction` | micro |
| `PageTransition` | route enter/exit |

```tsx
import { MotionProvider, ScrollReveal, Stagger, StaggerItem } from "@/components/motion";

<MotionProvider>
  <ScrollReveal preset="fadeUp">…</ScrollReveal>
  <Stagger>
    <StaggerItem>A</StaggerItem>
    <StaggerItem>B</StaggerItem>
  </Stagger>
</MotionProvider>
```
