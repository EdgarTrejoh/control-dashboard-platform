export type PlatformSession = {
  userId: string;
  capabilities: string[];
} | null;

export function getCurrentSessionPlaceholder(): PlatformSession {
  return null;
}
