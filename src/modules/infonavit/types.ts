export type ReportPeriod = {
  currentYear: number;
  previousYear: number;
  monthLimit: number | null;
};

export type InfonavitHealthResponse = Record<string, unknown>;

export type InfonavitExtendedReportJson = Record<string, unknown>;

export type InfonavitExtendedReportMarkdown = {
  markdown: string;
};

export type InfonavitAnalyticsSeriesItem = {
  period?: string;
  year?: number;
  anio?: number;
  month?: number;
  mes?: number;
  product?: string;
  producto?: string;
  family?: string;
  familia?: string;
  creditos: number;
  monto: number;
  ticket_promedio: number | null;
  monto_real?: number | null;
  ticket_real?: number | null;
};

export type InfonavitAnalyticsBcgItem = {
  product?: string;
  producto?: string;
  family?: string;
  familia?: string;
  creditos: number;
  monto: number;
  ticket_promedio: number;
};

export type InfonavitAnalyticsSeriesResponse = {
  period?: Record<string, unknown>;
  series: InfonavitAnalyticsSeriesItem[];
  bcg: InfonavitAnalyticsBcgItem[];
  metadata?: {
    warnings?: string[];
    [key: string]: unknown;
  };
};

export type ClientApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type ReportPayload = {
  json: InfonavitExtendedReportJson;
  markdown: string;
  analytics: InfonavitAnalyticsSeriesResponse | null;
};
