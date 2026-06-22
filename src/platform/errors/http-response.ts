import { NextResponse } from "next/server";
import type { AppError } from "./app-error";

export function toHttpResponse(error: AppError) {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message
      }
    },
    { status: error.status }
  );
}
