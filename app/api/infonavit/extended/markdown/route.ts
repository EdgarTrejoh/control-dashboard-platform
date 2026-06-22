import { NextRequest, NextResponse } from "next/server";
import { getExtendedReportMarkdown } from "@/modules/infonavit/api/infonavit-service";
import { parseReportPeriod } from "@/modules/infonavit/api/period";
import { toHttpResponse } from "@/platform/errors/http-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const period = parseReportPeriod(request.nextUrl.searchParams);

  if (!period.ok) {
    return toHttpResponse(period.error);
  }

  const result = await getExtendedReportMarkdown(period.data);

  if (!result.ok) {
    return toHttpResponse(result.error);
  }

  return NextResponse.json(result.data);
}
