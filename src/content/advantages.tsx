import type { ReactNode } from "react";
import type { AdvantageIconId } from "@/components/icons/advantage-icons";

export type AdvantageItem = {
  id: string;
  title: string;
  description: ReactNode;
  icon: AdvantageIconId;
};

/**
 * Advantages — UVP differentiators (PRD / product analysis).
 * Distinct from About trust facts (years / volume / stock).
 */
export const advantagesContent = {
  title: "Почему мы",
  titleId: "advantages-heading",
  lead: "Уверенность вместо догадок: прозрачная цена, оригинал комплектующих и понятные сроки.",
  items: [
    {
      id: "price",
      title: "Цена до ремонта",
      description: (
        <>
          Фиксируем стоимость <strong>после диагностики и согласования</strong>
          — без сюрпризов в процессе.
        </>
      ),
      icon: "price" as const,
    },
    {
      id: "parts",
      title: "Оригинал и склад",
      description: (
        <>
          Используем{" "}
          <strong>оригинальные и проверенные комплектующие</strong> со своего
          склада.
        </>
      ),
      icon: "warehouse" as const,
    },
    {
      id: "speed",
      title: "1–2 рабочих дня",
      description: (
        <>
          Большинство ремонтов выполняем{" "}
          <strong>за один–два рабочих дня</strong>, если деталь в наличии.
        </>
      ),
      icon: "clock" as const,
    },
    {
      id: "warranty",
      title: "Гарантия на результат",
      description: (
        <>
          Даём <strong>гарантию на работы и установленные детали</strong> —
          отвечаем за результат.
        </>
      ),
      icon: "shield" as const,
    },
    {
      id: "masters",
      title: "Опытные мастера",
      description: (
        <>
          Ремонтируют специалисты с опытом по{" "}
          <strong>разной цифровой технике</strong>, а не «универсальный
          новичок».
        </>
      ),
      icon: "wrench" as const,
    },
    {
      id: "comms",
      title: "Понятная связь",
      description: (
        <>
          Объясняем проблему простым языком и{" "}
          <strong>согласовываем каждый шаг</strong> до начала работ.
        </>
      ),
      icon: "chat" as const,
    },
  ],
} as const;
