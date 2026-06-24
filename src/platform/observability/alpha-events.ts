import { createHash, randomUUID } from "node:crypto";

export type AlphaEventType =
  | "login_success"
  | "login_denied_not_invited"
  | "logout"
  | "report_viewed"
  | "report_period_changed"
  | "capability_denied"
  | "api_error"
  | "markdown_copied"
  | "markdown_downloaded"
  | "json_downloaded";

export type AlphaEvent = {
  event_type: AlphaEventType;
  user_email_hash?: string;
  module?: string;
  route?: string;
  action?: string;
  result?: "success" | "denied" | "error";
  capability?: string;
  error_code?: string;
  correlation_id?: string;
  current_year?: number;
  previous_year?: number;
  month_limit?: number | null;
};

export type AlphaLogRecord = AlphaEvent & {
  timestamp: string;
};

const ALLOWED_KEYS = new Set<keyof AlphaLogRecord>([
  "timestamp",
  "event_type",
  "user_email_hash",
  "module",
  "route",
  "action",
  "result",
  "capability",
  "error_code",
  "correlation_id",
  "current_year",
  "previous_year",
  "month_limit"
]);

export function createCorrelationId() {
  return randomUUID();
}

export function hashEmail(email: string) {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function buildAlphaLogRecord(
  event: AlphaEvent,
  now = new Date()
): AlphaLogRecord {
  const record: AlphaLogRecord = {
    timestamp: now.toISOString(),
    ...event,
    correlation_id: event.correlation_id ?? createCorrelationId()
  };

  return sanitizeAlphaLogRecord(record);
}

export function logAlphaEvent(event: AlphaEvent) {
  const record = buildAlphaLogRecord(event);
  console.info(JSON.stringify(record));
  return record;
}

export function getSessionEmailHash(email: string | undefined | null) {
  return email ? hashEmail(email) : undefined;
}

export function sanitizeAlphaLogRecord(record: AlphaLogRecord): AlphaLogRecord {
  const sanitized: Partial<AlphaLogRecord> = {};

  for (const [key, value] of Object.entries(record)) {
    if (!ALLOWED_KEYS.has(key as keyof AlphaLogRecord)) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    sanitized[key as keyof AlphaLogRecord] = value as never;
  }

  return sanitized as AlphaLogRecord;
}
