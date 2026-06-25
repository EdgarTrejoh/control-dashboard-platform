import type {
  InfonavitAnalyticsBcgItem,
  InfonavitAnalyticsSeriesItem,
  InfonavitAnalyticsSeriesResponse
} from "@/modules/infonavit/types";

export type AnalyticsMonthlyPoint = {
  periodKey: string;
  label: string;
  creditos: number;
  monto: number;
  ticketPromedio: number | null;
  montoReal: number | null;
  ticketReal: number | null;
};

export type AnalyticsBcgPoint = {
  product: string;
  family: string;
  creditos: number;
  monto: number;
  ticketPromedio: number;
};

export type InfonavitAnalyticsViewModel = {
  monthlySeries: AnalyticsMonthlyPoint[];
  bcgSeries: AnalyticsBcgPoint[];
  warnings: string[];
  hasSeries: boolean;
  hasBcg: boolean;
};

export function buildBcgPointKey(point: AnalyticsBcgPoint, index: number) {
  return `${point.family}-${point.product}-${index}`;
}

export function calculateTicketAverage(amount: number, credits: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(credits) || credits <= 0) {
    return null;
  }

  return amount / credits;
}

export function buildInfonavitAnalyticsViewModel(
  payload: InfonavitAnalyticsSeriesResponse | null
): InfonavitAnalyticsViewModel {
  if (!payload) {
    return {
      monthlySeries: [],
      bcgSeries: [],
      warnings: ["Carga el reporte para consultar analytics mensual."],
      hasSeries: false,
      hasBcg: false
    };
  }

  const series = Array.isArray(payload.series) ? payload.series : [];
  const bcg = Array.isArray(payload.bcg) ? payload.bcg : [];
  const monthlySeries = buildMonthlySeries(series);
  const bcgSeries = buildBcgSeries(bcg);
  const warnings = [...readMetadataWarnings(payload)];

  if (series.length === 0) {
    warnings.push("series[] está vacío; no hay datos mensuales para graficar.");
  }

  if (bcg.length === 0) {
    warnings.push("bcg[] está vacío; no hay datos suficientes para BCG.");
  }

  if (
    monthlySeries.length > 0 &&
    monthlySeries.every(
      (point) => point.montoReal === null && point.ticketReal === null
    )
  ) {
    warnings.push("Dato real no disponible para la comparación nominal vs real.");
  }

  return {
    monthlySeries,
    bcgSeries,
    warnings,
    hasSeries: monthlySeries.length > 0,
    hasBcg: bcgSeries.length > 0
  };
}

function buildMonthlySeries(
  series: InfonavitAnalyticsSeriesItem[]
): AnalyticsMonthlyPoint[] {
  const groups = new Map<
    string,
    {
      label: string;
      creditos: number;
      monto: number;
      montoReal: number;
      hasMontoReal: boolean;
      ticketRealTotal: number;
      ticketRealCount: number;
    }
  >();

  for (const item of series) {
    const period = readPeriod(item);
    const creditos = toNumber(item.creditos);
    const monto = toNumber(item.monto);

    if (!period || creditos === null || monto === null) {
      continue;
    }

    const group = groups.get(period.key) ?? {
      label: period.label,
      creditos: 0,
      monto: 0,
      montoReal: 0,
      hasMontoReal: false,
      ticketRealTotal: 0,
      ticketRealCount: 0
    };
    const montoReal = toNumber(item.monto_real);
    const ticketReal = toNumber(item.ticket_real);

    group.creditos += creditos;
    group.monto += monto;

    if (montoReal !== null) {
      group.montoReal += montoReal;
      group.hasMontoReal = true;
    }

    if (ticketReal !== null) {
      group.ticketRealTotal += ticketReal;
      group.ticketRealCount += 1;
    }

    groups.set(period.key, group);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, group]) => ({
      periodKey,
      label: group.label,
      creditos: group.creditos,
      monto: group.monto,
      ticketPromedio: calculateTicketAverage(group.monto, group.creditos),
      montoReal: group.hasMontoReal ? group.montoReal : null,
      ticketReal:
        group.ticketRealCount > 0
          ? group.ticketRealTotal / group.ticketRealCount
          : group.hasMontoReal
            ? calculateTicketAverage(group.montoReal, group.creditos)
            : null
    }));
}

function buildBcgSeries(bcg: InfonavitAnalyticsBcgItem[]): AnalyticsBcgPoint[] {
  return bcg
    .map((item) => {
      const creditos = toNumber(item.creditos);
      const monto = toNumber(item.monto);
      const ticketPromedio = toNumber(item.ticket_promedio);
      const product = readProductName(item);

      if (
        !product ||
        creditos === null ||
        creditos <= 0 ||
        monto === null ||
        monto <= 0 ||
        ticketPromedio === null ||
        ticketPromedio <= 0
      ) {
        return null;
      }

      return {
        product,
        family: readFamilyName(item) ?? product,
        creditos,
        monto,
        ticketPromedio
      };
    })
    .filter((item): item is AnalyticsBcgPoint => item !== null);
}

function readMetadataWarnings(payload: InfonavitAnalyticsSeriesResponse) {
  return Array.isArray(payload.metadata?.warnings)
    ? payload.metadata.warnings.filter(
        (warning): warning is string =>
          typeof warning === "string" && warning.trim() !== ""
      )
    : [];
}

function readPeriod(item: InfonavitAnalyticsSeriesItem) {
  if (typeof item.period === "string" && item.period.trim() !== "") {
    const match = item.period.match(/(20\d{2})[-/](0?[1-9]|1[0-2])/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      return {
        key: `${year}-${String(month).padStart(2, "0")}`,
        label: `${monthShortLabel(month)} ${year}`
      };
    }

    return {
      key: item.period,
      label: item.period
    };
  }

  const year = toNumber(item.year ?? item.anio);
  const month = toNumber(item.month ?? item.mes);

  if (year === null || month === null || month < 1 || month > 12) {
    return null;
  }

  const roundedYear = Math.trunc(year);
  const roundedMonth = Math.trunc(month);

  return {
    key: `${roundedYear}-${String(roundedMonth).padStart(2, "0")}`,
    label: `${monthShortLabel(roundedMonth)} ${roundedYear}`
  };
}

function readProductName(item: InfonavitAnalyticsBcgItem) {
  const value = item.product ?? item.producto;
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function readFamilyName(item: InfonavitAnalyticsBcgItem) {
  const value = item.family ?? item.familia;
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function monthShortLabel(month: number) {
  const labels = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
  ];

  return labels[month - 1] ?? `M${month}`;
}
