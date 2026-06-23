import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const moduleCache = new Map();

export function loadTsModule(projectPath) {
  const absolutePath = resolve(root, projectPath);
  return loadModule(absolutePath);
}

function loadModule(filename) {
  const resolved = resolveTsFile(filename);

  if (moduleCache.has(resolved)) {
    return moduleCache.get(resolved).exports;
  }

  const source = readFileSync(resolved, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: resolved
  }).outputText;

  const cjsModule = { exports: {} };
  moduleCache.set(resolved, cjsModule);

  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) {
      return loadModule(join(root, "src", specifier.slice(2)));
    }

    if (specifier.startsWith(".")) {
      return loadModule(resolve(dirname(resolved), specifier));
    }

    return createRequire(resolved)(specifier);
  };

  const script = new vm.Script(wrapCommonJs(output), {
    filename: resolved
  });

  const fn = script.runInThisContext();
  fn(cjsModule.exports, localRequire, cjsModule, resolved, dirname(resolved));

  return cjsModule.exports;
}

function resolveTsFile(filename) {
  const candidates = isAbsolute(filename)
    ? [filename]
    : [resolve(root, filename)];

  const extensions = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts"];

  for (const candidate of candidates) {
    for (const extension of extensions) {
      const resolved = `${candidate}${extension}`;
      try {
        readFileSync(resolved);
        return resolved;
      } catch {
        // Try next candidate.
      }
    }
  }

  throw new Error(`Unable to resolve module ${filename}`);
}

function wrapCommonJs(source) {
  return `(function (exports, require, module, __filename, __dirname) {${source}\n})`;
}
