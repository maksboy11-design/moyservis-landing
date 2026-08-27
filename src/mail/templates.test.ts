import { describe, expect, it } from "vitest";

import { escapeHtml, renderMail } from "./templates";

describe("mail templates", () => {
  it("escapes every HTML metacharacter", () => {
    expect(escapeHtml(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&#039;");
  });

  it.each([
    {
      template: "newLead" as const,
      data: {
        leadId: "lead-1",
        name: "Анна",
        phone: "+7 900 000-00-00",
        device: "Ноутбук",
        message: "Не включается",
        source: "landing",
        createdAt: "2026-08-04",
      },
      subject: "Новая заявка lead-1",
      htmlValues: ["Анна", "Ноутбук", "Не включается"],
      textValues: ["Имя: Анна", "Устройство: Ноутбук", "Сообщение: Не включается"],
    },
    {
      template: "callbackRequest" as const,
      data: {
        requestId: "callback-1",
        name: "Борис",
        phone: "+7 911 111-11-11",
        preferredTime: "После 18:00",
        comment: "Позвоните завтра",
      },
      subject: "Запрос обратного звонка callback-1",
      htmlValues: ["Борис", "После 18:00", "Позвоните завтра"],
      textValues: [
        "Имя: Борис",
        "Удобное время: После 18:00",
        "Комментарий: Позвоните завтра",
      ],
    },
    {
      template: "adminNotification" as const,
      data: {
        title: "Системное событие",
        message: "Требуется внимание",
        details: [{ label: "Узел", value: "smtp-1" }],
        actionUrl: "https://example.test/jobs/1?x=1&y=2",
        actionLabel: "Открыть",
      },
      subject: "Системное событие",
      htmlValues: ["Требуется внимание", "smtp-1", "Открыть"],
      textValues: [
        "Требуется внимание",
        "Узел: smtp-1",
        "Открыть: https://example.test/jobs/1?x=1&y=2",
      ],
    },
    {
      template: "customerAutoReply" as const,
      data: {
        customerName: "Вера",
        requestId: "request-1",
        summary: "Ремонт телефона",
        expectedResponseTime: "30 минут",
        contactPhone: "+7 922 222-22-22",
      },
      subject: "Мы получили обращение request-1",
      htmlValues: ["Здравствуйте, Вера!", "Ремонт телефона", "30 минут"],
      textValues: [
        "Здравствуйте, Вера!",
        "Обращение: Ремонт телефона",
        "Срок ответа: 30 минут",
      ],
    },
    {
      template: "serviceNotification" as const,
      data: {
        customerName: "Глеб",
        orderId: "order-1",
        status: "Готов",
        message: "Можно забирать",
        serviceName: "МойСервис",
        actionUrl: "http://example.test/orders/1",
        actionLabel: "Заказ",
      },
      subject: "Заказ order-1: Готов",
      htmlValues: ["Здравствуйте, Глеб!", "Можно забирать", "МойСервис"],
      textValues: [
        "Здравствуйте, Глеб!",
        "Комментарий: Можно забирать",
        "Сервис: МойСервис",
      ],
    },
  ])(
    "renders HTML and text for $template",
    ({ template, data, subject, htmlValues, textValues }) => {
      // The tuple is deliberately heterogeneous; renderMail itself still checks each public template type.
      const rendered = renderMail(template, data as never);
      expect(rendered.subject).toBe(subject);
      expect(rendered.html).toContain("<!doctype html>");
      expect(rendered.text).not.toContain("<table");
      for (const value of htmlValues) expect(rendered.html).toContain(value);
      for (const value of textValues) expect(rendered.text).toContain(value);
    },
  );

  it("escapes untrusted values, strips subject newlines, and rejects unsafe action URLs", () => {
    const attack = `<img src=x onerror="alert('x')">&`;
    const rendered = renderMail("adminNotification", {
      title: `Alert\r\nBcc: victim@example.test ${attack}`,
      message: attack,
      details: [{ label: attack, value: attack }],
      actionUrl: "javascript:alert(1)",
      actionLabel: attack,
    });

    expect(rendered.subject).not.toMatch(/[\r\n]/);
    expect(rendered.html).not.toContain("<img");
    expect(rendered.html).not.toContain("javascript:");
    expect(rendered.html).toContain(
      "&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt;&amp;",
    );
    expect(rendered.text).toContain(attack);
    expect(rendered.text).not.toContain("javascript:");
  });

  it("omits blank optional rows and uses the auto-reply fallback subject", () => {
    const rendered = renderMail("customerAutoReply", {
      customerName: "Ирина",
      summary: "   ",
    });
    expect(rendered.subject).toBe("Мы получили ваше обращение");
    expect(rendered.html).not.toContain("Обращение</th>");
    expect(rendered.text).not.toContain("Обращение:");
  });
});
