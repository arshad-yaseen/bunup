import { beforeEach, describe, expect, it } from 'bun:test'
import { exports } from '../../src/plugins'
import type { BuildOutputFile } from '../../src/plugins/types'
import { cleanProjectDir, createProject, runBuild } from '../utils'

describe('exports plugin', () => {
	beforeEach(() => {
		cleanProjectDir()
	})

	it('should add exports field to package.json for ESM format', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
	})

	it('should add exports field to package.json for CJS format', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['cjs'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
	})

	it('should handle both ESM and CJS formats', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm', 'cjs'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
	})

	it('should add types field for DTS files', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].types).toContain(
			'.output/index.d',
		)
		expect(result.packageJson.data.types).toContain('.output/index.d.mts')
	})

	it('should handle multiple entry points', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/utils.ts':
				'export const sum = (a: number, b: number): number => a + b;',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/utils.ts'],
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].types).toContain(
			'.output/index.d',
		)

		expect(result.packageJson.data.exports['./utils']).toBeDefined()
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils.mjs',
		)
		expect(result.packageJson.data.exports['./utils'].types).toContain(
			'.output/utils.d',
		)
	})

	it('should preserve existing package.json fields', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				description: 'Test package',
				author: 'Test Author',
				license: 'MIT',
				keywords: ['test', 'package'],
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.name).toBe('test-package')
		expect(result.packageJson.data.version).toBe('1.0.0')
		expect(result.packageJson.data.description).toBe('Test package')
		expect(result.packageJson.data.author).toBe('Test Author')
		expect(result.packageJson.data.license).toBe('MIT')
		expect(result.packageJson.data.keywords).toEqual(['test', 'package'])
		expect(result.packageJson.data.exports).toBeDefined()
	})

	it('should handle subpath exports correctly', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/components/button.ts': 'export const Button = () => "button";',
			'src/utils/format.ts':
				'export const format = (str: string): string => str.trim();',
		})

		const result = await runBuild({
			entry: [
				'src/index.ts',
				'src/components/button.ts',
				'src/utils/format.ts',
			],
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
		expect(result.packageJson.data.exports['.'].types).toContain(
			'.output/index.d',
		)

		expect(result.packageJson.data.exports['./components/button']).toBeDefined()
		expect(
			result.packageJson.data.exports['./components/button'].import,
		).toContain('.output/components/button.mjs')
		expect(
			result.packageJson.data.exports['./components/button'].require,
		).toContain('.output/components/button.js')
		expect(
			result.packageJson.data.exports['./components/button'].types,
		).toContain('.output/components/button.d')

		expect(result.packageJson.data.exports['./utils/format']).toBeDefined()
		expect(result.packageJson.data.exports['./utils/format'].import).toContain(
			'.output/utils/format.mjs',
		)
		expect(result.packageJson.data.exports['./utils/format'].require).toContain(
			'.output/utils/format.js',
		)
		expect(result.packageJson.data.exports['./utils/format'].types).toContain(
			'.output/utils/format.d',
		)
	})

	it('should handle complex directory structures with nested subdirectories', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/components/ui/index.ts': 'export const hello: string = "world";',
			'src/components/ui/button.ts': 'export const hello: string = "world";',
			'src/utils/formatting/text.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: [
				'src/index.ts',
				'src/components/ui/index.ts',
				'src/components/ui/button.ts',
				'src/utils/formatting/text.ts',
			],
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)

		expect(result.packageJson.data.exports['./components/ui']).toBeDefined()
		expect(
			result.packageJson.data.exports['./components/ui/button'],
		).toBeDefined()
		expect(
			result.packageJson.data.exports['./utils/formatting/text'],
		).toBeDefined()
	})

	it('should handle entries with index files', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const main = "main";',
			'src/utils/index.ts': 'export const utils = "utils";',
			'src/components/index.ts': 'export const components = "components";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/utils/index.ts', 'src/components/index.ts'],
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)

		expect(result.packageJson.data.exports['./utils']).toBeDefined()
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils/index.mjs',
		)

		expect(result.packageJson.data.exports['./components']).toBeDefined()
		expect(result.packageJson.data.exports['./components'].import).toContain(
			'.output/components/index.mjs',
		)
	})

	it('should set main module entrypoint correctly', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const main = "main";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['cjs'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.main).toBeDefined()
		expect(result.packageJson.data.main).toContain('.output/index.js')
	})

	it('should set types entrypoint correctly', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const main = "main";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.types).toBeDefined()
		expect(result.packageJson.data.types).toContain('.output/index.d')
	})

	it('should not add exports field for non-entry-point files', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/shared-utils.ts': 'export const utils = "utils";',
			'src/index.ts':
				'import { utils } from "./shared-utils"; export const main: ReturnType<typeof utils> = "main";',
			'src/math.ts':
				'import { utils } from "./shared-utils"; export const math: ReturnType<typeof utils> = "math";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/math.ts'],
			format: ['esm'],
			plugins: [exports()],
			splitting: true,
			dts: true,
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(
			!Object.keys(result.packageJson.data.exports).some((key) =>
				key.includes('chunk'),
			),
		).toBe(true)
	})

	it('should overwrite existing exports field in package.json', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				exports: {
					'.': {
						import: './old-path.mjs',
						require: './old-path.js',
						types: './old-path.d.ts',
					},
					'./utils': './old-utils-path.js',
				},
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
		expect(result.packageJson.data.exports['.'].types).toContain(
			'.output/index.d',
		)

		expect(result.packageJson.data.exports['./utils']).toBeUndefined()
	})

	it('should respect and merge extraExports option', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				exports: {
					'.': {
						import: './old-path.mjs',
						require: './old-path.js',
						types: './old-path.d.ts',
					},
					'./utils': './old-utils-path.js',
				},
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [
				exports({
					customExports: () => ({
						'./extra': './extra-path.js',
						'.': {
							browser: './browser-path.js',
						},
					}),
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
		expect(result.packageJson.data.exports['.'].types).toContain(
			'.output/index.d',
		)

		expect(result.packageJson.data.exports['.'].browser).toBe(
			'./browser-path.js',
		)

		expect(result.packageJson.data.exports['./extra']).toBe('./extra-path.js')

		expect(result.packageJson.data.exports['./utils']).toBeUndefined()
	})

	it('should handle extraExports with complex nested fields', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		let outputFiles: BuildOutputFile[] = []

		const result = await runBuild({
			entry: ['src/index.ts'],
			format: ['esm'],
			plugins: [
				exports({
					customExports: (ctx) => {
						outputFiles = ctx.output.files

						return {
							'./features': {
								import: {
									node: './node-features.mjs',
									default: './features.mjs',
								},
								require: './features.cjs',
							},
							'.': {
								worker: './worker.js',
							},
						}
					},
				}),
			],
		})

		expect(outputFiles).toHaveLength(1)

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)

		expect(result.packageJson.data.exports['.'].worker).toBe('./worker.js')

		expect(result.packageJson.data.exports['./features']).toBeDefined()
		expect(result.packageJson.data.exports['./features'].import).toEqual({
			node: './node-features.mjs',
			default: './features.mjs',
		})
		expect(result.packageJson.data.exports['./features'].require).toBe(
			'./features.cjs',
		)
	})
})
