import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

import type {
  MailAddress,
  MailAttachment,
  MailSendRequest,
  MailTemplateMap,
  MailTemplateName,
} from "./types";

type RunResult = { changes: number | bigint; lastInsertRowid: number | bigint };
type Statement = {
  run(...parameters: unknown[]): RunResult;
  get(...parameters: unknown[]): unknown;
  all(...parameters: unknown[]): unknown[];
};
type Database = {
  pragma(source: string): unknown;
  exec(source: string): void;
  prepare(source: string): Statement;
  transaction<T>(callback: () => T): () => T;
  close(): void;
};
type BetterSqlite3 = new (filename: string) => Database;

type JobRow = {
  id: string;
  template: MailTemplateName;
  subject: string | null;
  payload_json: string | null;
  to_json: string | null;
  cc_json: string | null;
  bcc_json: string | null;
  reply_to_json: string | null;
  attempts: number;
  priority: number;
  created_at: number;
};

type AttachmentRow = {
  filename: string;
  content: Uint8Array;
  content_type: string | null;
  content_disposition: "attachment" | "inline" | null;
  cid: string | null;
};

export type ClaimedMailJob = {
  id: string;
  template: MailTemplateName;
  subject?: string;
  data: MailTemplateMap[MailTemplateName];
  to: MailAddress | MailAddress[];
  cc?: MailAddress | MailAddress[];
  bcc?: MailAddress | MailAddress[];
  replyTo?: MailAddress;
  attachments: MailAttachment[];
  attempts: number;
  priority: number;
  createdAt: number;
};

export type QueueEnqueueResult = {
  jobId: string;
  duplicate: boolean;
};

function loadDatabase(filename: string): Database {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const require = createRequire(import.meta.url);
  const imported = require("better-sqlite3") as
    BetterSqlite3 | { default: BetterSqlite3 };
  const Constructor = typeof imported === "function" ? imported : imported.default;
  return new Constructor(filename);
}

function encode(value: unknown): string {
  return JSON.stringify(value);
}

function decode<T>(value: string | null): T | undefined {
  return value === null ? undefined : (JSON.parse(value) as T);
}

function assertJobPayload(row: JobRow): asserts row is JobRow & {
  payload_json: string;
  to_json: string;
} {
  if (!row.payload_json || !row.to_json) {
    throw new Error(`Mail job ${row.id} has no deliverable payload`);
  }
}

export class MailQueue {
  private readonly db: Database;

  constructor(filename: string) {
    this.db = loadDatabase(filename);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("synchronous = NORMAL");
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("busy_timeout = 5000");
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mail_jobs (
        id TEXT PRIMARY KEY,
        idempotency_key TEXT UNIQUE,
        template TEXT NOT NULL,
        subject TEXT,
        payload_json TEXT,
        to_json TEXT,
        cc_json TEXT,
        bcc_json TEXT,
        reply_to_json TEXT,
        status TEXT NOT NULL DEFAULT 'queued'
          CHECK (status IN ('queued', 'processing', 'sent', 'dead')),
        priority INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        available_at INTEGER NOT NULL,
        lease_owner TEXT,
        lease_expires_at INTEGER,
        last_error TEXT,
        provider_message_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS mail_jobs_claim_idx
        ON mail_jobs(status, available_at, priority DESC, created_at);
      CREATE INDEX IF NOT EXISTS mail_jobs_lease_idx
        ON mail_jobs(status, lease_expires_at);
      CREATE INDEX IF NOT EXISTS mail_jobs_completed_idx
        ON mail_jobs(status, completed_at);
      CREATE TABLE IF NOT EXISTS mail_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL REFERENCES mail_jobs(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        content BLOB NOT NULL,
        content_type TEXT,
        content_disposition TEXT,
        cid TEXT
      );
      CREATE INDEX IF NOT EXISTS mail_attachments_job_idx
        ON mail_attachments(job_id);
    `);
    const columns = this.db.prepare("PRAGMA table_info(mail_jobs)").all() as Array<{
      name: string;
    }>;
    if (!columns.some((column) => column.name === "subject")) {
      this.db.exec("ALTER TABLE mail_jobs ADD COLUMN subject TEXT");
    }
  }

  enqueue<K extends MailTemplateName>(request: MailSendRequest<K>): QueueEnqueueResult {
    const now = Date.now();
    const id = randomUUID();
    const insertJob = this.db.prepare(`
      INSERT OR IGNORE INTO mail_jobs (
        id, idempotency_key, template, subject, payload_json, to_json, cc_json,
        bcc_json, reply_to_json, priority, available_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAttachment = this.db.prepare(`
      INSERT INTO mail_attachments (
        job_id, filename, content, content_type, content_disposition, cid
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const findDuplicate = this.db.prepare(
      "SELECT id FROM mail_jobs WHERE idempotency_key = ?",
    );

    const execute = this.db.transaction((): QueueEnqueueResult => {
      const result = insertJob.run(
        id,
        request.idempotencyKey ?? null,
        request.template,
        request.subject
          ?.replace(/[\r\n]+/g, " ")
          .trim()
          .slice(0, 200) || null,
        encode(request.data),
        encode(request.to),
        request.cc ? encode(request.cc) : null,
        request.bcc ? encode(request.bcc) : null,
        request.replyTo ? encode(request.replyTo) : null,
        request.priority ?? 0,
        now,
        now,
        now,
      );

      if (Number(result.changes) === 0) {
        const duplicate = findDuplicate.get(request.idempotencyKey ?? null) as
          { id: string } | undefined;
        if (!duplicate) throw new Error("Unable to resolve duplicate mail job");
        return { jobId: duplicate.id, duplicate: true };
      }

      for (const attachment of request.attachments ?? []) {
        insertAttachment.run(
          id,
          attachment.filename,
          Buffer.from(attachment.content),
          attachment.contentType ?? null,
          attachment.contentDisposition ?? null,
          attachment.cid ?? null,
        );
      }
      return { jobId: id, duplicate: false };
    });

    return execute();
  }

  claim(limit: number, owner: string, leaseMs: number): ClaimedMailJob[] {
    const now = Date.now();
    const leaseExpiresAt = now + leaseMs;
    const select = this.db.prepare(`
      SELECT id FROM mail_jobs
      WHERE
        (status = 'queued' AND available_at <= ?)
        OR (status = 'processing' AND lease_expires_at < ?)
      ORDER BY priority DESC, created_at ASC
      LIMIT ?
    `);

    const execute = this.db.transaction((): string[] => {
      const ids = (select.all(now, now, limit) as Array<{ id: string }>).map(
        ({ id }) => id,
      );
      const claimOne = this.db.prepare(`
        UPDATE mail_jobs SET
          status = 'processing',
          lease_owner = ?,
          lease_expires_at = ?,
          attempts = attempts + 1,
          updated_at = ?
        WHERE id = ? AND (
          (status = 'queued' AND available_at <= ?)
          OR (status = 'processing' AND lease_expires_at < ?)
        )
      `);
      return ids.filter(
        (id) =>
          Number(claimOne.run(owner, leaseExpiresAt, now, id, now, now).changes) === 1,
      );
    });

    const ids = execute();
    if (ids.length === 0) return [];
    const getJob = this.db.prepare("SELECT * FROM mail_jobs WHERE id = ?");
    const getAttachments = this.db.prepare(
      "SELECT filename, content, content_type, content_disposition, cid FROM mail_attachments WHERE job_id = ? ORDER BY id",
    );

    const claimed: ClaimedMailJob[] = [];
    for (const id of ids) {
      try {
        const row = getJob.get(id) as JobRow;
        assertJobPayload(row);
        const attachments = getAttachments.all(id) as AttachmentRow[];
        claimed.push({
          id: row.id,
          template: row.template,
          ...(row.subject ? { subject: row.subject } : {}),
          data: decode<MailTemplateMap[MailTemplateName]>(row.payload_json)!,
          to: decode<MailAddress | MailAddress[]>(row.to_json)!,
          ...(row.cc_json
            ? { cc: decode<MailAddress | MailAddress[]>(row.cc_json) }
            : {}),
          ...(row.bcc_json
            ? { bcc: decode<MailAddress | MailAddress[]>(row.bcc_json) }
            : {}),
          ...(row.reply_to_json
            ? { replyTo: decode<MailAddress>(row.reply_to_json) }
            : {}),
          attachments: attachments.map((attachment) => ({
            filename: attachment.filename,
            content: new Uint8Array(attachment.content),
            ...(attachment.content_type ? { contentType: attachment.content_type } : {}),
            ...(attachment.content_disposition
              ? { contentDisposition: attachment.content_disposition }
              : {}),
            ...(attachment.cid ? { cid: attachment.cid } : {}),
          })),
          attempts: row.attempts,
          priority: row.priority,
          createdAt: row.created_at,
        });
      } catch (error) {
        this.finish(
          id,
          owner,
          "dead",
          error instanceof Error ? error.message : "Corrupt mail job",
          null,
        );
      }
    }
    return claimed;
  }

  markSent(jobId: string, owner: string, messageId: string): boolean {
    return this.finish(jobId, owner, "sent", null, messageId);
  }

  renewLease(jobId: string, owner: string, leaseMs: number): boolean {
    const now = Date.now();
    const result = this.db
      .prepare(
        `
        UPDATE mail_jobs SET lease_expires_at = ?, updated_at = ?
        WHERE id = ? AND status = 'processing' AND lease_owner = ?
      `,
      )
      .run(now + leaseMs, now, jobId, owner);
    return Number(result.changes) === 1;
  }

  markFailed(
    jobId: string,
    owner: string,
    options: {
      error: string;
      retryable: boolean;
      attempts: number;
      maxAttempts: number;
      retryAt: number;
    },
  ): "queued" | "dead" | "lease_lost" {
    if (options.retryable && options.attempts < options.maxAttempts) {
      const result = this.db
        .prepare(
          `
          UPDATE mail_jobs SET
            status = 'queued', available_at = ?, lease_owner = NULL,
            lease_expires_at = NULL, last_error = ?, updated_at = ?
          WHERE id = ? AND status = 'processing' AND lease_owner = ?
        `,
        )
        .run(options.retryAt, options.error.slice(0, 1_000), Date.now(), jobId, owner);
      return Number(result.changes) === 1 ? "queued" : "lease_lost";
    }

    return this.finish(jobId, owner, "dead", options.error, null) ? "dead" : "lease_lost";
  }

  private finish(
    jobId: string,
    owner: string,
    status: "sent" | "dead",
    error: string | null,
    messageId: string | null,
  ): boolean {
    const execute = this.db.transaction((): boolean => {
      const now = Date.now();
      const result = this.db
        .prepare(
          `
          UPDATE mail_jobs SET
            status = ?, payload_json = NULL, to_json = NULL, cc_json = NULL,
            bcc_json = NULL, reply_to_json = NULL, lease_owner = NULL,
            lease_expires_at = NULL, last_error = ?,
            provider_message_id = ?, completed_at = ?, updated_at = ?
          WHERE id = ? AND status = 'processing' AND lease_owner = ?
        `,
        )
        .run(status, error?.slice(0, 1_000) ?? null, messageId, now, now, jobId, owner);
      if (Number(result.changes) !== 1) return false;
      this.db.prepare("DELETE FROM mail_attachments WHERE job_id = ?").run(jobId);
      return true;
    });
    return execute();
  }

  healthCheck(): { ok: true; pending: number } | { ok: false; error: string } {
    try {
      const row = this.db
        .prepare(
          "SELECT COUNT(*) AS count FROM mail_jobs WHERE status IN ('queued', 'processing')",
        )
        .get() as { count: number };
      this.db.prepare("SELECT 1").get();
      return { ok: true, pending: row.count };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Queue check failed",
      };
    }
  }

  cleanup(retentionMs: number): number {
    const result = this.db
      .prepare(
        "DELETE FROM mail_jobs WHERE status IN ('sent', 'dead') AND completed_at < ?",
      )
      .run(Date.now() - retentionMs);
    return Number(result.changes);
  }

  close(): void {
    this.db.close();
  }
}
