export type ReviewPhoto = {
  src: string;
  alt: string;
};

export type ReviewContent = {
  id: string;
  name: string;
  text: string;
  rating: number;
  /** Устройство / модель */
  device: string;
  /** ISO date YYYY-MM-DD — показываем, если есть */
  date?: string;
  /** Фото результата / устройства — опционально */
  photo?: ReviewPhoto;
};

export const reviewsContent = {
  title: "Отзывы",
  titleId: "reviews-heading",
  lead: "Реальные сценарии клиентов — от замены экрана до профилактики ноутбука.",
  ratingSummary: {
    value: "4.9",
    max: 5,
    countLabel: "на основе 120+ оценок",
  },
  items: [
    {
      id: "r1",
      name: "Анна К.",
      rating: 5,
      device: "iPhone 13",
      date: "2026-03-12",
      photo: {
        src: "/images/services/mobile.webp",
        alt: "Смартфон после замены дисплея",
      },
      text: "Сразу сказали срок и цену после диагностики. Телефон отдали на следующий день, всё работает, гарантию оформили без уговоров.",
    },
    {
      id: "r2",
      name: "Игорь П.",
      rating: 5,
      device: "ASUS VivoBook",
      date: "2026-02-28",
      photo: {
        src: "/images/services/computers.webp",
        alt: "Ноутбук после чистки и замены термопасты",
      },
      text: "Ноутбук грелся и шумел. Объяснили причину, показали термопасту и пыль — без «магии». После чистки стало тише, цену не накрутили.",
    },
    {
      id: "r3",
      name: "Елена М.",
      rating: 5,
      device: "PlayStation 5",
      date: "2026-01-19",
      text: "Боялась, что «разберут и забудут». Держали в курсе, согласовали замену модуля. Приставку забрала с актом и гарантией.",
    },
    {
      id: "r4",
      name: "Сергей Д.",
      rating: 5,
      device: "Samsung Galaxy S22",
      date: "2025-12-08",
      photo: {
        src: "/images/services/parts.webp",
        alt: "Комплектующие для ремонта смартфона",
      },
      text: "Меняли разъём зарядки. Диагностика бесплатная, детали согласовали до работы. Забрали в тот же день — всё ок.",
    },
    {
      id: "r5",
      name: "Ольга В.",
      rating: 4,
      device: "MacBook Air",
      date: "2025-11-21",
      text: "Клавиатура залипла после кофе. Срок чуть дольше обещанного из‑за детали, но предупредили заранее и цену не меняли.",
    },
    {
      id: "r6",
      name: "Павел Н.",
      rating: 5,
      device: "Xiaomi Redmi Note",
      text: "Экран после падения. Показали варианты стекла, выбрал оригинал. Работа аккуратная, рамки без зазоров.",
    },
  ] satisfies readonly ReviewContent[],
} as const;
