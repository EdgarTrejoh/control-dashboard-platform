type StatusCardProps = {
  title: string;
  state: "idle" | "loading" | "ok" | "error";
  detail: string;
};

export function StatusCard({ title, state, detail }: StatusCardProps) {
  const styles = {
    idle: "border-line bg-white",
    loading: "border-amber-300 bg-amber-50",
    ok: "border-emerald-300 bg-emerald-50",
    error: "border-red-300 bg-red-50"
  };

  return (
    <section className={`rounded-md border p-4 ${styles[state]}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
          {state}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{detail}</p>
    </section>
  );
}
