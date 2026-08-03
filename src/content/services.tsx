import type { ReactNode } from "react";
import type { ServiceIconId } from "@/components/icons/service-icons";

export type ServiceItem = {
  id: string;
  title: string;
  /** Rich description — use <strong> for scan accents (refs) */
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  mediaPosition: "top" | "bottom";
  icon: ServiceIconId;
};

/**
 * Services content — copy from refs (typos fixed), brand МойСервис.
 */
export const servicesContent = {
  title: "Наши услуги",
  titleId: "services-heading",
  items: [
    {
      id: "mobile",
      title: "Ремонт мобильной техники",
      description: (
        <>
          Проводим диагностику и <strong>ремонт</strong> смартфонов, планшетов,
          электронных книг. Производим{" "}
          <strong>замену экранов, аккумуляторов, разъёмов</strong> и многое
          другое.
        </>
      ),
      imageSrc: "/images/services/mobile.webp",
      imageAlt: "Ремонт смартфона: работа с внутренней частью устройства",
      mediaPosition: "top" as const,
      icon: "phone" as const,
    },
    {
      id: "computers",
      title: "Ремонт компьютеров и другой цифровой техники",
      description: (
        <>
          Ноутбуки, персональные компьютеры, принтеры, акустические системы —{" "}
          <strong>
            устраняем неисправности, проводим чистку и профилактику
          </strong>
          .
        </>
      ),
      imageSrc: "/images/services/computers.webp",
      imageAlt: "Ремонт ноутбука: работа с материнской платой",
      mediaPosition: "bottom" as const,
      icon: "laptop" as const,
    },
    {
      id: "parts",
      title: "Комплектующие для цифровой техники",
      description: (
        <>
          В наличии большой выбор <strong>комплектующих</strong>. Вы можете
          купить у нас <strong>всё необходимое</strong> для вашей техники.
        </>
      ),
      imageSrc: "/images/services/parts.webp",
      imageAlt: "Склад комплектующих: видеокарты и электроника",
      mediaPosition: "top" as const,
      icon: "chip" as const,
    },
  ],
} as const;
