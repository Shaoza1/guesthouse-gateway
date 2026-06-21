#!/usr/bin/env node
// Removes the vite-tsconfig-paths plugin from @lovable.dev/vite-tanstack-config
// since Vite now supports tsconfig paths natively via resolve.tsconfigPaths.
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const files = [
  "node_modules/@lovable.dev/vite-tanstack-config/dist/index.js",
  "node_modules/@lovable.dev/vite-tanstack-config/dist/index.cjs",
];

for (const file of files) {
  const abs = resolve(file);
  try {
    const src = readFileSync(abs, "utf8");
    const patched = src
      .replace(/\s*const tsConfigPaths = \(await import\("vite-tsconfig-paths"\)\)\.default;\s*/g, " ")
      .replace(/\s*internalPlugins\.push\(tsConfigPaths\(\{ projects: \["\.\/tsconfig\.json"\] \}\)\);\s*/g, " ");
    if (patched !== src) {
      writeFileSync(abs, patched, "utf8");
      console.log(`[postinstall] Patched ${file}`);
    }
  } catch {
    // file may not exist in all environments — safe to skip
  }
}
