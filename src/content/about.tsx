import type { ReactNode } from "react";
import type { AdvantageIconId } from "@/components/icons/advantage-icons";

export type AboutFact = {
  id: string;
  title: string;
  icon: AdvantageIconId;
};

export const aboutContent = {
  title: "О нас",
  titleId: "about-heading",
  body: (
    <>
      Мы работаем с <strong>разной цифровой техникой</strong> и не обещаем
      невозможного. Нас можно проверить: прозрачная диагностика, согласование
      цены и гарантия на результат — так мы зарабатываем доверие{" "}
      <strong>уже очень долго</strong>.
    </>
  ) as ReactNode,
  media: {
    src: "/images/about/devices.webp",
    alt: "Ноутбук, смартфон, игровой ПК и планшет — техника, с которой работает МойСервис",
  },
  facts: [
    { id: "since", title: "Работаем с 2017 года", icon: "clock" as const },
    {
      id: "volume",
      title: "Более 600 единиц отремонтированной техники",
      icon: "wrench" as const,
    },
    {
      id: "stock",
      title: "Собственные запасы комплектующих",
      icon: "warehouse" as const,
    },
  ] satisfies readonly AboutFact[],
  ctaLabel: "Свяжитесь с нами",
  ctaHref: "#contacts",
} as const;
