import { NextResponse } from "next/server";
import { parseReportPeriod } from "@/modules/infonavit/api/period";
import { toHttpResponse } from "@/platform/errors/http-response";
import { requireCapability } from "@/platform/permissions/capabilities";
import {
  getSessionEmailHash,
  logAlphaEvent
} from "@/platform/observability/alpha-events";
import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";
import type { Result } from "@/platform/errors/app-error";
import type { ReportPeriod } from "@/modules/infonavit/types";

type ReportRequestLike = {
  nextUrl: {
    searchParams: URLSearchParams;
  };
};

type ExtendedReportDeps<T> = {
  getSession: () => Promise<OptionalPlatformSession>;
  getReport: (period: ReportPeriod) => Promise<Result<T>>;
  route: string;
  action: string;
  logEvent?: typeof logAlphaEvent;
};

export async function handleExtendedReportRequest<T>(
  request: ReportRequestLike,
  deps: ExtendedReportDeps<T>
) {
  const logEvent = deps.logEvent ?? logAlphaEvent;
  const session = await deps.getSession();
  const userEmailHash = getSessionEmailHash(session?.user.email);
  const access = requireCapability(session, "view_report");

  if (!access.ok) {
    logEvent({
      event_type: "capability_denied",
      ...(userEmailHash ? { user_email_hash: userEmailHash } : {}),
      module: "infonavit",
      route: deps.route,
      action: deps.action,
      result: "denied",
      capability: "view_report",
      error_code: access.error.code
    });

    return toHttpResponse(access.error);
  }

  const period = parseReportPeriod(request.nextUrl.searchParams);

  if (!period.ok) {
    return toHttpResponse(period.error);
  }

  const result = await deps.getReport(period.data);

  if (!result.ok) {
    logEvent({
      event_type: "api_error",
      ...(userEmailHash ? { user_email_hash: userEmailHash } : {}),
      module: "infonavit",
      route: deps.route,
      action: deps.action,
      result: "error",
      error_code: result.error.code,
      current_year: period.data.currentYear,
      previous_year: period.data.previousYear,
      month_limit: period.data.monthLimit
    });

    return toHttpResponse(result.error);
  }

  logEvent({
    event_type: "report_viewed",
    ...(userEmailHash ? { user_email_hash: userEmailHash } : {}),
    module: "infonavit",
    route: deps.route,
    action: deps.action,
    result: "success",
    capability: "view_report",
    current_year: period.data.currentYear,
    previous_year: period.data.previousYear,
    month_limit: period.data.monthLimit
  });

  return NextResponse.json(result.data);
}
