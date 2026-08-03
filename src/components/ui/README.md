# UI primitives — Design System

| Компонент | Файл | Notes |
|-----------|------|-------|
| `Button` | `button.tsx` | primary · secondary · ghost · outline · link |
| `Typography` | `typography.tsx` | H1–H4 · Body · Caption · Label |
| `Card` | `card.tsx` | service · feature · info · statistic |
| `Badge` / `Divider` | — | tokens only |
| `Input` / `Textarea` / `Select` | — | error · success · loading · a11y |
| `Checkbox` / `RadioGroup` / `Switch` | — | keyboard + aria |
| `Form*` | `form.tsx` | RHF FormField / Control / Message |
| `FormLabel` | `label.tsx` | `<label htmlFor>` (не Typography Label) |

Импорт: `import { Input, Form, FormField } from "@/components/ui"`.

**File Upload** — вне scope v1 (нет в PRD lead-формы).
