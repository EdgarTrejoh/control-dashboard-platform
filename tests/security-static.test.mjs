import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
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
