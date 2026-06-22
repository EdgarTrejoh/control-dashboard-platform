import { fail, ok, type Result } from "@/platform/errors/app-error";

export type InfonavitServerEnv = {
  baseUrl: string;
  apiKey: string;
};

export function getInfonavitServerEnv(): Result<InfonavitServerEnv> {
  const baseUrl = process.env.INFONAVIT_API_BASE_URL?.trim();
  const apiKey = process.env.INFONAVIT_API_KEY?.trim();

  if (!baseUrl) {
    return fail({
      code: "CONFIG_ERROR",
      message: "Falta INFONAVIT_API_BASE_URL en el servidor.",
      status: 500
    });
  }

  if (!apiKey) {
    return fail({
      code: "CONFIG_ERROR",
      message: "Falta INFONAVIT_API_KEY en el servidor.",
      status: 500
    });
  }

  return ok({
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey
  });
}
