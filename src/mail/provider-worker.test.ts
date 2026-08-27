import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { MailConfig } from "./config";
import {
  classifyProviderError,
  type MailProvider,
  type ProviderHealthResult,
} from "./provider";
import { MailQueue } from "./queue";
import type { ProviderMessage, ProviderSendResult } from "./types";
import { MailWorker } from "./worker";

const config = (overrides: Partial<MailConfig["worker"]> = {}): MailConfig => ({
  enabled: true,
  from: "sender@example.test",
  replyTo: "reply@example.test",
  queuePath: ":memory:",
  smtp: {
    host: "127.0.0.1",
    port: 2525,
    secure: false,
    requireTls: false,
    rejectUnauthorized: false,
    user: null,
    password: null,
    connectionTimeoutMs: 100,
    socketTimeoutMs: 100,
  },
  worker: {
    concurrency: 2,
    pollIntervalMs: 10,
    leaseMs: 5_000,
    maxAttempts: 3,
    baseRetryMs: 100,
    maxRetryMs: 100,
    retentionMs: 60_000,
    ...overrides,
  },
});

class StubProvider implements MailProvider {
  readonly messages: ProviderMessage[] = [];
  closed = false;

  constructor(private readonly results: ProviderSendResult[]) {}

  async send(message: ProviderMessage): Promise<ProviderSendResult> {
    this.messages.push(message);
    return (
      this.results.shift() ?? {
        ok: true,
        messageId: `message-${this.messages.length}`,
        accepted: ["recipient@example.test"],
        rejected: [],
      }
    );
  }

  async verify(): Promise<ProviderHealthResult> {
    return { ok: true, latencyMs: 0 };
  }

  async healthCheck(): Promise<ProviderHealthResult> {
    return this.verify();
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

async function waitFor(assertion: () => boolean, timeoutMs = 3_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!assertion()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for worker");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function pending(queue: MailQueue): number {
  const health = queue.healthCheck();
  if (!health.ok) throw new Error(health.error);
  return health.pending;
}

describe("classifyProviderError", () => {
  it.each([
    ["authentication", { code: "EAUTH", responseCode: 535 }, false],
    ["recipient envelope", { code: "EENVELOPE", responseCode: 550 }, false],
    ["timeout", { code: "ETIMEDOUT" }, true],
    ["temporary DNS", { code: "EAI_AGAIN" }, true],
    ["permanent DNS", { code: "ENOTFOUND" }, false],
    ["SMTP 421", { responseCode: 421 }, true],
    ["SMTP 450", { responseCode: 450 }, true],
    ["SMTP 550", { responseCode: 550 }, false],
  ] as const)("classifies %s", (_name, fields, retryable) => {
    const error = Object.assign(new Error(`failure-${_name}`), fields);
    expect(classifyProviderError(error)).toEqual({
      message: `failure-${_name}`,
      ...fields,
      retryable,
    });
  });

  it("normalizes unknown values and truncates provider messages", () => {
    expect(classifyProviderError("failure")).toEqual({
      message: "Unknown mail provider error",
      retryable: false,
    });
    expect(classifyProviderError(new Error("x".repeat(700))).message).toHaveLength(500);
  });
});

describe("MailWorker", () => {
  let directory: string | undefined;
  let queue: MailQueue | undefined;
  let worker: MailWorker | undefined;
  let running: Promise<void> | undefined;

  afterEach(async () => {
    await worker?.stop();
    await running;
    queue?.close();
    if (directory) rmSync(directory, { recursive: true, force: true });
    directory = undefined;
    queue = undefined;
    worker = undefined;
    running = undefined;
    vi.restoreAllMocks();
  });

  function setup(provider: MailProvider, workerConfig = config()) {
    directory = mkdtempSync(join(tmpdir(), "mail-worker-"));
    queue = new MailQueue(join(directory, "queue.sqlite"));
    worker = new MailWorker(queue, provider, workerConfig);
    return queue;
  }

  it("sends a rendered message with addressing, subject override, and attachment", async () => {
    const provider = new StubProvider([]);
    const mailQueue = setup(provider);
    mailQueue.enqueue({
      template: "newLead",
      data: { leadId: "lead-42", name: "Анна", phone: "+70000000000" },
      to: "recipient@example.test",
      cc: "cc@example.test",
      bcc: "bcc@example.test",
      replyTo: "custom-reply@example.test",
      subject: "Custom subject",
      attachments: [{ filename: "lead.txt", content: "attachment" }],
    });

    running = worker!.start();
    await waitFor(() => provider.messages.length === 1 && pending(mailQueue) === 0);
    await worker!.stop();
    await running;

    expect(provider.messages[0]).toMatchObject({
      from: "sender@example.test",
      to: "recipient@example.test",
      cc: "cc@example.test",
      bcc: "bcc@example.test",
      replyTo: "custom-reply@example.test",
      subject: "Custom subject",
      attachments: [{ filename: "lead.txt" }],
    });
    expect(provider.messages[0]?.html).toContain("lead-42");
    expect(provider.messages[0]?.text).toContain("Номер заявки: lead-42");
    expect(provider.closed).toBe(true);
  });

  it("retries a temporary provider failure and then succeeds", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const provider = new StubProvider([
      {
        ok: false,
        error: { message: "timeout", code: "ETIMEDOUT", retryable: true },
      },
      {
        ok: true,
        messageId: "retry-success",
        accepted: ["recipient@example.test"],
        rejected: [],
      },
    ]);
    const mailQueue = setup(provider);
    mailQueue.enqueue({
      template: "adminNotification",
      data: { title: "Retry", message: "Retry me" },
      to: "recipient@example.test",
    });

    running = worker!.start();
    await waitFor(() => provider.messages.length === 2 && pending(mailQueue) === 0);
    expect(provider.messages).toHaveLength(2);
  });

  it("does not retry a permanent failure and marks the job dead", async () => {
    const provider = new StubProvider([
      {
        ok: false,
        error: {
          message: "invalid recipient",
          code: "EENVELOPE",
          responseCode: 550,
          retryable: false,
        },
      },
    ]);
    const mailQueue = setup(provider);
    mailQueue.enqueue({
      template: "callbackRequest",
      data: {
        requestId: "request-1",
        name: "Борис",
        phone: "+71111111111",
      },
      to: "invalid@example.test",
    });

    running = worker!.start();
    await waitFor(() => provider.messages.length === 1 && pending(mailQueue) === 0);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(provider.messages).toHaveLength(1);
    expect(mailQueue.cleanup(0)).toBe(1);
  });
});
