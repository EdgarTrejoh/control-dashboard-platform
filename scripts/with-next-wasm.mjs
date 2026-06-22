import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const command = process.argv[2] ?? "dev";
const nextBin = join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const wasmDir = join(projectRoot, "node_modules", "@next", "swc-wasm-nodejs");

const child = spawn(process.execPath, [nextBin, command], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDir
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
