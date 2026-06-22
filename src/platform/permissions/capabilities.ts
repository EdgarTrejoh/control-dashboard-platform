export type Capability =
  | "view_report"
  | "download_markdown"
  | "download_json"
  | "use_ai"
  | "download_pdf"
  | "admin_users";

export const localControlledCapabilities: Capability[] = [
  "view_report",
  "download_markdown",
  "download_json"
];
