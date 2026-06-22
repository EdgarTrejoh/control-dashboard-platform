import { fail, ok, type Result } from "@/platform/errors/app-error";
import type { ReportPeriod } from "@/modules/infonavit/types";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function parseReportPeriod(params: URLSearchParams): Result<ReportPeriod> {
  const currentYear = parseIntegerParam(params, "current_year");
  const previousYear = parseIntegerParam(params, "previous_year");
  const monthLimitRaw = params.get("month_limit");
  const monthLimit =
    monthLimitRaw === null || monthLimitRaw === ""
      ? null
      : Number.parseInt(monthLimitRaw, 10);

  if (!isValidYear(currentYear) || !isValidYear(previousYear)) {
    return fail({
      code: "VALIDATION_ERROR",
      message: "Los años deben estar entre 2000 y 2100.",
      status: 422
    });
  }

  if (previousYear >= currentYear) {
    return fail({
      code: "VALIDATION_ERROR",
      message: "El año previo debe ser menor al año actual.",
      status: 422
    });
  }

  if (monthLimit !== null && (!Number.isInteger(monthLimit) || monthLimit < 1 || monthLimit > 12)) {
    return fail({
      code: "VALIDATION_ERROR",
      message: "El mes de corte debe estar entre 1 y 12.",
      status: 422
    });
  }

  return ok({
    currentYear,
    previousYear,
    monthLimit
  });
}

export function toInfonavitSearchParams(period: ReportPeriod) {
  const params = new URLSearchParams({
    current_year: String(period.currentYear),
    previous_year: String(period.previousYear)
  });

  if (period.monthLimit !== null) {
    params.set("month_limit", String(period.monthLimit));
  }

  return params;
}

function parseIntegerParam(params: URLSearchParams, name: string) {
  const value = params.get(name);
  if (!value) {
    return Number.NaN;
  }

  return Number.parseInt(value, 10);
}

function isValidYear(value: number) {
  return Number.isInteger(value) && value >= MIN_YEAR && value <= MAX_YEAR;
}
