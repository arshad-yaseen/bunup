#!/usr/bin/env bun
import {build} from './build';
import {parseCliOptions} from './cli-parse';
import {handleErrorAndExit} from './errors';
import {loadConfigs} from './loaders';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

import {validateFilesUsedToBundleDts} from './dts/validation';
import {cleanOutDir, formatTime, getShortFilePath} from './utils';
import {watch} from './watch';

export const allFilesUsedToBundleDts = new Set<string>();

export async function main(args: string[] = Bun.argv.slice(2)) {
      const cliOptions = parseCliOptions(args);
      const {configs, configFilePath} = await loadConfigs(process.cwd());

      if (configFilePath) {
            logger.cli(
                  `Using config file: ${getShortFilePath(configFilePath, 2)}`,
            );
      }

      if (cliOptions.watch) {
            logger.cli('Starting watch mode');
            logger.cli(`Watching for file changes`);
      }

      const startTime = performance.now();

      logger.cli('Build started');

      if (configs.length === 0) {
            const mergedOptions = {
                  ...DEFAULT_OPTIONS,
                  ...cliOptions,
            } as BunupOptions;

            const rootDir = process.cwd();

            if (mergedOptions.clean) cleanOutDir(rootDir, mergedOptions.outDir);

            await handleBuild(mergedOptions, rootDir);
      } else {
            for (const {options, rootDir} of configs) {
                  if (options.clean) cleanOutDir(rootDir, options.outDir);
            }

            await Promise.all(
                  configs.map(async ({options, rootDir}) => {
                        const mergedOptions = {
                              ...DEFAULT_OPTIONS,
                              ...options,
                              ...cliOptions,
                        };
                        await handleBuild(mergedOptions, rootDir);
                  }),
            );
      }

      const buildTimeMs = performance.now() - startTime;
      const timeDisplay = formatTime(buildTimeMs);
      logger.cli(`⚡️ Build completed in ${timeDisplay}`);

      if (allFilesUsedToBundleDts.size > 0) {
            await validateFilesUsedToBundleDts(allFilesUsedToBundleDts);
            allFilesUsedToBundleDts.clear();
      }

      if (!cliOptions.watch) {
            process.exit(0);
      }
}

async function handleBuild(options: BunupOptions, rootDir: string) {
      if (options.watch) {
            await watch(options, rootDir);
      } else {
            await build(options, rootDir);
            options.onBuildEnd?.();
      }
}

main().catch(error => handleErrorAndExit(error));
