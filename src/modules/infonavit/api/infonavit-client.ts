import { getInfonavitServerEnv } from "@/platform/env/server";
import { fail, type Result } from "@/platform/errors/app-error";
import { serverFetchJson, serverFetchText } from "@/platform/http/server-fetch";
import { toInfonavitSearchParams } from "@/modules/infonavit/api/period";
import type {
  InfonavitAnalyticsSeriesResponse,
  InfonavitExtendedReportJson,
  InfonavitHealthResponse,
  ReportPeriod
} from "@/modules/infonavit/types";

type InfonavitEndpoint =
  | "/health"
  | "/db/health"
  | "/mini-report/analytics/series/json"
  | "/mini-report/extended/json"
  | "/mini-report/extended/markdown";

export async function fetchInfonavitJson<T>(
  endpoint: InfonavitEndpoint,
  period?: ReportPeriod
): Promise<Result<T>> {
  const request = buildRequest(endpoint, period);
  if (!request.ok) {
    return fail(request.error);
  }

  return serverFetchJson<T>(request.data.url, {
    headers: request.data.headers
  });
}

export async function fetchInfonavitMarkdown(
  period: ReportPeriod
): Promise<Result<string>> {
  const request = buildRequest("/mini-report/extended/markdown", period);
  if (!request.ok) {
    return fail(request.error);
  }

  return serverFetchText(request.data.url, {
    headers: request.data.headers
  });
}

export async function health() {
  return fetchInfonavitJson<InfonavitHealthResponse>("/health");
}

export async function dbHealth() {
  return fetchInfonavitJson<InfonavitHealthResponse>("/db/health");
}

export async function extendedJson(period: ReportPeriod) {
  return fetchInfonavitJson<InfonavitExtendedReportJson>(
    "/mini-report/extended/json",
    period
  );
}

export async function analyticsSeries(period: ReportPeriod) {
  return fetchInfonavitJson<InfonavitAnalyticsSeriesResponse>(
    "/mini-report/analytics/series/json",
    period
  );
}

function buildRequest(endpoint: InfonavitEndpoint, period?: ReportPeriod) {
  const env = getInfonavitServerEnv();
  if (!env.ok) {
    return env;
  }

  const url = new URL(`${env.data.baseUrl}${endpoint}`);

  if (period) {
    const params = toInfonavitSearchParams(period);
    params.forEach((value, key) => url.searchParams.set(key, value));
  }

  return {
    ok: true as const,
    data: {
      url: url.toString(),
      headers: {
        "X-API-Key": env.data.apiKey
      }
    }
  };
}
