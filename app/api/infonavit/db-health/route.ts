import { handleInfonavitDbHealthRequest } from "@/modules/infonavit/api/health-route-handlers";
import { getInfonavitDbHealth } from "@/modules/infonavit/api/infonavit-service";
import { getCurrentPlatformSession } from "@/platform/auth/auth-session";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleInfonavitDbHealthRequest({
    getSession: getCurrentPlatformSession,
    getDbHealth: getInfonavitDbHealth
  });
}
