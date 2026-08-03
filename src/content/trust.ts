/**
 * Trust proof content — PRD proof matrix + IA About/Masters/Guarantees/Reviews.
 */

export const trustStats = [
  { id: "years", value: "с 2017", label: "года работаем" },
  { id: "repairs", value: "600+", label: "ремонтов" },
  { id: "warranty", value: "90 дней", label: "гарантия на работы" },
  { id: "speed", value: "1–2 дня", label: "большинство ремонтов" },
] as const;

export const deviceBrands = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Huawei",
  "Honor",
  "ASUS",
  "Lenovo",
  "HP",
  "Sony",
  "Microsoft",
] as const;

export const certificates = [
  {
    id: "diag",
    title: "Сертификаты по диагностике",
    body: "Инженеры проходят внутреннюю аттестацию по мобильной и компьютерной технике.",
  },
  {
    id: "parts",
    title: "Работа с оригинальными поставками",
    body: "Комплектующие закупаем у проверенных поставщиков, партия фиксируется в акте.",
  },
  {
    id: "safety",
    title: "Стандарты безопасного ремонта",
    body: "Антистатическая зона, учёт устройств и фотофиксация состояния при приёме.",
  },
] as const;

export const licenses = [
  {
    id: "ip",
    title: "Обработка персональных данных",
    body: "Заявки и контакты обрабатываем по политике конфиденциальности сервиса.",
  },
  {
    id: "consumer",
    title: "Защита прав потребителя",
    body: "Условия гарантии и стоимость работ фиксируем до начала ремонта.",
  },
] as const;
