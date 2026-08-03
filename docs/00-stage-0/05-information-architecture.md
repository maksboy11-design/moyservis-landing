# Information Architecture

**Проект:** МойСервис  
**Тип:** Single-page landing · scroll narrative · trust-first

---

## 1. Принцип IA

Структура строится **вокруг вопросов пользователя**, не вокруг каталога услуг.

Каждая секция:
- отвечает на **один** главный вопрос;
- усиливает доверие относительно предыдущей;
- имеет очевидный next step.

---

## 2. Карта вопросов → секции

| # | ID | Секция | Вопрос пользователя | Источник |
|---|-----|--------|---------------------|----------|
| 0 | `header` | Header / Nav | Где я и как перемещаться? | PRD + Refs |
| 1 | `hero` | Hero | Можно ли доверять с первого взгляда? | Refs (visual SoT) + PRD |
| 1b | `ticker` | Lime ticker | Что именно чините? | Refs |
| 2 | `services` | Наши услуги | Какие услуги есть? | Refs + PRD |
| 3 | `about` | О нас | Кто вы и почему вам верить? | Refs + PRD |
| 4 | `advantages` | Преимущества | Почему именно вы? | PRD (DS extrapol.) |
| 5 | `process` | Процесс ремонта | Что будет после заявки? | PRD |
| 6 | `parts` | Комплектующие | Какие детали ставите? | PRD (частично в services) |
| 7 | `masters` | Мастера | Кто ремонтирует? | PRD |
| 8 | `guarantees` | Гарантия | Кто отвечает за результат? | PRD |
| 9 | `reviews` | Отзывы | Что говорят клиенты? | PRD |
| 10 | `faq` | FAQ | Остальные сомнения | PRD |
| 11 | `contacts` | Контакты / CTA | Как начать? | PRD |
| 12 | `footer` | Footer | Юр.инфо / ссылки | PRD |

### Примечание по densити
Секции 4–10 **обязательны по PRD**, отсутствуют на скринах. Визуально: dark surfaces + lime/orange accents + large radius + proof imagery — без нового стиля.

Секция `parts` может быть усилением card #3 Services + отдельный proof-block (склад), чтобы не дублировать.

---

## 3. User flow (on-page)

```
Entry
  → Hero (visual trust + brand)
  → Ticker (scope clarity)
  → Services (fit)
  → About (human + facts + soft CTA)
  → Advantages (differentiators)
  → Process (control / predictability)
  → Masters + Parts proof (competence)
  → Guarantees (risk down)
  → Reviews (social proof)
  → FAQ (objection handling)
  → Contacts form + channels (conversion)
  → Footer
```

Эмоциональная кривая:  
`Тревога → Интерес → Доверие → Уверенность → Действие`

---

## 4. Навигация

### Desktop anchors
- Наши услуги → `#services`
- О нас → `#about`
- Контакты → `#contacts`

Опционально в расширенном меню / footer: Процесс, Гарантия, Отзывы.

### Mobile
- Hamburger → те же якоря + primary CTA  
- Smooth scroll с offset под sticky header  

---

## 5. CTA Architecture

| Место | Тип | Текст (черновик) |
|-------|-----|------------------|
| Header | Secondary/Primary | Оставить заявку |
| About (реф) | Primary | Свяжитесь с нами |
| After Process | Primary | Оставить заявку |
| Guarantees end | Secondary | Узнать условия |
| Contacts | Primary form | Отправить заявку |
| Contacts | Alt | Заказать звонок / VK / MAX / Маршрут |

**Правило:** в Hero нет формы и нет кластера CTA (соответствие рефам + trust-first).

---

## 6. Контентная модель секций (кратко)

### Hero
- Brand: МойСервис  
- Caption: ремонт цифровой техники  
- Media: hands-on repair photo  
- Ticker: сервисный центр… смартфоны, ноутбуки, ПК, приставки  

### Services (3)
1. Мобильная техника  
2. Компьютеры и цифровая техника  
3. Комплектующие  

### About
- Headline О НАС  
- Body: опыт мастеров, честность, предсказуемость  
- Trust: с 2017 · 600+ · свой склад  
- CTA  

### Process (предложение этапов)
1. Заявка  
2. Диагностика  
3. Согласование стоимости  
4. Ремонт  
5. Гарантия и выдача  

### Contacts form fields (минимум)
- Имя  
- Телефон  
- Устройство / кратко проблема (optional textarea)  
- Consent checkbox  

---

## 7. Точки отказа и страховки IA

| Отказ | Страховка |
|-------|-----------|
| «Не понял, чините ли моё устройство» | Ticker + Services |
| «Боюсь цены» | Process + Guarantees (фиксация после согласования) |
| «Боюсь подмены» | Parts + Masters photos |
| «Долго» | About fact «склад» + сроки в Process |
| «Не знаю как связаться» | Multi-channel Contacts + header CTA |

---

## 8. Sitemap (логическая)

```
/ (single page)
  #hero
  #services
  #about
  #advantages
  #process
  #masters
  #guarantees
  #reviews
  #faq
  #contacts
```

Отдельные URL не требуются в v1. SEO: одна страница + семантические section/heading.

---

## 9. IA Validation Checklist

- [ ] Каждый страх из PRD закрыт секцией  
- [ ] CTA не раньше Explain  
- [ ] Нет тупиков (с любой секции можно уйти в контакт)  
- [ ] Нет дублирования без усиления смысла  
- [ ] Mobile порядок = Desktop смысл  
- [ ] Бренд МойСервис = hero-level signal  
