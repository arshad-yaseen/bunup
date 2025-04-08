import path from "node:path";

import { build as bunupBuild } from "bunup";
import { build as tsdownBuild } from "tsdown";
import { build as unbuildBuild } from "unbuild";

import { ENTRY_POINT, RESULTS_FILE } from "./constants.mjs";
import { runBenchmarksForBundlers, saveBenchmarkResults } from "./utils.mjs";

const bundlers = [
    {
        name: "bunup",
        buildFn: (options) => bunupBuild(options, process.cwd()),
        options: (dts) => ({
            entry: [ENTRY_POINT],
            outDir: "bunup-dist",
            format: ["esm", "cjs"],
            dts,
            clean: true,
            // tree shaking is always enabled, so we don't need to pass treeshake: true
            // https://bun.sh/blog/bun-bundler?utm_source=chatgpt.com#tree-shaking
        }),
    },
    {
        name: "tsdown",
        buildFn: tsdownBuild,
        options: (dts) => ({
            entry: [ENTRY_POINT],
            outDir: "tsdown-dist",
            format: ["esm", "cjs"],
            dts,
            treeshake: true,
            clean: true,
        }),
    },
    {
        name: "unbuild",
        buildFn: (options) => unbuildBuild(process.cwd(), false, options),
        options: (dts) => ({
            entries: [ENTRY_POINT],
            outDir: "unbuild-dist",
            format: ["esm", "cjs"],
            declaration: dts,
            clean: true,
        }),
    },
];

async function runBenchmarks() {
    try {
        const results = await runBenchmarksForBundlers(bundlers);
        const benchmarkFilePath = path.resolve(process.cwd(), RESULTS_FILE);
        await saveBenchmarkResults(results, benchmarkFilePath);
    } catch (error) {
        console.error("Benchmarking failed:", error);
    }
}

runBenchmarks();
