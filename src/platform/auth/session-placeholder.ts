import type { Capability } from "@/platform/permissions/capabilities";

export type PlatformSessionUser = {
  userId: string;
  email?: string;
  displayName?: string;
};

export type PlatformSession = {
  user: PlatformSessionUser;
  capabilities: Capability[];
  provider: "local-controlled" | "external";
  issuedAt?: string;
  expiresAt?: string;
};

export type OptionalPlatformSession = PlatformSession | null;

export function getCurrentSessionPlaceholder(): OptionalPlatformSession {
  return null;
}

export function createLocalControlledSession(
  capabilities: Capability[]
): PlatformSession {
  return {
    user: {
      userId: "local-controlled-user",
      displayName: "Local controlled user"
    },
    capabilities,
    provider: "local-controlled"
  };
}
