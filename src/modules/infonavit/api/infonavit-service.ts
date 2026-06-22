import { ok } from "@/platform/errors/app-error";
import {
  dbHealth,
  extendedJson,
  fetchInfonavitMarkdown,
  health
} from "@/modules/infonavit/api/infonavit-client";
import type {
  InfonavitExtendedReportMarkdown,
  ReportPeriod
} from "@/modules/infonavit/types";

export async function getInfonavitHealth() {
  return health();
}

export async function getInfonavitDbHealth() {
  return dbHealth();
}

export async function getExtendedReportJson(period: ReportPeriod) {
  return extendedJson(period);
}

export async function getExtendedReportMarkdown(period: ReportPeriod) {
  const result = await fetchInfonavitMarkdown(period);

  if (!result.ok) {
    return result;
  }

  return ok<InfonavitExtendedReportMarkdown>({
    markdown: result.data
  });
}
