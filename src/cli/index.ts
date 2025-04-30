#!/usr/bin/env bun
import { exec } from 'tinyexec'
import { version } from '../../package.json'
import { handleErrorAndExit } from '../errors'
import { logger, setSilent } from '../logger'
import type { BuildOptions, CliOptions } from '../options'
import { parseCliOptions } from './parse'

import { loadConfig } from 'coffi'
import pc from 'picocolors'
import { type ProcessableConfig, processLoadedConfigs } from '../loaders'
import type { Arrayable, DefineConfigItem, DefineWorkspaceItem } from '../types'
import { ensureArray, formatTime, getShortFilePath } from '../utils'
import { watch } from '../watch'

export type LoadedConfig = Arrayable<DefineConfigItem | DefineWorkspaceItem>

async function main(args: string[] = Bun.argv.slice(2)): Promise<void> {
	const commandWasExecuted = await registerCommands(args)

	if (commandWasExecuted) {
		return
	}

	const cliOptions = parseCliOptions(args)

	setSilent(cliOptions.silent)

	const cwd = process.cwd()

	const { config, filepath } = await loadConfig<LoadedConfig>({
		name: 'bunup.config',
		extensions: ['.ts', '.js', '.mjs', '.cjs'],
		maxDepth: 1,
		preferredPath: cliOptions.config,
		packageJsonProperty: 'bunup',
	})

	const configsToProcess: ProcessableConfig[] = !config
		? [{ rootDir: cwd, options: cliOptions }]
		: await processLoadedConfigs(config, cwd, cliOptions.filter)

	logger.cli(`Using bunup v${version} and bun v${Bun.version}`, {
		muted: true,
	})

	if (filepath) {
		logger.cli(`Using ${getShortFilePath(filepath, 2)}`, {
			muted: true,
		})
	}

	const startTime = performance.now()

	logger.cli('Build started')

	const { build } = await import('../build')

	await Promise.all(
		configsToProcess.flatMap(({ options, rootDir }) => {
			const optionsArray = ensureArray(options)
			return optionsArray.map(async (o) => {
				const partialOptions: Partial<BuildOptions> = {
					...o,
					...removeCliOnlyOptions(cliOptions),
				}

				if (partialOptions.watch) {
					await watch(partialOptions, rootDir)
				} else {
					await build(partialOptions, rootDir)
				}
			})
		}),
	)

	const buildTimeMs = performance.now() - startTime
	const timeDisplay = formatTime(buildTimeMs)

	logger.cli(`⚡️ Build completed in ${pc.green(timeDisplay)}`)

	if (cliOptions.watch) {
		logger.cli('👀 Watching for file changes')
	}

	if (cliOptions.onSuccess) {
		logger.cli(`Running command: ${cliOptions.onSuccess}`, {
			muted: true,
		})

		await exec(cliOptions.onSuccess, [], {
			nodeOptions: { shell: true, stdio: 'inherit' },
		})
	}

	if (!cliOptions.watch) {
		process.exit(process.exitCode ?? 0)
	}
}

function removeCliOnlyOptions(options: Partial<CliOptions>) {
	return {
		...options,
		onSuccess: undefined,
		config: undefined,
	}
}

async function registerCommands(args: string[]): Promise<boolean> {
	const command = args[0]

	switch (command) {
		case 'init': {
			const { init } = await import('./init')
			init()
			return true
		}
	}

	return false
}

main().catch((error) => handleErrorAndExit(error))
