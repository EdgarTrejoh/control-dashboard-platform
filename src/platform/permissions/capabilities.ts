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

type SessionWithCapabilities = {
  capabilities: Capability[];
} | null;

export function hasCapability(
  session: SessionWithCapabilities,
  capability: Capability
) {
  return session?.capabilities.includes(capability) ?? false;
}

export function requireCapability(
  session: SessionWithCapabilities,
  capability: Capability
) {
  if (!session) {
    return {
      ok: false as const,
      error: {
        code: "AUTH_REQUIRED" as const,
        message: "Se requiere sesion para acceder a este recurso.",
        status: 401
      }
    };
  }

  if (!hasCapability(session, capability)) {
    return {
      ok: false as const,
      error: {
        code: "FORBIDDEN" as const,
        message: "La sesion no tiene permisos para esta accion.",
        status: 403
      }
    };
  }

  return {
    ok: true as const,
    data: session
  };
}
