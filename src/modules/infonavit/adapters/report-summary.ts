export type SummaryItem = {
  label: string;
  value: string;
};

export function buildReportSummary(report: Record<string, unknown>): SummaryItem[] {
  const entries = Object.entries(report).slice(0, 6);

  return entries.map(([key, value]) => ({
    label: humanizeKey(key),
    value: summarizeValue(value)
  }));
}

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function summarizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} elementos`;
  }

  if (typeof value === "object") {
    return `${Object.keys(value).length} campos`;
  }

  return "Dato disponible";
}
