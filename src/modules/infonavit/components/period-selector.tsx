"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { ReportPeriod } from "@/modules/infonavit/types";

type PeriodSelectorProps = {
  period: ReportPeriod;
  isLoading: boolean;
  onChange: (period: ReportPeriod) => void;
  onSubmit: () => void;
};

export function PeriodSelector({
  period,
  isLoading,
  onChange,
  onSubmit
}: PeriodSelectorProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="grid gap-4 rounded-md border border-line bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Año actual
        <input
          className="min-h-10 rounded-md border border-line px-3"
          max={2100}
          min={2000}
          type="number"
          value={period.currentYear}
          onChange={(event) =>
            onChange({ ...period, currentYear: Number(event.target.value) })
          }
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Año previo
        <input
          className="min-h-10 rounded-md border border-line px-3"
          max={2100}
          min={2000}
          type="number"
          value={period.previousYear}
          onChange={(event) =>
            onChange({ ...period, previousYear: Number(event.target.value) })
          }
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Mes de corte
        <select
          className="min-h-10 rounded-md border border-line px-3"
          value={period.monthLimit ?? ""}
          onChange={(event) =>
            onChange({
              ...period,
              monthLimit: event.target.value ? Number(event.target.value) : null
            })
          }
        >
          <option value="">Sin corte</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Consultando" : "Consultar"}
        </Button>
      </div>
    </form>
  );
}
