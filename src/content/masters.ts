export type MasterPerson = {
  id: string;
  name: string;
  role: string;
  experience: string;
  certificates: readonly string[];
  imageSrc: string;
  imageAlt: string;
};

export type WorkshopImage = {
  id: string;
  src: string;
  alt: string;
  featured?: boolean;
};

export const mastersContent = {
  title: "Мастера",
  titleId: "masters-heading",
  lead: "Инженеры с опытом, сертификатами и привычкой объяснять проблему простым языком.",
  people: [
    {
      id: "alex",
      name: "Алексей Смирнов",
      role: "Старший инженер · мобильная техника",
      experience: "9 лет опыта",
      certificates: ["Диагностика смартфонов", "BGA / микропайка"],
      imageSrc: "/images/masters/alex.webp",
      imageAlt: "Инженер Алексей Смирнов",
    },
    {
      id: "maria",
      name: "Мария Иванова",
      role: "Инженер · ноутбуки и ПК",
      experience: "7 лет опыта",
      certificates: ["Чистка и термоинтерфейсы", "Апгрейд комплектующих"],
      imageSrc: "/images/masters/maria.webp",
      imageAlt: "Инженер Мария Иванова",
    },
    {
      id: "dmitry",
      name: "Дмитрий Ковалёв",
      role: "Инженер · консоли и периферия",
      experience: "6 лет опыта",
      certificates: ["Ремонт игровых приставок", "Приёмка и фотофиксация"],
      imageSrc: "/images/masters/dmitry.webp",
      imageAlt: "Инженер Дмитрий Ковалёв",
    },
  ] satisfies readonly MasterPerson[],
  workshop: {
    title: "Мастерская",
    lead: "Оборудованные рабочие места: микроскопы, схемы и антистатическая зона.",
    images: [
      {
        id: "bench",
        src: "/images/workshop/bench.webp",
        alt: "Мастерская МойСервис: рабочие места инженеров с микроскопами и инструментами",
        featured: true,
      },
      {
        id: "desk",
        src: "/images/workshop/desk.webp",
        alt: "Рабочий стол инженера",
      },
      {
        id: "stock",
        src: "/images/workshop/stock.webp",
        alt: "Склад комплектующих сервисного центра",
      },
    ] satisfies readonly WorkshopImage[],
  },
} as const;
