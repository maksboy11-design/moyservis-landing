/**
 * Final CTA / contacts — PRD §4.11 peak-end conversion.
 */

export type ContactBenefit = {
  id: string;
  title: string;
};

export const contactsContent = {
  title: "Готовы вернуть технику в работу?",
  titleId: "contacts-heading",
  lead: "Оставьте заявку — перезвоним, согласуем диагностику и назовём цену до ремонта. Без обязательств, пока вы не подтвердите смету.",
  benefits: [
    { id: "price", title: "Цена после согласования" },
    { id: "parts", title: "Оригинальные комплектующие" },
    { id: "warranty", title: "Гарантия 90 дней" },
  ] satisfies readonly ContactBenefit[],
  ctaLabel: "Оставить заявку",
  ctaHref: "#lead-form",
  phoneLabel: "Позвонить",
  formTitle: "Заявка на ремонт",
  formLead: "Имя, контакт и коротко о проблеме — этого достаточно, чтобы начать.",
  afterHint: "Ответим в рабочее время сервиса",
  channelsLabel: "Другие способы связи",
} as const;
