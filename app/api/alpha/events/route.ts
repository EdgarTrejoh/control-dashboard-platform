import { NextRequest } from "next/server";
import { getCurrentPlatformSession } from "@/platform/auth/auth-session";
import { handleAlphaClientEvent } from "@/platform/observability/alpha-client-event-handler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return handleAlphaClientEvent(body, {
    getSession: getCurrentPlatformSession
  });
}
