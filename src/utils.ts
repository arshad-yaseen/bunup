import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path, { normalize } from 'node:path'

import { BunupBuildError } from './errors'
import type { Format } from './options'

export function ensureArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value]
}

export function getDefaultJsOutputExtension(
	format: Format,
	packageType: string | undefined,
): string {
	switch (format) {
		case 'esm':
			return isModulePackage(packageType) ? '.js' : '.mjs'
		case 'cjs':
			return isModulePackage(packageType) ? '.cjs' : '.js'
		case 'iife':
			return '.global.js'
	}
}

export function getDefaultDtsOutputExtension(
	format: Format,
	packageType: string | undefined,
): string {
	switch (format) {
		case 'esm':
			return isModulePackage(packageType) ? '.d.ts' : '.d.mts'
		case 'cjs':
			return isModulePackage(packageType) ? '.d.cts' : '.d.ts'
		case 'iife':
			return '.global.d.ts'
	}
}

export function getBaseFileName(filePath: string): string {
	const filename = path.basename(filePath)
	const extension = path.extname(filename)
	return extension ? filename.slice(0, -extension.length) : filename
}

export function removeExtension(filePath: string): string {
	return filePath.replace(path.extname(filePath), '')
}

export function cleanPath(filePath: string): string {
	return filePath.replace(/\\/g, '/')
}

export function isModulePackage(packageType: string | undefined): boolean {
	return packageType === 'module'
}

export function formatTime(ms: number): string {
	return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`
}

export function getPackageDeps(
	packageJson: Record<string, unknown> | null,
): string[] {
	if (!packageJson) return []

	return Array.from(
		new Set([
			...Object.keys(packageJson.dependencies || {}),
			...Object.keys(packageJson.peerDependencies || {}),
		]),
	)
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B'

	const units = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))

	if (i === 0) return `${bytes} ${units[i]}`

	return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`
}

export function getShortFilePath(filePath: string, maxLength = 3): string {
	const fileParts = filePath.split('/')
	const shortPath = fileParts.slice(-maxLength).join('/')
	return shortPath
}

export async function cleanOutDir(
	rootDir: string,
	outDir: string,
): Promise<void> {
	const outDirPath = path.join(rootDir, outDir)
	try {
		await fs.rm(outDirPath, { recursive: true, force: true })
	} catch (error) {
		throw new BunupBuildError(`Failed to clean output directory: ${error}`)
	}
	await fs.mkdir(outDirPath, { recursive: true })
}

/**
 * Converts a file path to a portable format by:
 * - Normalizing path separators to forward slashes
 * - Removing Windows drive letters (e.g. C:/)
 * - Removing leading slashes
 * - Collapsing multiple slashes to single slash
 */
export function makePortablePath(path: string): string {
	let cleaned = normalize(path).replace(/\\/g, '/')

	cleaned = cleaned.replace(/^[a-zA-Z]:\//, '')

	cleaned = cleaned.replace(/^\/+/, '')

	cleaned = cleaned.replace(/\/+/g, '/')

	return cleaned
}

export function isDirectoryPath(filePath: string): boolean {
	return path.extname(filePath) === ''
}

export function pathExistsSync(filePath: string): boolean {
	try {
		fsSync.accessSync(filePath)
		return true
	} catch (error) {
		return false
	}
}

export function formatListWithAnd(arr: string[]): string {
	return new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction',
	}).format(arr)
}
