import { NextResponse } from "next/server";
import { fail } from "@/platform/errors/app-error";
import { toHttpResponse } from "@/platform/errors/http-response";
import {
  getSessionEmailHash,
  logAlphaEvent,
  type AlphaEventType
} from "@/platform/observability/alpha-events";
import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";
import type { ReportPeriod } from "@/modules/infonavit/types";

type AlphaClientEventType =
  | "report_period_changed"
  | "markdown_copied"
  | "markdown_downloaded"
  | "json_downloaded";

type ClientEventBody = Partial<ReportPeriod> & {
  event_type?: string;
};

type ClientEventDeps = {
  getSession: () => Promise<OptionalPlatformSession>;
  logEvent?: typeof logAlphaEvent;
};

const CLIENT_EVENT_TYPES = new Set<AlphaClientEventType>([
  "report_period_changed",
  "markdown_copied",
  "markdown_downloaded",
  "json_downloaded"
]);

export async function handleAlphaClientEvent(
  body: unknown,
  deps: ClientEventDeps
) {
  const session = await deps.getSession();

  if (!session) {
    return toHttpResponse({
      code: "AUTH_REQUIRED",
      message: "Se requiere sesion para registrar el evento.",
      status: 401
    });
  }

  const event = parseClientEventBody(body);

  if (!event.ok) {
    return toHttpResponse(event.error);
  }

  const logEvent = deps.logEvent ?? logAlphaEvent;
  logEvent({
    event_type: event.data.eventType,
    user_email_hash: getSessionEmailHash(session.user.email),
    module: "infonavit",
    route: "/api/alpha/events",
    action: event.data.eventType,
    result: "success",
    current_year: event.data.currentYear,
    previous_year: event.data.previousYear,
    month_limit: event.data.monthLimit
  });

  return NextResponse.json({ ok: true });
}

function parseClientEventBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return fail({
      code: "VALIDATION_ERROR",
      message: "Evento alpha invalido.",
      status: 422
    });
  }

  const value = body as ClientEventBody;

  if (!isClientEventType(value.event_type)) {
    return fail({
      code: "VALIDATION_ERROR",
      message: "Tipo de evento alpha no permitido.",
      status: 422
    });
  }

  return {
    ok: true as const,
    data: {
      eventType: value.event_type,
      currentYear: toOptionalNumber(value.currentYear),
      previousYear: toOptionalNumber(value.previousYear),
      monthLimit:
        value.monthLimit === null ? null : toOptionalNumber(value.monthLimit)
    }
  };
}

function isClientEventType(value: unknown): value is AlphaEventType {
  return typeof value === "string" && CLIENT_EVENT_TYPES.has(value as AlphaClientEventType);
}

function toOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
