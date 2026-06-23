export type SummaryItem = {
  label: string;
  value: string;
};

const MAX_SUMMARY_ITEMS = 6;

const PERIOD_KEYS = new Set([
  "anio_actual",
  "ano_actual",
  "current_year",
  "currentyear",
  "year_actual",
  "anio_previo",
  "ano_previo",
  "previous_year",
  "previousyear",
  "year_previo",
  "month_limit",
  "monthlimit",
  "mes_corte",
  "start_year",
  "startyear",
  "end_year",
  "endyear",
  "periodo",
  "period"
]);

const METRIC_TOKENS = [
  "monto",
  "credito",
  "creditos",
  "formalizado",
  "formalizados",
  "variacion",
  "ticket",
  "promedio",
  "total",
  "actual",
  "previo",
  "nominal",
  "real",
  "inflacion"
];

const SECTION_TOKENS = [
  "resumen",
  "contexto",
  "analisis",
  "ranking",
  "rankings",
  "estado",
  "estados",
  "familia",
  "familias",
  "inflacion",
  "metodologia",
  "warning",
  "warnings",
  "hallazgo",
  "hallazgos",
  "seccion",
  "secciones"
];

export function buildReportSummary(report: Record<string, unknown>): SummaryItem[] {
  const entries = Object.entries(report);

  if (entries.length === 0) {
    return [
      {
        label: "Estado del reporte",
        value: "JSON recibido sin campos para resumir"
      }
    ];
  }

  const usedKeys = new Set<string>();
  const summary = [
    ...buildPeriodItems(entries, usedKeys),
    ...buildMetricItems(entries, usedKeys),
    ...buildSectionItems(entries, usedKeys)
  ];

  if (summary.length === 0) {
    summary.push({
      label: "Estado del resumen",
      value: "No se detectaron campos ejecutivos esperados; se muestra fallback"
    });
  }

  summary.push(...buildFallbackItems(entries, usedKeys, MAX_SUMMARY_ITEMS - summary.length));

  return summary.slice(0, MAX_SUMMARY_ITEMS);
}

function buildPeriodItems(
  entries: Array<[string, unknown]>,
  usedKeys: Set<string>
): SummaryItem[] {
  const periodItems: SummaryItem[] = [];

  for (const [key, value] of entries) {
    if (!isPeriodField(key)) {
      continue;
    }

    periodItems.push({
      label: `Periodo: ${humanizeKey(key)}`,
      value: summarizeValue(value)
    });
    usedKeys.add(key);
  }

  return periodItems.slice(0, 3);
}

function buildMetricItems(
  entries: Array<[string, unknown]>,
  usedKeys: Set<string>
): SummaryItem[] {
  const metricItems: SummaryItem[] = [];

  for (const [key, value] of entries) {
    if (usedKeys.has(key) || typeof value !== "number" || !isMetricField(key)) {
      continue;
    }

    metricItems.push({
      label: `Metrica: ${humanizeKey(key)}`,
      value: formatNumber(value)
    });
    usedKeys.add(key);
  }

  return metricItems.slice(0, 3);
}

function buildSectionItems(
  entries: Array<[string, unknown]>,
  usedKeys: Set<string>
): SummaryItem[] {
  const sectionItems: SummaryItem[] = [];

  for (const [key, value] of entries) {
    if (usedKeys.has(key) || !isSectionField(key) || !isStructuredValue(value)) {
      continue;
    }

    sectionItems.push({
      label: `Seccion: ${humanizeKey(key)}`,
      value: summarizeValue(value)
    });
    usedKeys.add(key);
  }

  return sectionItems.slice(0, 3);
}

function buildFallbackItems(
  entries: Array<[string, unknown]>,
  usedKeys: Set<string>,
  limit: number
): SummaryItem[] {
  if (limit <= 0) {
    return [];
  }

  return entries
    .filter(([key]) => !usedKeys.has(key))
    .slice(0, limit)
    .map(([key, value]) => ({
    label: `Campo: ${humanizeKey(key)}`,
    value: summarizeValue(value)
  }));
}

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isPeriodField(key: string) {
  return PERIOD_KEYS.has(normalizeKey(key));
}

function isMetricField(key: string) {
  const normalized = normalizeKey(key);
  return METRIC_TOKENS.some((token) => normalized.includes(token));
}

function isSectionField(key: string) {
  const normalized = normalizeKey(key);
  return SECTION_TOKENS.some((token) => normalized.includes(token));
}

function isStructuredValue(value: unknown) {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2
  }).format(value);
}

function summarizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  if (typeof value === "number") {
    return formatNumber(value);
  }

  if (typeof value === "string" || typeof value === "boolean") {
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
