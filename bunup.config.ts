import {defineConfig} from 'bunup';

export default defineConfig([
    {
        outDir: 'build',
        entry: ['./src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        minify: true,
        splitting: true,
    },
    {
        name: 'cli',
        outDir: 'build',
        entry: ['./src/cli.ts'],
        format: ['esm'],
        minify: true,
        splitting: true,
    },
    {
        name: 'dts-worker',
        outDir: 'build',
        format: ['cjs'],
        entry: {
            dtsWorker: './src/dts/worker.ts',
        },
        minify: true,
        splitting: true,
    },
]);
