"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusCard } from "@/components/feedback/status-card";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { Button } from "@/components/ui/button";
import { buildJsonDownload, buildTextDownload } from "@/platform/download/files";
import { JsonViewer } from "@/modules/infonavit/components/json-viewer";
import { PeriodSelector } from "@/modules/infonavit/components/period-selector";
import { ReportSummary } from "@/modules/infonavit/components/report-summary";
import type {
  ClientApiError,
  InfonavitExtendedReportJson,
  ReportPayload,
  ReportPeriod
} from "@/modules/infonavit/types";

type LoadState = "idle" | "loading" | "ok" | "error";
type Tab = "summary" | "markdown" | "json";

const initialPeriod: ReportPeriod = {
  currentYear: new Date().getFullYear(),
  previousYear: new Date().getFullYear() - 1,
  monthLimit: new Date().getMonth() + 1
};

export function InfonavitDashboard() {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);
  const [apiState, setApiState] = useState<LoadState>("idle");
  const [apiMessage, setApiMessage] = useState("Pendiente de validación.");
  const [dbState, setDbState] = useState<LoadState>("idle");
  const [dbMessage, setDbMessage] = useState("Pendiente de validación.");
  const [reportState, setReportState] = useState<LoadState>("idle");
  const [reportMessage, setReportMessage] = useState("Selecciona un periodo.");
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [tab, setTab] = useState<Tab>("summary");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    void refreshHealth();
  }, []);

  const markdownDownload = useMemo(() => {
    if (!report) {
      return null;
    }

    return buildTextDownload(
      buildFilename("md", period),
      report.markdown,
      "text/markdown"
    );
  }, [period, report]);

  const jsonDownload = useMemo(() => {
    if (!report) {
      return null;
    }

    return buildJsonDownload(buildFilename("json", period), report.json);
  }, [period, report]);

  async function refreshHealth() {
    setApiState("loading");
    setDbState("loading");

    const [api, db] = await Promise.all([
      fetchClient("/api/infonavit/health"),
      fetchClient("/api/infonavit/db-health")
    ]);

    if (api.ok) {
      setApiState("ok");
      setApiMessage("API disponible.");
    } else {
      setApiState("error");
      setApiMessage(api.message);
    }

    if (db.ok) {
      setDbState("ok");
      setDbMessage("DB disponible vía backend.");
    } else {
      setDbState("error");
      setDbMessage(db.message);
    }
  }

  async function loadReport() {
    setReportState("loading");
    setReportMessage("Consultando reporte extendido.");
    setCopyMessage("");

    const params = new URLSearchParams({
      current_year: String(period.currentYear),
      previous_year: String(period.previousYear)
    });

    if (period.monthLimit !== null) {
      params.set("month_limit", String(period.monthLimit));
    }

    const [jsonResult, markdownResult] = await Promise.all([
      fetchClient<InfonavitExtendedReportJson>(
        `/api/infonavit/extended/json?${params.toString()}`
      ),
      fetchClient<{ markdown: string }>(
        `/api/infonavit/extended/markdown?${params.toString()}`
      )
    ]);

    if (!jsonResult.ok) {
      setReportState("error");
      setReportMessage(jsonResult.message);
      setReport(null);
      return;
    }

    if (!markdownResult.ok) {
      setReportState("error");
      setReportMessage(markdownResult.message);
      setReport(null);
      return;
    }

    setReport({
      json: jsonResult.data,
      markdown: markdownResult.data.markdown
    });
    setReportState("ok");
    setReportMessage("Reporte extendido disponible.");
    setTab("summary");
  }

  async function copyMarkdown() {
    if (!report?.markdown) {
      setCopyMessage("No hay Markdown para copiar.");
      return;
    }

    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopyMessage("Markdown copiado.");
    } catch {
      setCopyMessage("No fue posible copiar Markdown desde el navegador.");
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8">
      <header className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Control Dashboard Platform
        </p>
        <h1 className="text-3xl font-bold text-ink">
          Módulo INFONAVIT read-only
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-700">
          Primera fase local/controlada para consultar el reporte extendido vía
          server-side Next.js. IA, PDF, auth real, ETL, migraciones y Supabase
          directo quedan fuera de esta fase.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard detail={apiMessage} state={apiState} title="Estado API" />
        <StatusCard detail={dbMessage} state={dbState} title="Estado DB" />
      </section>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Periodo</h2>
          <Button onClick={refreshHealth} type="button" variant="secondary">
            Revalidar health
          </Button>
        </div>
        <PeriodSelector
          isLoading={reportState === "loading"}
          period={period}
          onChange={setPeriod}
          onSubmit={loadReport}
        />
      </section>

      <StatusCard
        detail={reportMessage}
        state={reportState}
        title="Reporte extendido"
      />

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tab === "summary" ? "primary" : "secondary"}
              onClick={() => setTab("summary")}
            >
              Resumen
            </Button>
            <Button
              type="button"
              variant={tab === "markdown" ? "primary" : "secondary"}
              onClick={() => setTab("markdown")}
            >
              Markdown
            </Button>
            <Button
              type="button"
              variant={tab === "json" ? "primary" : "secondary"}
              onClick={() => setTab("json")}
            >
              JSON
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!report}
              type="button"
              variant="secondary"
              onClick={copyMarkdown}
            >
              Copiar Markdown
            </Button>
            <DownloadLink download={markdownDownload} label="Descargar MD" />
            <DownloadLink download={jsonDownload} label="Descargar JSON" />
          </div>
        </div>

        {copyMessage ? (
          <p className="text-sm text-slate-600">{copyMessage}</p>
        ) : null}

        {tab === "summary" ? <ReportSummary report={report?.json ?? null} /> : null}
        {tab === "markdown" ? (
          <MarkdownViewer markdown={report?.markdown ?? ""} />
        ) : null}
        {tab === "json" ? <JsonViewer value={report?.json ?? null} /> : null}
      </section>
    </main>
  );
}

async function fetchClient<T = unknown>(
  input: string
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const response = await fetch(input, {
      method: "GET",
      cache: "no-store"
    });
    const data = (await response.json()) as T | ClientApiError;

    if (!response.ok) {
      const maybeError = data as ClientApiError;
      return {
        ok: false,
        message: maybeError.error?.message ?? "Error controlado."
      };
    }

    return {
      ok: true,
      data: data as T
    };
  } catch {
    return {
      ok: false,
      message: "No fue posible conectar con la ruta interna del frontend."
    };
  }
}

function DownloadLink({
  download,
  label
}: {
  download: { filename: string; href: string } | null;
  label: string;
}) {
  if (!download) {
    return (
      <Button disabled type="button" variant="secondary">
        {label}
      </Button>
    );
  }

  return (
    <a
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
      download={download.filename}
      href={download.href}
    >
      {label}
    </a>
  );
}

function buildFilename(extension: "json" | "md", period: ReportPeriod) {
  const month = period.monthLimit === null ? "all" : `m${period.monthLimit}`;
  return `infonavit_extended_report_${period.currentYear}_vs_${period.previousYear}_${month}.${extension}`;
}
