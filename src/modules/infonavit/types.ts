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

export type ClientApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type ReportPayload = {
  json: InfonavitExtendedReportJson;
  markdown: string;
};
