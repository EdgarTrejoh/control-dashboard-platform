type MarkdownViewerProps = {
  markdown: string;
};

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  if (!markdown.trim()) {
    return (
      <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">
        No hay Markdown para mostrar.
      </div>
    );
  }

  return (
    <pre className="max-h-[520px] overflow-auto rounded-md border border-line bg-white p-4 text-sm leading-6 text-slate-800">
      {markdown}
    </pre>
  );
}
