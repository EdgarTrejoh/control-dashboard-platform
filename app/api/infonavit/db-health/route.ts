import { NextResponse } from "next/server";
import { getInfonavitDbHealth } from "@/modules/infonavit/api/infonavit-service";
import { toHttpResponse } from "@/platform/errors/http-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getInfonavitDbHealth();

  if (!result.ok) {
    return toHttpResponse(result.error);
  }

  return NextResponse.json(result.data);
}
