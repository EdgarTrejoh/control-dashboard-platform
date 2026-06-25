"use client";

import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import {
  buildBcgPointKey,
  buildInfonavitAnalyticsViewModel
} from "@/modules/infonavit/adapters/analytics-series";
import type {
  AnalyticsBcgPoint,
  AnalyticsMonthlyPoint
} from "@/modules/infonavit/adapters/analytics-series";
import type { InfonavitAnalyticsSeriesResponse } from "@/modules/infonavit/types";

type AnalyticsDashboardProps = {
  analytics: InfonavitAnalyticsSeriesResponse | null;
};

type MetricKey = "creditos" | "monto" | "ticketPromedio";

const SERIES_COLORS = [
  "#0f766e",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#0891b2",
  "#be123c",
  "#4d7c0f",
  "#9333ea"
];

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const viewModel = buildInfonavitAnalyticsViewModel(analytics);

  return (
    <section className="grid gap-4">
      <div className="rounded-md border border-line bg-white p-4">
        <h2 className="text-lg font-semibold text-ink">Análisis ejecutivo</h2>
        <p className="mt-1 text-sm text-slate-700">
          Visualizaciones construidas con <code>series[]</code> y{" "}
          <code>bcg[]</code> del endpoint mensual protegido.
        </p>

        {viewModel.warnings.length > 0 ? (
          <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            {viewModel.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlyLineChart
          metric="creditos"
          points={viewModel.monthlySeries}
          title="Evolución mensual del número de créditos"
          valueFormatter={formatInteger}
        />
        <MonthlyLineChart
          metric="monto"
          points={viewModel.monthlySeries}
          title="Evolución mensual del monto"
          valueFormatter={formatCurrencyCompact}
        />
        <MonthlyLineChart
          metric="ticketPromedio"
          points={viewModel.monthlySeries}
          title="Evolución mensual del ticket promedio"
          valueFormatter={formatCurrencyCompact}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BcgChart points={viewModel.bcgSeries} />
        <NominalRealChart points={viewModel.monthlySeries} />
      </div>
    </section>
  );
}

function MonthlyLineChart({
  metric,
  points,
  title,
  valueFormatter
}: {
  metric: MetricKey;
  points: AnalyticsMonthlyPoint[];
  title: string;
  valueFormatter: (value: number) => string;
}) {
  const chartPoints = points.map((point) => ({
    label: point.label,
    value: point[metric]
  }));
  const hasValues = chartPoints.some((point) => point.value !== null);

  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {!hasValues ? (
        <EmptyChartMessage />
      ) : (
        <div className="mt-3 h-56">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={chartPoints} margin={{ bottom: 8, right: 8, top: 16 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={valueFormatter} />
              <Tooltip formatter={formatTooltipValue} />
              <Line
                connectNulls
                dataKey="value"
                dot={false}
                name="Valor"
                stroke="#0f766e"
                strokeWidth={2.5}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function BcgChart({ points }: { points: AnalyticsBcgPoint[] }) {
  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">
        BCG mensual por producto
      </h3>
      <p className="text-xs text-slate-600">
        X: ticket promedio, Y: créditos, tamaño: monto.
      </p>

      {points.length === 0 ? (
        <EmptyChartMessage />
      ) : (
        <div className="mt-3 h-80">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart margin={{ bottom: 16, left: 8, right: 16, top: 16 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis
                dataKey="ticketPromedio"
                name="Ticket promedio"
                tickFormatter={formatCurrencyCompact}
                type="number"
              />
              <YAxis
                dataKey="creditos"
                name="Créditos"
                tickFormatter={formatInteger}
                type="number"
              />
              <ZAxis dataKey="monto" name="Monto" range={[80, 900]} />
              <Tooltip content={<BcgTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter data={points} name="Productos">
                {points.map((point, index) => (
                  <Cell
                    fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                    key={buildBcgPointKey(point, index)}
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

function NominalRealChart({ points }: { points: AnalyticsMonthlyPoint[] }) {
  const hasRealValues = points.some(
    (point) => point.montoReal !== null || point.ticketReal !== null
  );

  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">
        Comparativo nominal vs real
      </h3>
      <p className="text-xs text-slate-600">
        Monto en eje izquierdo; ticket promedio en eje derecho.
      </p>

      {points.length === 0 ? (
        <EmptyChartMessage />
      ) : !hasRealValues ? (
        <div className="mt-3 flex h-52 items-center justify-center rounded-md border border-dashed border-line bg-slate-50 p-4 text-center text-sm text-slate-600">
          Dato real no disponible para esta visualización.
        </div>
      ) : (
        <div className="mt-3 h-80">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={points} margin={{ bottom: 8, right: 16, top: 16 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis dataKey="label" />
              <YAxis
                tickFormatter={formatCurrencyCompact}
                yAxisId="amount"
              />
              <YAxis
                orientation="right"
                tickFormatter={formatCurrencyCompact}
                yAxisId="ticket"
              />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Line
                dataKey="monto"
                dot={false}
                name="Monto nominal"
                stroke="#0f766e"
                strokeWidth={2.5}
                type="monotone"
                yAxisId="amount"
              />
              <Line
                connectNulls
                dataKey="montoReal"
                dot={false}
                name="Monto real"
                stroke="#14b8a6"
                strokeDasharray="5 4"
                strokeWidth={2.5}
                type="monotone"
                yAxisId="amount"
              />
              <Line
                dataKey="ticketPromedio"
                dot={false}
                name="Ticket nominal"
                stroke="#2563eb"
                strokeWidth={2.5}
                type="monotone"
                yAxisId="ticket"
              />
              <Line
                connectNulls
                dataKey="ticketReal"
                dot={false}
                name="Ticket real"
                stroke="#c2410c"
                strokeDasharray="5 4"
                strokeWidth={2.5}
                type="monotone"
                yAxisId="ticket"
              />
            </ComposedChart>
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
  payload?: Array<{ payload?: AnalyticsBcgPoint }>;
}) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-md border border-line bg-white p-3 text-xs shadow-sm">
      <p className="font-semibold text-ink">{point.product}</p>
      <p>Familia: {point.family}</p>
      <p>Créditos: {formatInteger(point.creditos)}</p>
      <p>Monto: {formatCurrencyCompact(point.monto)}</p>
      <p>Ticket: {formatCurrencyCompact(point.ticketPromedio)}</p>
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
