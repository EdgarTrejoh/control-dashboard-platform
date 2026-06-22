import { fail, ok, type Result } from "@/platform/errors/app-error";

type ServerFetchOptions = {
  headers?: HeadersInit;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

export async function serverFetchJson<T>(
  url: string,
  options: ServerFetchOptions = {}
): Promise<Result<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: options.headers,
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      return fail({
        code: response.status === 401 ? "AUTH_ERROR" : "UPSTREAM_ERROR",
        message: toSafeUpstreamMessage(response.status),
        status: response.status
      });
    }

    const data = (await response.json()) as T;

    if (data === null || data === undefined) {
      return fail({
        code: "EMPTY_DATA",
        message: "El backend respondió sin datos.",
        status: 502
      });
    }

    return ok(data);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return fail({
        code: "TIMEOUT_ERROR",
        message: "La API tardó demasiado en responder.",
        status: 504
      });
    }

    return fail({
      code: "NETWORK_ERROR",
      message: "No fue posible conectar con la API.",
      status: 502
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function serverFetchText(
  url: string,
  options: ServerFetchOptions = {}
): Promise<Result<string>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: options.headers,
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      return fail({
        code: response.status === 401 ? "AUTH_ERROR" : "UPSTREAM_ERROR",
        message: toSafeUpstreamMessage(response.status),
        status: response.status
      });
    }

    const data = await response.text();

    if (!data.trim()) {
      return fail({
        code: "EMPTY_DATA",
        message: "El backend respondió con Markdown vacío.",
        status: 502
      });
    }

    return ok(data);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return fail({
        code: "TIMEOUT_ERROR",
        message: "La API tardó demasiado en responder.",
        status: 504
      });
    }

    return fail({
      code: "NETWORK_ERROR",
      message: "No fue posible conectar con la API.",
      status: 502
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toSafeUpstreamMessage(status: number) {
  if (status === 401) {
    return "La API rechazó la credencial server-side.";
  }

  if (status === 422) {
    return "Los parámetros enviados no son válidos.";
  }

  if (status === 404) {
    return "El endpoint solicitado no está disponible.";
  }

  return "La API respondió con un error controlado.";
}
