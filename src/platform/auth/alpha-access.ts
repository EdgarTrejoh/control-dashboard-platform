import type { Capability } from "@/platform/permissions/capabilities";
import type { PlatformSession } from "@/platform/auth/session-placeholder";

export const ALPHA_MAX_INVITED_USERS_DEFAULT = 5;

export const alphaTesterCapabilities: Capability[] = [
  "view_report",
  "download_markdown",
  "download_json",
  "download_pdf",
  "use_ai"
];

export const alphaSuperAdminCapabilities: Capability[] = [
  ...alphaTesterCapabilities,
  "admin_users"
];

export type AlphaRole = "alpha_tester" | "super_admin";

export type AlphaAccessConfig = {
  allowedEmails: string[];
  superAdminEmail: string | null;
  maxInvitedUsers: number;
};

export type AlphaProfileInput = {
  email?: string | null;
  emailVerified?: boolean | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAlphaAllowedEmails(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function getAlphaAccessConfig(env: NodeJS.ProcessEnv): AlphaAccessConfig {
  const maxInvitedUsers = parseMaxInvitedUsers(env.ALPHA_MAX_INVITED_USERS);

  return {
    allowedEmails: uniqueEmails(parseAlphaAllowedEmails(env.ALPHA_ALLOWED_EMAILS)),
    superAdminEmail: env.ALPHA_SUPER_ADMIN_EMAIL
      ? normalizeEmail(env.ALPHA_SUPER_ADMIN_EMAIL)
      : null,
    maxInvitedUsers
  };
}

export function validateAlphaConfig(config: AlphaAccessConfig) {
  if (config.allowedEmails.length > config.maxInvitedUsers) {
    return {
      ok: false as const,
      reason: "ALPHA_ALLOWED_EMAILS excede el maximo de usuarios invitados."
    };
  }

  if (
    config.superAdminEmail &&
    !config.allowedEmails.includes(config.superAdminEmail)
  ) {
    return {
      ok: false as const,
      reason: "ALPHA_SUPER_ADMIN_EMAIL debe estar dentro de ALPHA_ALLOWED_EMAILS."
    };
  }

  return {
    ok: true as const
  };
}

export function validateAlphaProfileAccess(
  profile: AlphaProfileInput,
  config: AlphaAccessConfig
) {
  const configResult = validateAlphaConfig(config);
  if (!configResult.ok) {
    return configResult;
  }

  if (!profile.email) {
    return {
      ok: false as const,
      reason: "El perfil no contiene email verificable."
    };
  }

  if (profile.emailVerified === false) {
    return {
      ok: false as const,
      reason: "El proveedor auth reporto email no verificado."
    };
  }

  const email = normalizeEmail(profile.email);

  if (!config.allowedEmails.includes(email)) {
    return {
      ok: false as const,
      reason: "El email no esta invitado a la closed alpha."
    };
  }

  return {
    ok: true as const,
    email
  };
}

export function getAlphaRole(email: string, config: AlphaAccessConfig): AlphaRole {
  return config.superAdminEmail === normalizeEmail(email)
    ? "super_admin"
    : "alpha_tester";
}

export function getAlphaCapabilities(role: AlphaRole) {
  return role === "super_admin"
    ? alphaSuperAdminCapabilities
    : alphaTesterCapabilities;
}

export function createAlphaPlatformSession(
  email: string,
  config: AlphaAccessConfig
): PlatformSession {
  const normalizedEmail = normalizeEmail(email);
  const role = getAlphaRole(normalizedEmail, config);

  return {
    user: {
      userId: `alpha:${normalizedEmail}`,
      email: normalizedEmail,
      displayName: normalizedEmail
    },
    capabilities: getAlphaCapabilities(role),
    provider: "external"
  };
}

export function getGoogleEmailVerified(profile: unknown) {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const value = (profile as { email_verified?: unknown }).email_verified;

  return typeof value === "boolean" ? value : null;
}

function parseMaxInvitedUsers(value: string | undefined) {
  if (!value) {
    return ALPHA_MAX_INVITED_USERS_DEFAULT;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return ALPHA_MAX_INVITED_USERS_DEFAULT;
  }

  return Math.min(parsed, ALPHA_MAX_INVITED_USERS_DEFAULT);
}

function uniqueEmails(emails: string[]) {
  return Array.from(new Set(emails));
}
