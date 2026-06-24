"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import { buildInfonavitFamilyAnalytics } from "@/modules/infonavit/adapters/analytics-series";
import type {
  FamilyBcgPoint,
  FamilyComparisonPoint
} from "@/modules/infonavit/adapters/analytics-series";
import type { InfonavitExtendedReportJson } from "@/modules/infonavit/types";

type AnalyticsDashboardProps = {
  report: InfonavitExtendedReportJson | null;
};

const FAMILY_COLORS = [
  "#0f766e",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#0891b2",
  "#be123c"
];

export function AnalyticsDashboard({ report }: AnalyticsDashboardProps) {
  const analytics = report
    ? buildInfonavitFamilyAnalytics(report)
    : buildInfonavitFamilyAnalytics({});

  return (
    <section className="grid gap-4">
      <div className="rounded-md border border-line bg-white p-4">
        <h2 className="text-lg font-semibold text-ink">Análisis ejecutivo</h2>
        <p className="mt-1 text-sm text-slate-700">
          Visualizaciones construidas con datos agregados existentes en{" "}
          <code>line_family_analysis.families</code>.
        </p>
        <p className="mt-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          La evolución mensual requiere un endpoint de series mensuales; el JSON
          actual solo permite comparativos agregados.
        </p>

        {analytics.warnings.length > 0 ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {analytics.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FamilyAmountComparisonChart points={analytics.comparisonSeries} />
        <FamilyBcgChart points={analytics.bcgSeries} />
      </div>
    </section>
  );
}

function FamilyAmountComparisonChart({
  points
}: {
  points: FamilyComparisonPoint[];
}) {
  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">
        Comparativo por familia: monto actual vs previo
      </h3>
      <p className="text-xs text-slate-600">
        Fuente: familia, monto actual y monto previo del JSON extendido.
      </p>

      {points.length === 0 ? (
        <EmptyChartMessage />
      ) : (
        <div className="mt-3 h-80">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={points} margin={{ bottom: 24, left: 8, right: 8, top: 16 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis
                dataKey="family"
                interval={0}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis tickFormatter={formatCurrencyCompact} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Bar
                dataKey="currentAmount"
                fill="#0f766e"
                name="Monto actual"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="previousAmount"
                fill="#94a3b8"
                name="Monto previo"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function FamilyBcgChart({ points }: { points: FamilyBcgPoint[] }) {
  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">
        BCG actual por familia
      </h3>
      <p className="text-xs text-slate-600">
        X: ticket promedio, Y: créditos, tamaño: monto actual.
      </p>

      {points.length === 0 ? (
        <EmptyChartMessage />
      ) : (
        <div className="mt-3 h-80">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart margin={{ bottom: 16, left: 8, right: 16, top: 16 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis
                dataKey="ticketAverage"
                name="Ticket promedio"
                tickFormatter={formatCurrencyCompact}
                type="number"
              />
              <YAxis
                dataKey="credits"
                name="Créditos"
                tickFormatter={formatInteger}
                type="number"
              />
              <ZAxis dataKey="amount" name="Monto actual" range={[80, 900]} />
              <Tooltip content={<BcgTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter data={points} name="Familias">
                {points.map((point, index) => (
                  <Cell
                    fill={FAMILY_COLORS[index % FAMILY_COLORS.length]}
                    key={point.family}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function BcgTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload?: FamilyBcgPoint }>;
}) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-md border border-line bg-white p-3 text-xs shadow-sm">
      <p className="font-semibold text-ink">{point.family}</p>
      <p>Créditos: {formatInteger(point.credits)}</p>
      <p>Monto: {formatCurrencyCompact(point.amount)}</p>
      <p>Ticket: {formatCurrencyCompact(point.ticketAverage)}</p>
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="mt-3 flex h-52 items-center justify-center rounded-md border border-dashed border-line bg-slate-50 p-4 text-center text-sm text-slate-600">
      No hay datos suficientes para esta visualización.
    </div>
  );
}

function formatTooltipValue(value: unknown) {
  if (typeof value !== "number") {
    return "Sin dato";
  }

  return formatCurrencyCompact(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("es-MX", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
    currency: "MXN"
  }).format(value);
}
