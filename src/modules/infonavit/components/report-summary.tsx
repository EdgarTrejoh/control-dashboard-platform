import { buildReportSummary } from "@/modules/infonavit/adapters/report-summary";

type ReportSummaryProps = {
  report: Record<string, unknown> | null;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  if (!report) {
    return (
      <section className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">
        Ejecuta una consulta para ver el reporte extendido.
      </section>
    );
  }

  const summary = buildReportSummary(report);

  if (summary.length === 0) {
    return (
      <section className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">
        El reporte no contiene campos para resumir.
      </section>
    );
  }

  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h2 className="text-base font-semibold text-ink">Resumen estructurado</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-md border border-line p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-sm text-slate-800">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
