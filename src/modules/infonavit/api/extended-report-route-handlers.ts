import { NextResponse } from "next/server";
import { parseReportPeriod } from "@/modules/infonavit/api/period";
import { toHttpResponse } from "@/platform/errors/http-response";
import { requireCapability } from "@/platform/permissions/capabilities";
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
};

export async function handleExtendedReportRequest<T>(
  request: ReportRequestLike,
  deps: ExtendedReportDeps<T>
) {
  const session = await deps.getSession();
  const access = requireCapability(session, "view_report");

  if (!access.ok) {
    return toHttpResponse(access.error);
  }

  const period = parseReportPeriod(request.nextUrl.searchParams);

  if (!period.ok) {
    return toHttpResponse(period.error);
  }

  const result = await deps.getReport(period.data);

  if (!result.ok) {
    return toHttpResponse(result.error);
  }

  return NextResponse.json(result.data);
}
