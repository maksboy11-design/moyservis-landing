/**
 * Repair process steps — IA Stage 0 (§ Process).
 */

export type ProcessStepContent = {
  id: string;
  title: string;
  body: string;
};

export const processContent = {
  title: "Процесс ремонта",
  titleId: "process-heading",
  lead: "Пять понятных шагов — вы всегда знаете, что происходит с техникой и сколько это стоит.",
  ctaLabel: "Оставить заявку",
  ctaHref: "#contacts",
  steps: [
    {
      id: "request",
      title: "Заявка",
      body: "Оставляете заявку на сайте, звоните или пишете в мессенджер — отвечаем в рабочее время.",
    },
    {
      id: "diagnosis",
      title: "Диагностика",
      body: "Принимаем устройство, находим причину неисправности и фиксируем состояние техники.",
    },
    {
      id: "quote",
      title: "Согласование",
      body: "Называем стоимость и сроки. Работы начинаем только после вашего согласия.",
    },
    {
      id: "repair",
      title: "Ремонт",
      body: "Выполняем ремонт на оригинальных или проверенных комплектующих со склада.",
    },
    {
      id: "handover",
      title: "Выдача и гарантия",
      body: "Отдаём технику с гарантийными условиями и поясняем, что было сделано.",
    },
  ] satisfies readonly ProcessStepContent[],
} as const;
