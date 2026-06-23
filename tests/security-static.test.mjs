import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const ignoredDirs = new Set([".git", ".next", "node_modules"]);
const checkedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md"]);
const ignoredTopLevelFiles = new Set(["README.md"]);
const ignoredTopLevelDirs = new Set(["docs"]);

test("forbidden public secret patterns are absent", async () => {
  const files = await collectFiles(root);
  const offenders = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const path = relative(root, file);

    if (path.endsWith("security-static.test.mjs")) {
      continue;
    }

    if (shouldSkipDocumentation(path)) {
      continue;
    }

    if (content.includes("NEXT_PUBLIC_INFONAVIT_API_KEY")) {
      offenders.push(path);
    }
  }

  assert.deepEqual(offenders, []);
});

test("auth secrets are not declared as NEXT_PUBLIC variables", async () => {
  const files = await collectFiles(root);
  const offenders = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const path = relative(root, file);

    if (path.endsWith("security-static.test.mjs")) {
      continue;
    }

    if (shouldSkipDocumentation(path)) {
      continue;
    }

    if (/NEXT_PUBLIC_AUTH_|NEXT_PUBLIC_GOOGLE_|NEXT_PUBLIC_.*SECRET/.test(content)) {
      offenders.push(path);
    }
  }

  assert.deepEqual(offenders, []);
});

test("Google OAuth secret is not referenced from browser-facing source", async () => {
  const files = await collectFiles(join(root, "src"));
  const offenders = [];

  for (const file of files) {
    const path = relative(root, file);
    const content = await readFile(file, "utf8");

    if (content.includes("AUTH_GOOGLE_SECRET")) {
      offenders.push(path);
    }
  }

  assert.deepEqual(offenders, []);
});

test("browser-facing source does not send X-API-Key", async () => {
  const files = await collectFiles(join(root, "src"));
  const offenders = [];

  for (const file of files) {
    const path = relative(root, file);
    const content = await readFile(file, "utf8");

    if (path.includes("modules\\infonavit\\api") || path.includes("modules/infonavit/api")) {
      continue;
    }

    if (content.includes("X-API-Key")) {
      offenders.push(path);
    }
  }

  assert.deepEqual(offenders, []);
});

test("executable source does not add direct Supabase clients", async () => {
  const files = await collectFiles(root);
  const offenders = [];

  for (const file of files) {
    const path = relative(root, file);
    const content = await readFile(file, "utf8");

    if (path.endsWith("security-static.test.mjs")) {
      continue;
    }

    if (shouldSkipDocumentation(path)) {
      continue;
    }

    if (/@supabase\/supabase-js|createClient\(|DATABASE_URL/.test(content)) {
      offenders.push(path);
    }
  }

  assert.deepEqual(offenders, []);
});

test("next config defines minimum security headers", async () => {
  const { default: nextConfig } = await import(
    pathToFileURL(join(root, "next.config.mjs"))
  );

  assert.equal(nextConfig.poweredByHeader, false);
  assert.equal(typeof nextConfig.headers, "function");

  const headerRules = await nextConfig.headers();
  assert.equal(headerRules.length, 1);
  assert.equal(headerRules[0].source, "/:path*");

  const headers = Object.fromEntries(
    headerRules[0].headers.map(({ key, value }) => [key, value])
  );

  assert.deepEqual(headers, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy":
      "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-write=(self)"
  });
  assert.equal(headers["Strict-Transport-Security"], undefined);
});

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    if (checkedExtensions.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldSkipDocumentation(path) {
  const normalized = path.replaceAll("\\", "/");
  const firstSegment = normalized.split("/")[0];

  return ignoredTopLevelDirs.has(firstSegment) || ignoredTopLevelFiles.has(normalized);
}
