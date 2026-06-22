type JsonViewerProps = {
  value: unknown;
};

export function JsonViewer({ value }: JsonViewerProps) {
  if (!value) {
    return (
      <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">
        No hay JSON para mostrar.
      </div>
    );
  }

  return (
    <pre className="max-h-[520px] overflow-auto rounded-md border border-line bg-slate-950 p-4 text-sm leading-6 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
