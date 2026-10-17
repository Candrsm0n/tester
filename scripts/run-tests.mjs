#!/usr/bin/env node
// ============================================================================
// TOPUPKU - AUTOMATED TYPESCRIPT COMPILER & TEST RUNNER (scripts/run-tests.mjs)
// Uses Babel TypeScript/React compiler to transpile and execute Unit &
// Integration tests against the real TypeScript source tree.
// ============================================================================

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const require = createRequire(import.meta.url);
// Resolve @babel/core from project node_modules or system /usr/share/nodejs
const babelPaths = [
  path.join(projectRoot, "node_modules"),
  "/usr/share/nodejs",
  "/usr/lib/node_modules",
];
const babel = require(require.resolve("@babel/core", { paths: babelPaths }));
const presetTs = require.resolve("@babel/preset-typescript", { paths: babelPaths });
const presetEnv = require.resolve("@babel/preset-env", { paths: babelPaths });
const presetReact = require.resolve("@babel/preset-react", { paths: babelPaths });

const compiledCache = new Map();

function resolveTsFile(importSpec, parentDir) {
  let candidateBase = importSpec;
  if (importSpec.startsWith("@/")) {
    candidateBase = path.join(projectRoot, "src", importSpec.slice(2));
  } else if (importSpec.startsWith(".")) {
    candidateBase = path.resolve(parentDir, importSpec);
  } else {
    return null; // Built-in or external module
  }

  const extensions = [".ts", ".tsx", "/index.ts", "/index.tsx", ".js"];
  for (const ext of extensions) {
    const full = candidateBase.endsWith(ext) ? candidateBase : candidateBase + ext;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return full;
    }
  }
  return null;
}

function loadTsModule(filePath) {
  const normalized = path.resolve(filePath);
  if (compiledCache.has(normalized)) {
    return compiledCache.get(normalized).exports;
  }

  const code = fs.readFileSync(normalized, "utf-8");
  const transformed = babel.transformSync(code, {
    filename: normalized,
    presets: [
      [presetEnv, { targets: { node: "current" }, modules: "commonjs" }],
      [presetTs, { isTSX: normalized.endsWith(".tsx"), allExtensions: true }],
      [presetReact, { runtime: "classic" }],
    ],
  });

  const moduleObj = { exports: {} };
  compiledCache.set(normalized, moduleObj);

  const customRequire = (spec) => {
    const resolvedLocal = resolveTsFile(spec, path.dirname(normalized));
    if (resolvedLocal) {
      return loadTsModule(resolvedLocal);
    }
    return require(spec);
  };

  const wrapper = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    transformed.code
  );
  wrapper(
    moduleObj.exports,
    customRequire,
    moduleObj,
    normalized,
    path.dirname(normalized)
  );
  return moduleObj.exports;
}

async function main() {
  console.log("================================================================");
  console.log("🧪 TOPUPKU - AUTOMATED UNIT & INTEGRATION TEST SUITE");
  console.log("================================================================");

  const unitMod = loadTsModule(path.join(projectRoot, "tests/unit.test.ts"));
  const unitRes = await unitMod.runUnitTests();
  for (const line of unitRes.details) {
    console.log("  ✅ " + line);
  }

  const intMod = loadTsModule(path.join(projectRoot, "tests/integration.test.ts"));
  const intRes = await intMod.runIntegrationTests();
  for (const line of intRes.details) {
    console.log("  ✅ " + line);
  }

  console.log("----------------------------------------------------------------");
  console.log(
    `🎉 ALL TESTS PASSED: ${unitRes.passed} Unit Suites + ${intRes.passed} Integration Suites = ${
      unitRes.passed + intRes.passed
    }/${unitRes.passed + intRes.passed} (100% PASS)`
  );
  console.log("================================================================");
}

main().catch((err) => {
  console.error("❌ TEST FAILURE:", err);
  process.exit(1);
});
