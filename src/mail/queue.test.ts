import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MailQueue } from "./queue";
import type { MailSendRequest } from "./types";

const request = (
  overrides: Partial<MailSendRequest<"adminNotification">> = {},
): MailSendRequest<"adminNotification"> => ({
  template: "adminNotification",
  to: "recipient@example.test",
  data: { title: "Queue test", message: "Payload" },
  ...overrides,
});

describe("MailQueue", () => {
  let directory: string;
  const queues: MailQueue[] = [];

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "mail-queue-"));
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const queue of queues.splice(0)) queue.close();
    rmSync(directory, { recursive: true, force: true });
  });

  function open(name = "queue.sqlite"): MailQueue {
    const queue = new MailQueue(join(directory, name));
    queues.push(queue);
    return queue;
  }

  it("enqueues and restores the complete request and binary attachments", () => {
    const queue = open();
    const result = queue.enqueue(
      request({
        subject: "Subject\r\nBcc: hidden@example.test",
        to: { name: "Primary", address: "primary@example.test" },
        cc: ["cc@example.test"],
        bcc: "bcc@example.test",
        replyTo: "reply@example.test",
        priority: 9,
        attachments: [
          {
            filename: "report.txt",
            content: "hello",
            contentType: "text/plain",
            contentDisposition: "attachment",
          },
          {
            filename: "pixel.bin",
            content: new Uint8Array([0, 127, 255]),
            contentDisposition: "inline",
            cid: "pixel",
          },
        ],
      }),
    );

    expect(result.duplicate).toBe(false);
    const [job] = queue.claim(1, "worker", 5_000);
    expect(job).toMatchObject({
      id: result.jobId,
      subject: "Subject Bcc: hidden@example.test",
      to: { name: "Primary", address: "primary@example.test" },
      cc: ["cc@example.test"],
      bcc: "bcc@example.test",
      replyTo: "reply@example.test",
      attempts: 1,
      priority: 9,
    });
    expect(job?.attachments[0]).toMatchObject({
      filename: "report.txt",
      contentType: "text/plain",
      contentDisposition: "attachment",
    });
    expect([...((job?.attachments[0]?.content as Uint8Array) ?? [])]).toEqual([
      104, 101, 108, 108, 111,
    ]);
    expect([...((job?.attachments[1]?.content as Uint8Array) ?? [])]).toEqual([
      0, 127, 255,
    ]);
  });

  it("deduplicates idempotency keys without adding duplicate attachments", () => {
    const queue = open();
    const first = queue.enqueue(
      request({
        idempotencyKey: "same-operation",
        attachments: [{ filename: "first.txt", content: "first" }],
      }),
    );
    const duplicate = queue.enqueue(
      request({
        idempotencyKey: "same-operation",
        attachments: [{ filename: "second.txt", content: "second" }],
      }),
    );

    expect(duplicate).toEqual({ jobId: first.jobId, duplicate: true });
    const [job] = queue.claim(1, "owner", 5_000);
    expect(job?.attachments).toHaveLength(1);
    expect(job?.attachments[0]?.filename).toBe("first.txt");
  });

  it("rolls back the job atomically when attachment persistence fails", () => {
    const queue = open();
    expect(() =>
      queue.enqueue(
        request({
          attachments: [
            {
              filename: "invalid.bin",
              content: null as unknown as Uint8Array,
            },
          ],
        }),
      ),
    ).toThrow();
    expect(queue.healthCheck()).toEqual({ ok: true, pending: 0 });
  });

  it("claims by priority and atomically prevents claims by a second connection", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T10:00:00Z"));
    const first = open();
    const second = open();
    const low = first.enqueue(request({ priority: 1 }));
    vi.advanceTimersByTime(1);
    const high = first.enqueue(request({ priority: 10 }));

    expect(first.claim(1, "worker-a", 10_000)[0]?.id).toBe(high.jobId);
    expect(second.claim(10, "worker-b", 10_000).map((job) => job.id)).toEqual([
      low.jobId,
    ]);
    expect(first.claim(10, "worker-c", 10_000)).toEqual([]);
  });

  it("recovers an expired lease and rejects stale-owner completion", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T10:00:00Z"));
    const queue = open();
    const enqueued = queue.enqueue(request());
    expect(queue.claim(1, "old-owner", 5_000)[0]?.attempts).toBe(1);

    vi.advanceTimersByTime(5_001);
    const [recovered] = queue.claim(1, "new-owner", 5_000);
    expect(recovered).toMatchObject({ id: enqueued.jobId, attempts: 2 });
    expect(queue.markSent(enqueued.jobId, "old-owner", "stale")).toBe(false);
    expect(queue.markSent(enqueued.jobId, "new-owner", "fresh")).toBe(true);
  });

  it("renews leases and schedules retryable failures", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T10:00:00Z"));
    const queue = open();
    const { jobId } = queue.enqueue(request());
    const [job] = queue.claim(1, "owner", 5_000);
    expect(queue.renewLease(jobId, "owner", 10_000)).toBe(true);
    expect(queue.renewLease(jobId, "other", 10_000)).toBe(false);

    expect(
      queue.markFailed(jobId, "owner", {
        error: "temporary",
        retryable: true,
        attempts: job?.attempts ?? 1,
        maxAttempts: 3,
        retryAt: Date.now() + 2_000,
      }),
    ).toBe("queued");
    expect(queue.claim(1, "other", 5_000)).toEqual([]);
    vi.advanceTimersByTime(2_000);
    expect(queue.claim(1, "other", 5_000)[0]).toMatchObject({
      id: jobId,
      attempts: 2,
    });
  });

  it("deletes completed jobs only after retention and cascades attachments", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T10:00:00Z"));
    const queue = open();
    const { jobId } = queue.enqueue(
      request({ attachments: [{ filename: "done.txt", content: "done" }] }),
    );
    queue.claim(1, "owner", 5_000);
    expect(queue.markSent(jobId, "owner", "message-1")).toBe(true);
    expect(queue.cleanup(60_000)).toBe(0);

    vi.advanceTimersByTime(60_001);
    expect(queue.cleanup(60_000)).toBe(1);
    expect(queue.healthCheck()).toEqual({ ok: true, pending: 0 });
  });

  it("moves permanent and exhausted failures to dead", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T10:00:00Z"));
    const queue = open();
    const permanent = queue.enqueue(request());
    const exhausted = queue.enqueue(request());
    const jobs = queue.claim(2, "owner", 5_000);

    expect(
      queue.markFailed(permanent.jobId, "owner", {
        error: "bad recipient",
        retryable: false,
        attempts: 1,
        maxAttempts: 3,
        retryAt: Date.now(),
      }),
    ).toBe("dead");
    expect(
      queue.markFailed(exhausted.jobId, "owner", {
        error: "timeout",
        retryable: true,
        attempts: jobs.find((job) => job.id === exhausted.jobId)?.attempts ?? 1,
        maxAttempts: 1,
        retryAt: Date.now(),
      }),
    ).toBe("dead");
    vi.advanceTimersByTime(1);
    expect(queue.cleanup(0)).toBe(2);
  });
});
