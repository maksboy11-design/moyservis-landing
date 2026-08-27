import type { LeadPayload } from "@/domain/lead/types";

/** Canonical event passed to every notify adapter. */
export type LeadNotifyEvent = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  message?: string;
  deviceType: LeadPayload["deviceType"];
  contactPref: LeadPayload["contactPref"];
  callback: boolean;
  consent: boolean;
  source: string;
  channel: NonNullable<LeadPayload["channel"]>;
};

export type NotifyChannel = "max" | "email";

export type AdapterAttemptResult = {
  channel: NotifyChannel;
  /** Channel not configured — skipped, not a failure. */
  skipped: boolean;
  ok: boolean;
  attempts: number;
  latencyMs: number;
  error?: string;
};

export type NotifyLeadResult =
  | {
      ok: true;
      reason?: undefined;
      channels: AdapterAttemptResult[];
    }
  | {
      ok: false;
      reason: "not_configured" | "upstream_error";
      channels: AdapterAttemptResult[];
    };

export type NotifyAdapter = {
  channel: NotifyChannel;
  isConfigured: () => boolean;
  send: (event: LeadNotifyEvent) => Promise<AdapterAttemptResult>;
};
