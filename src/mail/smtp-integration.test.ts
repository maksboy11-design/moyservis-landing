import type { AddressInfo } from "node:net";

import { SMTPServer } from "smtp-server";
import { afterEach, describe, expect, it } from "vitest";

import type { MailConfig } from "./config";
import { NodemailerProvider } from "./nodemailer-provider";

function smtpConfig(
  port: number,
  credentials: { user: string; password: string },
): MailConfig {
  return {
    enabled: true,
    from: "sender@example.test",
    replyTo: null,
    queuePath: ":memory:",
    smtp: {
      host: "127.0.0.1",
      port,
      secure: false,
      requireTls: false,
      rejectUnauthorized: false,
      user: credentials.user,
      password: credentials.password,
      connectionTimeoutMs: 1_000,
      socketTimeoutMs: 1_000,
    },
    worker: {
      concurrency: 1,
      pollIntervalMs: 50,
      leaseMs: 5_000,
      maxAttempts: 3,
      baseRetryMs: 100,
      maxRetryMs: 1_000,
      retentionMs: 60_000,
    },
  };
}

async function listen(server: SMTPServer): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    server.once("error", onError);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", onError);
      resolve();
    });
  });
  return (server.server.address() as AddressInfo).port;
}

async function closeServer(server: SMTPServer): Promise<void> {
  await new Promise<void>((resolve) => server.close(resolve));
}

describe("NodemailerProvider SMTP integration", () => {
  let server: SMTPServer | undefined;
  let provider: NodemailerProvider | undefined;

  afterEach(async () => {
    await provider?.close();
    if (server) await closeServer(server);
    provider = undefined;
    server = undefined;
  });

  it("verifies credentials and sends multipart HTML/text mail with an attachment", async () => {
    let rawMessage = "";
    let envelope: { from: string | false; recipients: string[] } | undefined;
    server = new SMTPServer({
      secure: false,
      authOptional: false,
      allowInsecureAuth: true,
      disabledCommands: ["STARTTLS"],
      disableReverseLookup: true,
      closeTimeout: 1_000,
      onAuth(auth, _session, callback) {
        if (auth.username === "local-user" && auth.password === "local-pass") {
          callback(null, { user: auth.username });
          return;
        }
        const error = Object.assign(new Error("Invalid credentials"), {
          responseCode: 535,
        });
        callback(error);
      },
      onData(stream, session, callback) {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on("end", () => {
          rawMessage = Buffer.concat(chunks).toString("utf8");
          envelope = {
            from: session.envelope.mailFrom ? session.envelope.mailFrom.address : false,
            recipients: session.envelope.rcptTo.map(({ address }) => address),
          };
          callback(null, "queued-locally");
        });
      },
    });
    const port = await listen(server);
    provider = new NodemailerProvider(
      smtpConfig(port, { user: "local-user", password: "local-pass" }),
    );

    await expect(provider.verify()).resolves.toMatchObject({ ok: true });
    const result = await provider.send({
      from: { name: "Local Sender", address: "sender@example.test" },
      to: "recipient@example.test",
      subject: "SMTP integration",
      text: "Hello plain text",
      html: "<p>Hello <strong>HTML</strong></p>",
      attachments: [
        {
          filename: "proof.txt",
          content: "attachment-body",
          contentType: "text/plain",
        },
      ],
    });

    expect(result).toMatchObject({
      ok: true,
      accepted: ["recipient@example.test"],
      rejected: [],
    });
    expect(envelope).toEqual({
      from: "sender@example.test",
      recipients: ["recipient@example.test"],
    });
    expect(rawMessage).toContain("Subject: SMTP integration");
    expect(rawMessage).toContain("Hello plain text");
    expect(rawMessage).toContain("<p>Hello <strong>HTML</strong></p>");
    expect(rawMessage).toMatch(/filename="?proof\.txt"?/);
    expect(rawMessage).toContain("YXR0YWNobWVudC1ib2R5");
  });

  it("reports invalid SMTP authentication as a permanent provider error", async () => {
    server = new SMTPServer({
      secure: false,
      authOptional: false,
      allowInsecureAuth: true,
      disabledCommands: ["STARTTLS"],
      disableReverseLookup: true,
      closeTimeout: 1_000,
      onAuth(_auth, _session, callback) {
        callback(
          Object.assign(new Error("Authentication rejected"), {
            responseCode: 535,
          }),
        );
      },
    });
    const port = await listen(server);
    provider = new NodemailerProvider(
      smtpConfig(port, { user: "wrong", password: "wrong" }),
    );

    const verification = await provider.verify();
    expect(verification).toMatchObject({
      ok: false,
      error: {
        code: "EAUTH",
        responseCode: 535,
        retryable: false,
      },
    });
  });
});
