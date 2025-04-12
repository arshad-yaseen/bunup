import { type DefineConfigItem, defineWorkspace } from "bunup";

const COMMON_OPTIONS: Partial<DefineConfigItem> = {
    outDir: "build",
    minify: true,
    splitting: false,
};

export default defineWorkspace([
    {
        name: "bunup",
        root: ".",
        config: [
            {
                ...COMMON_OPTIONS,
                entry: ["src/index.ts"],
                format: ["cjs", "esm"],
                dts: true,
            },
            {
                ...COMMON_OPTIONS,
                entry: ["src/cli.ts"],
                format: ["esm"],
            },
        ],
    },
    {
        name: "create-bunup",
        root: "./create-bunup",
        config: [
            {
                ...COMMON_OPTIONS,
                entry: ["src/index.ts"],
                format: ["esm"],
            },
        ],
    },
]);
