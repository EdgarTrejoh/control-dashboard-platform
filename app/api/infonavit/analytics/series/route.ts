import type { NextRequest } from "next/server";
import { getAnalyticsSeries } from "@/modules/infonavit/api/infonavit-service";
import { handleExtendedReportRequest } from "@/modules/infonavit/api/extended-report-route-handlers";
import { getCurrentPlatformSession } from "@/platform/auth/auth-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleExtendedReportRequest(request, {
    getSession: getCurrentPlatformSession,
    getReport: getAnalyticsSeries,
    route: "/api/infonavit/analytics/series",
    action: "view_analytics_series"
  });
}
