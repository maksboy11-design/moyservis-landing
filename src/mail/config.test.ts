import { isAbsolute } from "node:path";

import { describe, expect, it } from "vitest";

import { readMailConfig } from "./config";

describe("readMailConfig", () => {
  it("returns safe disabled defaults", () => {
    const result = readMailConfig({});
    expect(result).toEqual({
      ok: true,
      config: expect.objectContaining({
        enabled: false,
        from: null,
        replyTo: null,
        smtp: expect.objectContaining({
          host: null,
          port: 587,
          secure: false,
          requireTls: false,
          rejectUnauthorized: true,
          user: null,
          password: null,
        }),
        worker: expect.objectContaining({
          concurrency: 4,
          maxAttempts: 8,
        }),
      }),
    });
    if (result.ok) expect(isAbsolute(result.config.queuePath)).toBe(true);
  });

  it("parses a complete valid config including all TLS flags", () => {
    const result = readMailConfig({
      MAIL_ENABLED: "YES",
      MAIL_FROM: '"Service Robot" <robot@example.test>',
      MAIL_REPLY_TO: "support@example.test",
      MAIL_QUEUE_PATH: ":memory:",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "2465",
      SMTP_SECURE: "on",
      SMTP_REQUIRE_TLS: "1",
      SMTP_TLS_REJECT_UNAUTHORIZED: "false",
      SMTP_USER: "user",
      SMTP_PASSWORD: "password",
      SMTP_CONNECTION_TIMEOUT_MS: "1000",
      SMTP_SOCKET_TIMEOUT_MS: "2000",
      MAIL_WORKER_CONCURRENCY: "7",
      MAIL_POLL_INTERVAL_MS: "50",
      MAIL_LEASE_MS: "5000",
      MAIL_MAX_ATTEMPTS: "3",
      MAIL_BASE_RETRY_MS: "100",
      MAIL_MAX_RETRY_MS: "1000",
      MAIL_RETENTION_MS: "60000",
    });

    expect(result).toEqual({
      ok: true,
      config: {
        enabled: true,
        from: { name: "Service Robot", address: "robot@example.test" },
        replyTo: "support@example.test",
        queuePath: ":memory:",
        smtp: {
          host: "127.0.0.1",
          port: 2465,
          secure: true,
          requireTls: true,
          rejectUnauthorized: false,
          user: "user",
          password: "password",
          connectionTimeoutMs: 1000,
          socketTimeoutMs: 2000,
        },
        worker: {
          concurrency: 7,
          pollIntervalMs: 50,
          leaseMs: 5000,
          maxAttempts: 3,
          baseRetryMs: 100,
          maxRetryMs: 1000,
          retentionMs: 60000,
        },
      },
    });
  });

  it.each([
    [{ MAIL_ENABLED: "maybe" }, "MAIL_ENABLED must be a boolean"],
    [{ SMTP_SECURE: "sometimes" }, "SMTP_SECURE must be a boolean"],
    [{ SMTP_REQUIRE_TLS: "invalid" }, "SMTP_REQUIRE_TLS must be a boolean"],
    [
      { SMTP_TLS_REJECT_UNAUTHORIZED: "invalid" },
      "SMTP_TLS_REJECT_UNAUTHORIZED must be a boolean",
    ],
    [{ SMTP_PORT: "0" }, "SMTP_PORT must be an integer from 1 to 65535"],
    [
      { MAIL_WORKER_CONCURRENCY: "2.5" },
      "MAIL_WORKER_CONCURRENCY must be an integer from 1 to 32",
    ],
    [{ MAIL_FROM: "not-an-email" }, "MAIL_FROM must contain a valid email address"],
    [{ MAIL_REPLY_TO: "broken@" }, "MAIL_REPLY_TO must contain a valid email address"],
    [{ SMTP_USER: "user" }, "SMTP_USER and SMTP_PASSWORD must be set together"],
    [{ SMTP_PASSWORD: "secret" }, "SMTP_USER and SMTP_PASSWORD must be set together"],
    [
      { MAIL_BASE_RETRY_MS: "2000", MAIL_MAX_RETRY_MS: "1000" },
      "MAIL_BASE_RETRY_MS cannot exceed MAIL_MAX_RETRY_MS",
    ],
  ] as const)("rejects invalid environment %j", (environment, error) => {
    const result = readMailConfig(environment);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain(error);
  });

  it("requires host/from and a lease longer than SMTP timeouts when enabled", () => {
    const missing = readMailConfig({ MAIL_ENABLED: "true" });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.errors).toEqual(
        expect.arrayContaining([
          "SMTP_HOST is required when mail is enabled",
          "MAIL_FROM is required when mail is enabled",
        ]),
      );
    }

    const shortLease = readMailConfig({
      MAIL_ENABLED: "true",
      SMTP_HOST: "localhost",
      MAIL_FROM: "sender@example.test",
      SMTP_CONNECTION_TIMEOUT_MS: "2000",
      SMTP_SOCKET_TIMEOUT_MS: "3000",
      MAIL_LEASE_MS: "5000",
    });
    expect(shortLease.ok).toBe(false);
    if (!shortLease.ok) {
      expect(shortLease.errors).toContain(
        "MAIL_LEASE_MS must exceed the combined SMTP connection and socket timeouts",
      );
    }
  });
});
