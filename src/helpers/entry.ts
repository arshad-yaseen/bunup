import { basename, extname } from 'node:path'
import type { BuildOptions } from '../options'
import type { BunBuildOptions } from '../types'

export type ProcessableEntry = {
	path: string
	outputBasePath: string | null
	dts: boolean
}

export function getEntryNameOnly(entry: string): string {
	const filename = basename(entry)
	const extension = extname(filename)
	return extension ? filename.slice(0, -extension.length) : filename
}

export function getProcessableEntries(
	options: BuildOptions,
): ProcessableEntry[] {
	const dtsEntry =
		typeof options.dts === 'object' && 'entry' in options.dts
			? options.dts.entry
			: undefined

	let entries: ProcessableEntry[] = []

	if (typeof options.entry === 'string') {
		entries = [
			{
				path: options.entry,
				outputBasePath: null,
				dts: false,
			},
		]
	} else if (
		typeof options.entry === 'object' &&
		!Array.isArray(options.entry)
	) {
		entries = Object.entries(options.entry).map(([name, path]) => ({
			path,
			outputBasePath: name,
			dts: false,
		}))
	} else {
		entries = options.entry.map((entry) => ({
			path: entry,
			outputBasePath: null,
			dts: false,
		}))
	}

	if (typeof options.dts !== 'undefined' && !dtsEntry) {
		entries = entries.map((entry) => ({
			...entry,
			dts: true,
		}))
	} else if (dtsEntry) {
		let dtsEntries: ProcessableEntry[] = []

		if (typeof dtsEntry === 'string') {
			dtsEntries = [
				{
					path: dtsEntry,
					outputBasePath: null,
					dts: true,
				},
			]
		} else if (typeof dtsEntry === 'object' && !Array.isArray(dtsEntry)) {
			dtsEntries = Object.entries(dtsEntry).map(([name, path]) => ({
				path,
				outputBasePath: name,
				dts: true,
			}))
		} else {
			dtsEntries = dtsEntry.map((entry) => ({
				path: entry,
				outputBasePath: null,
				dts: true,
			}))
		}

		const processedPaths = new Set<string>()

		entries = entries.map((entry) => {
			const shouldGenerateDts = dtsEntries.some(
				(dtsEntry) =>
					dtsEntry.path === entry.path &&
					dtsEntry.outputBasePath === entry.outputBasePath,
			)
			if (shouldGenerateDts) {
				processedPaths.add(`${entry.path}:${entry.outputBasePath}`)
			}
			return {
				...entry,
				dts: shouldGenerateDts,
			}
		})

		for (const dtsEntry of dtsEntries) {
			if (
				!processedPaths.has(
					`${dtsEntry.path}:${dtsEntry.outputBasePath}`,
				)
			) {
				entries.push(dtsEntry)
			}
		}
	}

	return entries
}

export function getResolvedNaming(
	outputBasePath: string | null,
	extension: string,
): BunBuildOptions['naming'] {
	return {
		entry: `[dir]/${outputBasePath || '[name]'}${extension}`,
		chunk: `${outputBasePath || '[name]'}-[hash].[ext]`,
		asset: `${outputBasePath ? `${outputBasePath}-` : ''}[name]-[hash].[ext]`,
	}
}
