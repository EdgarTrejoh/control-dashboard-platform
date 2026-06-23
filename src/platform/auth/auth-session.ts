import { auth } from "../../../auth";
import {
  createAlphaPlatformSession,
  getAlphaAccessConfig,
  validateAlphaProfileAccess
} from "@/platform/auth/alpha-access";
import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";

export async function getCurrentPlatformSession(): Promise<OptionalPlatformSession> {
  const session = await auth();
  const email = session?.user?.email;
  const config = getAlphaAccessConfig(process.env);
  const access = validateAlphaProfileAccess({ email }, config);

  if (!access.ok) {
    return null;
  }

  return createAlphaPlatformSession(access.email, config);
}
