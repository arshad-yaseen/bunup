import { beforeEach, describe, expect, it } from 'bun:test'
import { exports } from '../../src/plugins/built-in/productivity/exports'
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
			'.output/index.d.mts',
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
			'.output/index.d.mts',
		)

		expect(result.packageJson.data.exports['./utils']).toBeDefined()
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils.mjs',
		)
		expect(result.packageJson.data.exports['./utils'].types).toContain(
			'.output/utils.d.mts',
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
			'src/index.ts': 'export * from "./components/button";',
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
			'.output/index.d.ts',
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
		).toContain('.output/components/button.d.ts')

		expect(result.packageJson.data.exports['./utils/format']).toBeDefined()
		expect(result.packageJson.data.exports['./utils/format'].import).toContain(
			'.output/utils/format.mjs',
		)
		expect(result.packageJson.data.exports['./utils/format'].require).toContain(
			'.output/utils/format.js',
		)
		expect(result.packageJson.data.exports['./utils/format'].types).toContain(
			'.output/utils/format.d.ts',
		)
	})

	it('should handle named entry points', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/main.ts': 'export const main: string = "main entry";',
			'src/secondary.ts': 'export const secondary: string = "secondary entry";',
		})

		const result = await runBuild({
			entry: {
				main: 'src/main.ts',
				secondary: 'src/secondary.ts',
			},
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(result.packageJson.data.exports['./main']).toBeDefined()
		expect(result.packageJson.data.exports['./main'].import).toContain(
			'.output/main.mjs',
		)
		expect(result.packageJson.data.exports['./main'].types).toContain(
			'.output/main.d.mts',
		)

		expect(result.packageJson.data.exports['./secondary']).toBeDefined()
		expect(result.packageJson.data.exports['./secondary'].import).toContain(
			'.output/secondary.mjs',
		)
		expect(result.packageJson.data.exports['./secondary'].types).toContain(
			'.output/secondary.d.mts',
		)
	})

	it('should handle named entry points with custom subpaths', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/entry.ts': 'export const entry: string = "entry";',
			'src/lib/utils.ts': 'export const utils: string = "utils";',
		})

		const result = await runBuild({
			entry: {
				index: 'src/entry.ts',
				'utils/index': 'src/lib/utils.ts',
			},
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
			'.output/index.d.ts',
		)

		expect(result.packageJson.data.exports['./utils']).toBeDefined()
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils/index.mjs',
		)
		expect(result.packageJson.data.exports['./utils'].require).toContain(
			'.output/utils/index.js',
		)
		expect(result.packageJson.data.exports['./utils'].types).toContain(
			'.output/utils/index.d.ts',
		)
	})

	it('should handle complex directory structures with nested subdirectories', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export * from "./components/ui";',
			'src/components/ui/index.ts': 'export * from "./button";',
			'src/components/ui/button.ts': 'export const Button = () => "button";',
			'src/utils/formatting/text.ts':
				'export const formatText = (text: string): string => text.trim();',
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

	it('should handle custom output paths', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/main.ts': 'export const main = "main";',
		})

		const result = await runBuild({
			entry: {
				'custom/path/to/file': 'src/main.ts',
			},
			format: ['esm'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()

		expect(
			result.packageJson.data.exports['./custom/path/to/file'],
		).toBeDefined()
		expect(
			result.packageJson.data.exports['./custom/path/to/file'].import,
		).toContain('.output/custom/path/to/file.mjs')
		expect(
			result.packageJson.data.exports['./custom/path/to/file'].types,
		).toContain('.output/custom/path/to/file.d.mts')
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
		expect(result.packageJson.data.types).toContain('.output/index.d.mts')
	})
})
