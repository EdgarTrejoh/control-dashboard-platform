import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";

export type AlphaAuthViewModel = {
  isSignedIn: boolean;
  accountLabel: string | null;
};

export function getAlphaAuthViewModel(
  session: OptionalPlatformSession
): AlphaAuthViewModel {
  return {
    isSignedIn: Boolean(session),
    accountLabel: session?.user.email ?? session?.user.displayName ?? null
  };
}
