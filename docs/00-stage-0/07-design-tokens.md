# Design Tokens — МойСервис

**Версия:** 0.1  
**Правило:** UI-компоненты используют **только** эти токены.  
Значения hex — калибровка Stage 0 по рефам; допускается ±2% уточнение на Design QA по PNG.

---

## 1. Color Tokens

```json
{
  "color": {
    "brand": {
      "purple": "#6B2CF5",
      "purple-deep": "#5A1FE0",
      "orange": "#FF4D00",
      "orange-hover": "#E64500"
    },
    "accent": {
      "lime": "#C8FF00",
      "lime-hover": "#B8ED00",
      "lime-pressed": "#A6D600"
    },
    "bg": {
      "page": "#121212",
      "hero": "{color.brand.purple}",
      "inverse": "#FFFFFF"
    },
    "surface": {
      "dark": "#232323",
      "dark-elevated": "#2A2A2A",
      "light": "#FFFFFF",
      "light-muted": "#F3F3F3"
    },
    "text": {
      "primary": "#111111",
      "secondary": "#333333",
      "inverse": "#FFFFFF",
      "muted-on-dark": "#C8C8C8",
      "on-lime": "#111111",
      "brand": "{color.brand.orange}"
    },
    "border": {
      "subtle": "rgba(255,255,255,0.08)",
      "strong": "#FFFFFF",
      "dark": "#111111"
    },
    "semantic": {
      "error": "#E53935",
      "success": "#2E7D32",
      "focus": "#6B2CF5"
    },
    "overlay": {
      "scrim": "rgba(0,0,0,0.55)"
    }
  }
}
```

---

## 2. Typography Tokens

```json
{
  "font": {
    "family": {
      "display": "\"Geologica\", \"Manrope\", sans-serif",
      "body": "\"Manrope\", \"Geologica\", sans-serif"
    },
    "size": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.5rem",
      "5xl": "3rem",
      "6xl": "3.5rem"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800
    },
    "lineHeight": {
      "tight": 1.05,
      "snug": 1.15,
      "normal": 1.4,
      "relaxed": 1.55
    },
    "letterSpacing": {
      "tight": "-0.02em",
      "normal": "0",
      "wide": "0.04em",
      "wider": "0.08em"
    }
  }
}
```

*Финальные семейства шрифтов утверждаются на старте кода после проверки кириллицы.*

---

## 3. Radius Tokens

```json
{
  "radius": {
    "none": "0",
    "xs": "8px",
    "sm": "12px",
    "md": "16px",
    "lg": "32px",
    "xl": "48px",
    "2xl": "64px",
    "3xl": "80px",
    "pill": "9999px"
  }
}
```

---

## 4. Space Tokens

```json
{
  "space": {
    "0": "0",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "32px",
    "8": "40px",
    "9": "48px",
    "10": "64px",
    "11": "80px",
    "12": "96px",
    "13": "128px"
  }
}
```

---

## 5. Layout / Container Tokens

```json
{
  "layout": {
    "container": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1200px",
      "2xl": "1320px"
    },
    "gutter": {
      "mobile": "{space.4}",
      "tablet": "{space.6}",
      "desktop": "{space.7}"
    },
    "sectionY": {
      "mobile": "{space.10}",
      "desktop": "{space.12}"
    }
  }
}
```

---

## 6. Breakpoint Tokens

```json
{
  "breakpoint": {
    "sm": "480px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1440px",
    "3xl": "1920px"
  },
  "named": {
    "smallMobile": "< 480",
    "largeMobile": "≥ 480 (sm)",
    "tabletVertical": "≥ 768 (md)",
    "tabletHorizontal": "≥ 1024 (lg)",
    "laptop": "≥ 1280 (xl)",
    "desktop": "≥ 1440 (2xl)",
    "largeDesktop": "≥ 1920 (3xl)"
  }
}
```

---

## 7. Shadow / Elevation Tokens

```json
{
  "shadow": {
    "none": "none",
    "sm": "0 4px 16px rgba(0,0,0,0.25)",
    "md": "0 12px 40px rgba(0,0,0,0.35)",
    "focus": "0 0 0 3px rgba(107,44,245,0.45)"
  },
  "elevation": {
    "0": "flat",
    "1": "surface.dark vs bg.page",
    "2": "overlap media (About PC)",
    "3": "modal / drawer"
  }
}
```

---

## 8. Border Tokens

```json
{
  "border": {
    "width": {
      "hairline": "1px",
      "thin": "2px",
      "frame": "10px",
      "frame-lg": "14px"
    },
    "style": {
      "solid": "solid"
    }
  }
}
```

---

## 9. Motion / Animation Tokens

```json
{
  "motion": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms",
      "hero": "800ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.22, 1, 0.36, 1)",
      "emphasized": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      "linear": "linear"
    },
    "delay": {
      "stagger": "80ms"
    }
  }
}
```

---

## 10. Z-index Tokens

```json
{
  "z": {
    "base": 0,
    "content": 1,
    "overlap": 5,
    "sticky": 20,
    "header": 30,
    "dropdown": 40,
    "overlay": 50,
    "modal": 60,
    "toast": 70
  }
}
```

---

## 11. Icon Tokens

```json
{
  "icon": {
    "size": {
      "sm": "16px",
      "md": "20px",
      "lg": "24px"
    },
    "badge": {
      "size": "48px",
      "bg": "{color.brand.purple}",
      "fg": "{color.text.inverse}"
    }
  }
}
```

---

## 12. Opacity Tokens

```json
{
  "opacity": {
    "disabled": 0.4,
    "muted": 0.7,
    "overlay": 0.55
  }
}
```

---

## 13. Implementation mapping (будущий код)

| Слой | Формат |
|------|--------|
| Source | `tokens.json` или CSS variables в `:root` |
| CSS | `--color-brand-purple` и т.д. |
| TS | `theme.tokens` (если React) |
| Запрет | литералы цвета/spacing в компонентах |

---

## 14. Token governance

1. Новое значение → сначала токен, потом компонент  
2. Rename через alias, не ломая consumers  
3. Design QA сверяет токены с PNG рефов  
