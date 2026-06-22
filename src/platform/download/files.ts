export function buildTextDownload(filename: string, content: string, type: string) {
  return {
    filename,
    href: `data:${type};charset=utf-8,${encodeURIComponent(content)}`
  };
}

export function buildJsonDownload(filename: string, value: unknown) {
  return buildTextDownload(
    filename,
    JSON.stringify(value, null, 2),
    "application/json"
  );
}
