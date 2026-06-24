import { NextResponse } from "next/server";
import { toHttpResponse } from "@/platform/errors/http-response";
import { requireCapability } from "@/platform/permissions/capabilities";
import {
  getSessionEmailHash,
  logAlphaEvent
} from "@/platform/observability/alpha-events";
import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";
import type { Result } from "@/platform/errors/app-error";
import type { InfonavitHealthResponse } from "@/modules/infonavit/types";

type DbHealthDeps = {
  getSession: () => Promise<OptionalPlatformSession>;
  getDbHealth: () => Promise<Result<InfonavitHealthResponse>>;
  logEvent?: typeof logAlphaEvent;
};

export async function handleInfonavitDbHealthRequest(deps: DbHealthDeps) {
  const logEvent = deps.logEvent ?? logAlphaEvent;
  const session = await deps.getSession();
  const userEmailHash = getSessionEmailHash(session?.user.email);
  const access = requireCapability(session, "admin_users");

  if (!access.ok) {
    logEvent({
      event_type: "capability_denied",
      ...(userEmailHash ? { user_email_hash: userEmailHash } : {}),
      module: "infonavit",
      route: "/api/infonavit/db-health",
      action: "view_db_health",
      result: "denied",
      capability: "admin_users",
      error_code: access.error.code
    });

    return toHttpResponse(access.error);
  }

  const result = await deps.getDbHealth();

  if (!result.ok) {
    return toHttpResponse(result.error);
  }

  return NextResponse.json(result.data);
}
