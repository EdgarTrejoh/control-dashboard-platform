import { NextResponse } from "next/server";
import { getInfonavitHealth } from "@/modules/infonavit/api/infonavit-service";
import { toHttpResponse } from "@/platform/errors/http-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getInfonavitHealth();

  if (!result.ok) {
    return toHttpResponse(result.error);
  }

  return NextResponse.json(result.data);
}
