import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./ts-module-loader.mjs";

const {
  parseReportPeriod,
  toInfonavitSearchParams
} = loadTsModule("src/modules/infonavit/api/period.ts");
const { getInfonavitServerEnv } = loadTsModule("src/platform/env/server.ts");
const { serverFetchJson, serverFetchText } = loadTsModule(
  "src/platform/http/server-fetch.ts"
);
const { toHttpResponse } = loadTsModule("src/platform/errors/http-response.ts");
const { buildReportSummary } = loadTsModule(
  "src/modules/infonavit/adapters/report-summary.ts"
);
const { buildTextDownload, buildJsonDownload } = loadTsModule(
  "src/platform/download/files.ts"
);
const {
  hasCapability,
  requireCapability
} = loadTsModule("src/platform/permissions/capabilities.ts");
const {
  createLocalControlledSession,
  getCurrentSessionPlaceholder
} = loadTsModule("src/platform/auth/session-placeholder.ts");
const {
  getAlphaAccessConfig,
  getAlphaCapabilities,
  getAlphaRole,
  normalizeEmail,
  validateAlphaConfig,
  validateAlphaProfileAccess
} = loadTsModule("src/platform/auth/alpha-access.ts");

test("parseReportPeriod accepts a valid period", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "2025",
      month_limit: "6"
    })
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.data, {
    currentYear: 2026,
    previousYear: 2025,
    monthLimit: 6
  });
});

test("parseReportPeriod rejects invalid current year", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "1999",
      previous_year: "2025",
      month_limit: "6"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "VALIDATION_ERROR");
  assert.equal(result.error.status, 422);
});

test("parseReportPeriod rejects invalid previous year", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "not-a-year",
      month_limit: "6"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("parseReportPeriod rejects previous year greater than or equal to current year", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "2026",
      month_limit: "6"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("parseReportPeriod rejects month lower than 1", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "2025",
      month_limit: "0"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("parseReportPeriod rejects month greater than 12", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "2025",
      month_limit: "13"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("parseReportPeriod treats empty month as null", () => {
  const result = parseReportPeriod(
    new URLSearchParams({
      current_year: "2026",
      previous_year: "2025",
      month_limit: ""
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.monthLimit, null);
});

test("toInfonavitSearchParams maps period to backend query params", () => {
  const params = toInfonavitSearchParams({
    currentYear: 2026,
    previousYear: 2025,
    monthLimit: 9
  });

  assert.equal(params.get("current_year"), "2026");
  assert.equal(params.get("previous_year"), "2025");
  assert.equal(params.get("month_limit"), "9");
});

test("toInfonavitSearchParams omits null month limit", () => {
  const params = toInfonavitSearchParams({
    currentYear: 2026,
    previousYear: 2025,
    monthLimit: null
  });

  assert.equal(params.has("month_limit"), false);
});

test("getInfonavitServerEnv reports missing base URL", () => {
  const restore = withEnv({
    INFONAVIT_API_BASE_URL: undefined,
    INFONAVIT_API_KEY: "secret"
  });

  try {
    const result = getInfonavitServerEnv();
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "CONFIG_ERROR");
    assert.match(result.error.message, /INFONAVIT_API_BASE_URL/);
  } finally {
    restore();
  }
});

test("getInfonavitServerEnv reports missing API key", () => {
  const restore = withEnv({
    INFONAVIT_API_BASE_URL: "https://example.test",
    INFONAVIT_API_KEY: undefined
  });

  try {
    const result = getInfonavitServerEnv();
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "CONFIG_ERROR");
    assert.match(result.error.message, /INFONAVIT_API_KEY/);
  } finally {
    restore();
  }
});

test("getInfonavitServerEnv trims trailing slash from base URL", () => {
  const restore = withEnv({
    INFONAVIT_API_BASE_URL: "https://example.test/",
    INFONAVIT_API_KEY: "secret"
  });

  try {
    const result = getInfonavitServerEnv();
    assert.equal(result.ok, true);
    assert.equal(result.data.baseUrl, "https://example.test");
    assert.equal(result.data.apiKey, "secret");
  } finally {
    restore();
  }
});

test("serverFetchJson maps upstream 401", async () => {
  const restore = mockFetch(async () => jsonResponse({ error: "nope" }, 401));

  try {
    const result = await serverFetchJson("https://example.test");
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "AUTH_ERROR");
    assert.equal(result.error.status, 401);
  } finally {
    restore();
  }
});

test("serverFetchJson maps upstream 422", async () => {
  const restore = mockFetch(async () => jsonResponse({ error: "bad params" }, 422));

  try {
    const result = await serverFetchJson("https://example.test");
    assert.equal(result.ok, false);
    assert.equal(result.error.status, 422);
    assert.match(result.error.message, /par.metros|parámetros/i);
  } finally {
    restore();
  }
});

test("serverFetchJson maps timeout", async () => {
  const restore = mockFetch(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      })
  );

  try {
    const result = await serverFetchJson("https://example.test", {
      timeoutMs: 1
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "TIMEOUT_ERROR");
    assert.equal(result.error.status, 504);
  } finally {
    restore();
  }
});

test("serverFetchJson maps null JSON as empty data", async () => {
  const restore = mockFetch(async () => jsonResponse(null, 200));

  try {
    const result = await serverFetchJson("https://example.test");
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "EMPTY_DATA");
    assert.equal(result.error.status, 502);
  } finally {
    restore();
  }
});

test("serverFetchText maps empty markdown as empty data", async () => {
  const restore = mockFetch(async () => textResponse("   ", 200));

  try {
    const result = await serverFetchText("https://example.test");
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "EMPTY_DATA");
    assert.equal(result.error.status, 502);
  } finally {
    restore();
  }
});

test("serverFetchJson returns parsed JSON on success", async () => {
  const restore = mockFetch(async () => jsonResponse({ ok: true }, 200));

  try {
    const result = await serverFetchJson("https://example.test");
    assert.equal(result.ok, true);
    assert.deepEqual(result.data, { ok: true });
  } finally {
    restore();
  }
});

test("serverFetchText returns markdown on success", async () => {
  const restore = mockFetch(async () => textResponse("# Reporte", 200));

  try {
    const result = await serverFetchText("https://example.test");
    assert.equal(result.ok, true);
    assert.equal(result.data, "# Reporte");
  } finally {
    restore();
  }
});

test("toHttpResponse serializes safe app errors", async () => {
  const response = toHttpResponse({
    code: "VALIDATION_ERROR",
    message: "Parametros invalidos.",
    status: 422
  });

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    error: {
      code: "VALIDATION_ERROR",
      message: "Parametros invalidos."
    }
  });
});

test("getCurrentSessionPlaceholder does not create a production session", () => {
  assert.equal(getCurrentSessionPlaceholder(), null);
});

test("createLocalControlledSession creates a local non-production session model", () => {
  const session = createLocalControlledSession(["view_report"]);

  assert.equal(session.provider, "local-controlled");
  assert.equal(session.user.userId, "local-controlled-user");
  assert.deepEqual(session.capabilities, ["view_report"]);
});

test("hasCapability returns true when the session has the capability", () => {
  const session = createLocalControlledSession(["view_report"]);

  assert.equal(hasCapability(session, "view_report"), true);
});

test("hasCapability returns false when there is no session", () => {
  assert.equal(hasCapability(null, "view_report"), false);
});

test("hasCapability returns false when the capability is missing", () => {
  const session = createLocalControlledSession(["download_json"]);

  assert.equal(hasCapability(session, "view_report"), false);
});

test("requireCapability allows a session with the required capability", () => {
  const session = createLocalControlledSession(["view_report"]);
  const result = requireCapability(session, "view_report");

  assert.equal(result.ok, true);
  assert.equal(result.data, session);
});

test("requireCapability returns AUTH_REQUIRED when there is no session", () => {
  const result = requireCapability(null, "view_report");

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "AUTH_REQUIRED");
  assert.equal(result.error.status, 401);
});

test("requireCapability returns FORBIDDEN when the capability is missing", () => {
  const session = createLocalControlledSession(["download_json"]);
  const result = requireCapability(session, "view_report");

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "FORBIDDEN");
  assert.equal(result.error.status, 403);
});

test("toHttpResponse serializes AUTH_REQUIRED without stack traces or secrets", async () => {
  const response = toHttpResponse({
    code: "AUTH_REQUIRED",
    message: "Se requiere sesion para acceder a este recurso.",
    status: 401
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, {
    error: {
      code: "AUTH_REQUIRED",
      message: "Se requiere sesion para acceder a este recurso."
    }
  });
  assert.equal(JSON.stringify(body).includes("stack"), false);
  assert.equal(JSON.stringify(body).includes("X-API-Key"), false);
});

test("toHttpResponse serializes FORBIDDEN without stack traces or secrets", async () => {
  const response = toHttpResponse({
    code: "FORBIDDEN",
    message: "La sesion no tiene permisos para esta accion.",
    status: 403
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.deepEqual(body, {
    error: {
      code: "FORBIDDEN",
      message: "La sesion no tiene permisos para esta accion."
    }
  });
  assert.equal(JSON.stringify(body).includes("stack"), false);
  assert.equal(JSON.stringify(body).includes("X-API-Key"), false);
});

test("alpha allowlist accepts an invited email", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS: "Tester@Example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "tester@example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });
  const result = validateAlphaProfileAccess(
    {
      email: " tester@example.com ",
      emailVerified: true
    },
    config
  );

  assert.equal(result.ok, true);
  assert.equal(result.email, "tester@example.com");
});

test("alpha allowlist rejects a non-invited email", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS: "invited@example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "invited@example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });
  const result = validateAlphaProfileAccess(
    {
      email: "other@example.com",
      emailVerified: true
    },
    config
  );

  assert.equal(result.ok, false);
  assert.match(result.reason, /no esta invitado/i);
});

test("alpha allowlist rejects more than five invited emails", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS:
      "a@example.com,b@example.com,c@example.com,d@example.com,e@example.com,f@example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "a@example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });
  const result = validateAlphaConfig(config);

  assert.equal(result.ok, false);
  assert.match(result.reason, /maximo/i);
});

test("alpha config requires super admin to be inside allowlist", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS: "tester@example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "admin@example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });
  const result = validateAlphaConfig(config);

  assert.equal(result.ok, false);
  assert.match(result.reason, /SUPER_ADMIN/i);
});

test("alpha access rejects Google profiles marked as unverified", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS: "tester@example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "tester@example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });
  const result = validateAlphaProfileAccess(
    {
      email: "tester@example.com",
      emailVerified: false
    },
    config
  );

  assert.equal(result.ok, false);
  assert.match(result.reason, /no verificado/i);
});

test("alpha_tester receives expected capabilities", () => {
  assert.deepEqual(getAlphaCapabilities("alpha_tester"), [
    "view_report",
    "download_markdown",
    "download_json",
    "download_pdf",
    "use_ai"
  ]);
});

test("super_admin receives admin_users capability", () => {
  assert.deepEqual(getAlphaCapabilities("super_admin"), [
    "view_report",
    "download_markdown",
    "download_json",
    "download_pdf",
    "use_ai",
    "admin_users"
  ]);
});

test("alpha role maps super admin by normalized email", () => {
  const config = getAlphaAccessConfig({
    ALPHA_ALLOWED_EMAILS: "admin@example.com,tester@example.com",
    ALPHA_SUPER_ADMIN_EMAIL: "Admin@Example.com",
    ALPHA_MAX_INVITED_USERS: "5"
  });

  assert.equal(getAlphaRole(" ADMIN@example.com ", config), "super_admin");
  assert.equal(getAlphaRole("tester@example.com", config), "alpha_tester");
});

test("normalizeEmail lowercases and trims email values", () => {
  assert.equal(normalizeEmail(" Tester@Example.COM "), "tester@example.com");
});

test("buildReportSummary keeps a safe fallback for simple JSON", () => {
  const summary = buildReportSummary({
    title: "Reporte",
    amount: 12,
    active: true,
    rows: [1, 2, 3],
    missing: null
  });

  assert.deepEqual(summary, [
    {
      label: "Estado del resumen",
      value: "No se detectaron campos ejecutivos esperados; se muestra fallback"
    },
    { label: "Campo: Title", value: "Reporte" },
    { label: "Campo: Amount", value: "12" },
    { label: "Campo: Active", value: "true" },
    { label: "Campo: Rows", value: "3 elementos" },
    { label: "Campo: Missing", value: "Sin dato" }
  ]);
});

test("buildReportSummary identifies period fields when present", () => {
  const summary = buildReportSummary({
    current_year: 2026,
    previous_year: 2025,
    month_limit: 6,
    other: "ignored until fallback"
  });

  assert.deepEqual(summary.slice(0, 3), [
    { label: "Periodo: Current Year", value: "2,026" },
    { label: "Periodo: Previous Year", value: "2,025" },
    { label: "Periodo: Month Limit", value: "6" }
  ]);
});

test("buildReportSummary identifies numeric metrics when present", () => {
  const summary = buildReportSummary({
    monto_colocado_actual: 1234567.891,
    creditos_formalizados: 3456,
    ticket_promedio: 98765.432,
    descripcion: "datos ejecutivos"
  });

  assert.deepEqual(summary.slice(0, 3), [
    { label: "Metrica: Monto Colocado Actual", value: "1,234,567.89" },
    { label: "Metrica: Creditos Formalizados", value: "3,456" },
    { label: "Metrica: Ticket Promedio", value: "98,765.43" }
  ]);
});

test("buildReportSummary identifies relevant array sections", () => {
  const summary = buildReportSummary({
    ranking_estados: [{ estado: "A" }, { estado: "B" }],
    familias_linea: ["tradicional", "mejoravit"]
  });

  assert.deepEqual(summary.slice(0, 2), [
    { label: "Seccion: Ranking Estados", value: "2 elementos" },
    { label: "Seccion: Familias Linea", value: "2 elementos" }
  ]);
});

test("buildReportSummary identifies relevant nested object sections", () => {
  const summary = buildReportSummary({
    contexto_inflacion: {
      actual: 4.2,
      previo: 5.1
    },
    metodologia: {
      fuente: "backend",
      modo: "read-only"
    }
  });

  assert.deepEqual(summary.slice(0, 2), [
    { label: "Seccion: Contexto Inflacion", value: "2 campos" },
    { label: "Seccion: Metodologia", value: "2 campos" }
  ]);
});

test("buildReportSummary returns a safe message for empty JSON", () => {
  const summary = buildReportSummary({});

  assert.deepEqual(summary, [
    {
      label: "Estado del reporte",
      value: "JSON recibido sin campos para resumir"
    }
  ]);
});

test("buildReportSummary handles unexpected JSON without inventing data", () => {
  const summary = buildReportSummary({
    alpha: Symbol("unusual"),
    beta: undefined
  });

  assert.deepEqual(summary, [
    {
      label: "Estado del resumen",
      value: "No se detectaron campos ejecutivos esperados; se muestra fallback"
    },
    { label: "Campo: Alpha", value: "Dato disponible" },
    { label: "Campo: Beta", value: "Sin dato" }
  ]);
});

test("buildTextDownload creates markdown data URI with filename and MIME", () => {
  const download = buildTextDownload("report.md", "# Hola", "text/markdown");

  assert.equal(download.filename, "report.md");
  assert.equal(download.href, "data:text/markdown;charset=utf-8,%23%20Hola");
});

test("buildJsonDownload creates JSON data URI with filename and MIME", () => {
  const download = buildJsonDownload("report.json", { ok: true });

  assert.equal(download.filename, "report.json");
  assert.match(download.href, /^data:application\/json;charset=utf-8,/);
  assert.deepEqual(JSON.parse(decodeURIComponent(download.href.split(",")[1])), {
    ok: true
  });
});

function withEnv(values) {
  const previous = {};

  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

function mockFetch(implementation) {
  const previous = globalThis.fetch;
  globalThis.fetch = implementation;

  return () => {
    globalThis.fetch = previous;
  };
}

function jsonResponse(body, status) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    }
  };
}

function textResponse(body, status) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return body;
    }
  };
}
