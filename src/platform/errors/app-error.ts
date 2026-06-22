export type AppErrorCode =
  | "CONFIG_ERROR"
  | "AUTH_ERROR"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "UPSTREAM_ERROR"
  | "EMPTY_DATA"
  | "UNKNOWN_ERROR";

export type AppError = {
  code: AppErrorCode;
  message: string;
  status: number;
};

export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AppError;
    };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(error: AppError): Result<never> {
  return { ok: false, error };
}
