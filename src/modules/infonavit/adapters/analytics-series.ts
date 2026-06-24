export type FamilyComparisonPoint = {
  family: string;
  currentAmount: number;
  previousAmount: number;
};

export type FamilyBcgPoint = {
  family: string;
  ticketAverage: number;
  credits: number;
  amount: number;
};

export type InfonavitFamilyAnalytics = {
  comparisonSeries: FamilyComparisonPoint[];
  bcgSeries: FamilyBcgPoint[];
  warnings: string[];
  hasLineFamilyAnalysis: boolean;
  hasFamilies: boolean;
  incompleteFamilies: string[];
};

export function buildInfonavitFamilyAnalytics(
  report: Record<string, unknown>
): InfonavitFamilyAnalytics {
  const lineFamilyAnalysis = report.line_family_analysis;

  if (!isRecord(lineFamilyAnalysis)) {
    return emptyAnalytics(
      "No existe line_family_analysis en el JSON extendido actual.",
      false,
      false
    );
  }

  if (!Array.isArray(lineFamilyAnalysis.families)) {
    return emptyAnalytics(
      "line_family_analysis no contiene un arreglo families utilizable.",
      true,
      false
    );
  }

  if (lineFamilyAnalysis.families.length === 0) {
    return emptyAnalytics(
      "line_family_analysis.families está vacío.",
      true,
      false
    );
  }

  const comparisonSeries: FamilyComparisonPoint[] = [];
  const bcgSeries: FamilyBcgPoint[] = [];
  const incompleteFamilies: string[] = [];

  for (const item of lineFamilyAnalysis.families) {
    if (!isRecord(item)) {
      incompleteFamilies.push("Familia sin estructura válida");
      continue;
    }

    const family = readFamilyName(item);
    const current = isRecord(item.current) ? item.current : null;
    const previous = isRecord(item.previous) ? item.previous : null;
    const currentAmount = current ? toNumber(current.monto) : null;
    const previousAmount = previous ? toNumber(previous.monto) : null;
    const currentCredits = current ? toNumber(current.creditos) : null;
    const currentTicketAverage = current ? toNumber(current.ticket_promedio) : null;

    if (currentAmount !== null && previousAmount !== null) {
      comparisonSeries.push({
        family,
        currentAmount,
        previousAmount
      });
    }

    if (
      currentAmount !== null &&
      currentAmount > 0 &&
      currentCredits !== null &&
      currentCredits > 0 &&
      currentTicketAverage !== null &&
      currentTicketAverage > 0
    ) {
      bcgSeries.push({
        family,
        ticketAverage: currentTicketAverage,
        credits: currentCredits,
        amount: currentAmount
      });
    }

    if (
      currentAmount === null ||
      previousAmount === null ||
      currentCredits === null ||
      currentTicketAverage === null
    ) {
      incompleteFamilies.push(family);
    }
  }

  const warnings: string[] = [];

  if (comparisonSeries.length === 0) {
    warnings.push(
      "No hay familias con monto actual y monto previo suficientes para comparar."
    );
  }

  if (bcgSeries.length === 0) {
    warnings.push(
      "No hay familias con monto, créditos y ticket promedio actual suficientes para BCG."
    );
  }

  if (incompleteFamilies.length > 0) {
    warnings.push(
      `Familias con datos incompletos: ${incompleteFamilies.join(", ")}.`
    );
  }

  return {
    comparisonSeries,
    bcgSeries,
    warnings,
    hasLineFamilyAnalysis: true,
    hasFamilies: true,
    incompleteFamilies
  };
}

export function calculateTicketAverage(amount: number, credits: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(credits) || credits <= 0) {
    return null;
  }

  return amount / credits;
}

function emptyAnalytics(
  warning: string,
  hasLineFamilyAnalysis: boolean,
  hasFamilies: boolean
): InfonavitFamilyAnalytics {
  return {
    comparisonSeries: [],
    bcgSeries: [],
    warnings: [warning],
    hasLineFamilyAnalysis,
    hasFamilies,
    incompleteFamilies: []
  };
}

function readFamilyName(item: Record<string, unknown>) {
  return typeof item.family === "string" && item.family.trim() !== ""
    ? item.family.trim()
    : "Familia sin nombre";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
