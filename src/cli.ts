#!/usr/bin/env bun
import {allFilesUsedToBundleDts, build} from './build';
import {parseCliOptions} from './cli-parse';
import {handleErrorAndExit} from './errors';
import {loadConfigs} from './loaders';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

import {version} from '../package.json';
import {validateFilesUsedToBundleDts} from './dts/validation';
import {
      cleanOutDir,
      formatTime,
      getResolvedClean,
      getResolvedOutDir,
      getShortFilePath,
} from './utils';
import {watch} from './watch';

export async function main(args: string[] = Bun.argv.slice(2)): Promise<void> {
      const cliOptions = parseCliOptions(args);
      const {configs, configFilePath} = await loadConfigs(process.cwd());

      logger.cli(`Using bunup v${version} and bun v${Bun.version}`, {
            muted: true,
      });

      if (configFilePath) {
            logger.cli(
                  `Using config file: ${getShortFilePath(configFilePath, 2)}`,
                  {
                        muted: true,
                  },
            );
      }

      const startTime = performance.now();

      logger.cli('Build started');

      if (configs.length === 0) {
            const mergedOptions = {
                  ...DEFAULT_OPTIONS,
                  ...cliOptions,
            } as BunupOptions;

            const rootDir = process.cwd();

            if (mergedOptions.clean)
                  cleanOutDir(rootDir, getResolvedOutDir(mergedOptions.outDir));

            await handleBuild(mergedOptions, rootDir);
      } else {
            for (const {options, rootDir} of configs) {
                  if (getResolvedClean(options.clean))
                        cleanOutDir(rootDir, getResolvedOutDir(options.outDir));
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

      await validateDtsFiles();

      if (cliOptions.watch) {
            logger.cli(`👀 Watching for file changes`);
      }

      if (!cliOptions.watch) {
            process.exit(0);
      }

      // cleanups
      logger.dispose();
}

export async function validateDtsFiles() {
      if (allFilesUsedToBundleDts.size > 0) {
            await validateFilesUsedToBundleDts(allFilesUsedToBundleDts);
            allFilesUsedToBundleDts.clear();
      }
}

async function handleBuild(options: BunupOptions, rootDir: string) {
      if (options.watch) {
            await watch(options, rootDir);
      } else {
            await build(options, rootDir);
            options.onBuildSuccess?.();
      }
}

main().catch(error => handleErrorAndExit(error));
