# Options

Bunup provides a rich set of options to customize your build. See the table of contents on the right side to quickly navigate to the option you are looking for.

## Entry Points

Bunup supports multiple ways to define entry points. Entry points are the source files that Bunup will use as starting points for bundling.

### Single Entry Point

The simplest way to define an entry point is to provide a single file path:

::: code-group

```sh [CLI]
bunup src/index.ts
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: 'src/index.ts',
});
```

:::

This will generate an output file named after the input file (e.g., `dist/index.js`).

### Multiple Entry Points

You can specify multiple entry points in several ways:

::: code-group

```sh [CLI - method 1]
bunup src/index.ts src/cli.ts
```

```sh [CLI - method 2]
bunup --entry src/index.ts --entry src/cli.ts
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: ['src/index.ts', 'src/cli.ts'],
});
```

:::

This will generate output files named after each input file (e.g., `dist/index.js` and `dist/cli.js`).

### Using Glob Patterns

You can use glob patterns to include multiple files that match a pattern:

::: code-group

```sh [CLI]
bunup 'src/**/*.ts' '!src/**/*.test.ts'
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: [
            'src/**/*.ts',
            '!src/**/*.test.ts',
            '!src/internal/**/*.ts'
      ],
});
```

:::

Glob pattern features:
- Use patterns like `**/*.ts` to match files recursively
- Prefix patterns with `!` to exclude files that match the pattern
- Patterns are resolved relative to the project root

## Output Formats

Bunup supports three output formats:

- **esm**: ECMAScript modules (default)
- **cjs**: CommonJS modules
- **iife**: Immediately Invoked Function Expression (for browser)

You can specify one or more formats:

### Using the CLI

::: code-group

```sh [CLI - single format]
bunup src/index.ts --format esm
```

```sh [CLI - multiple formats]
bunup src/index.ts --format esm,cjs,iife
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],
	// Single format
	format: ['esm'],

	// Or multiple formats
	// format: ['esm', 'cjs', 'iife'],
});
```

:::

### Output File Extensions

The file extensions are determined automatically based on the format and your package.json `type` field:

**When package.json has `"type": "module"`:**

| Format | JavaScript Extension | TypeScript Declaration Extension |
| ------ | -------------------- | -------------------------------- |
| esm    | `.js`                | `.d.ts`                          |
| cjs    | `.cjs`               | `.d.cts`                         |
| iife   | `.global.js`         | `.global.d.ts`                   |

**When package.json has `"type": "commonjs"` or is unspecified:**

| Format | JavaScript Extension | TypeScript Declaration Extension |
| ------ | -------------------- | -------------------------------- |
| esm    | `.mjs`               | `.d.mts`                         |
| cjs    | `.js`                | `.d.ts`                          |
| iife   | `.global.js`         | `.global.d.ts`                   |

## Named Configurations

You can give your build configurations names for better logging:

::: code-group

```sh [CLI]
bunup src/index.ts --name my-library
```

```ts [bunup.config.ts]
export default defineConfig({
    name: 'my-library',
    entry: ['src/index.ts'],
});
```

:::

This is especially useful when you have multiple configurations:

```typescript
export default defineConfig([
	{
		name: 'node-build',
		entry: ['src/index.ts'],
		format: ['cjs'],
		target: 'node',
		// ... other options
	},
	{
		name: 'browser-build',
		entry: ['src/index.ts'],
		format: ['esm', 'iife'],
		// ... other options
	},
]);
```

## Customizing Dependency Bundling

By default, Bunup treats all packages listed in your `package.json` under `dependencies` and `peerDependencies` as **external**. This means:

- `dependencies` will be installed automatically when your package is installed.

- `peerDependencies` are expected to be installed by the end user.

These external packages are **not included** in your final bundle.

However, any modules listed in `devDependencies` or others **will be bundled**.

### External Dependencies

You can explicitly mark any package as external, even if it's not listed in `dependencies` or `peerDependencies`.

#### Using the CLI

::: code-group

```sh [CLI - single package]
bunup src/index.ts --external lodash
```

```sh [CLI - multiple packages]
bunup src/index.ts --external lodash,react,react-dom
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],
	external: ['lodash', 'react', '@some/package'],
});
```

:::

### Forcing External Packages to Be Bundled

Sometimes, you may want to include specific modules in your bundle, even if they're marked as external (e.g., part of `dependencies` or `peerDependencies`).

#### Using the CLI

::: code-group

```sh [CLI]
# Mark lodash as external, but include lodash/merge in the bundle
bunup src/index.ts --external lodash --no-external lodash/merge
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],
	external: ['lodash'],
	noExternal: ['lodash/merge'], // This will be bundled
});
```

:::

::: info
Both `external` and `noExternal` support exact strings and regular expressions.
:::

## Tree Shaking

Bunup tree-shakes your code by default. No configuration is needed.

## Code Splitting

Code splitting allows Bunup to split your code into multiple chunks for better performance and caching.

### Default Behavior

- Code splitting is **enabled by default** for ESM format
- Code splitting is **disabled by default** for CJS and IIFE formats

### Configuring Code Splitting

You can explicitly enable or disable code splitting:

#### Using the CLI

::: code-group

```sh [CLI]
# Enable code splitting
bunup src/index.ts --splitting

# Disable code splitting
bunup src/index.ts --splitting=false
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	// Enable for all formats
	splitting: true,

	// Or disable for all formats
	// splitting: false,
});
```

:::

## Minification

Bunup provides several minification options to reduce the size of your output files.

### Basic Minification

To enable all minification options:

::: code-group

```sh [CLI]
bunup src/index.ts --minify
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    minify: true,
});
```

:::

### Granular Minification Control

You can configure individual minification options:

#### Using the CLI

::: code-group

```sh [CLI - single option]
# Minify whitespace only
bunup src/index.ts --minify-whitespace
```

```sh [CLI - multiple options]
# Minify whitespace and syntax, but not identifiers
bunup src/index.ts --minify-whitespace --minify-syntax
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],
	// Configure individual options
	minifyWhitespace: true,
	minifyIdentifiers: false,
	minifySyntax: true,
});
```

:::

The `minify` option is a shorthand that enables all three specific options. If you set individual options, they take precedence over the `minify` setting.

## Bytecode

Bunup can generate bytecode for your JavaScript/TypeScript entrypoints, which can significantly improve startup times for large applications.

::: code-group

```sh [CLI]
bunup src/index.ts --bytecode --target bun
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    bytecode: true,
    target: 'bun',  // Bytecode compilation requires "bun" target
});
```

:::

For more information, see the [Bun documentation on bytecode](https://bun.sh/docs/bundler#bytecode) and [Bun's blog post on bytecode compilation](https://bun.sh/blog/bun-v1.1.30#compile-to-bytecode-for-2x-faster-startup-time).

## Source Maps

Bunup can generate source maps for your bundled code:

::: code-group

```sh [CLI - linked]
bunup src/index.ts --sourcemap linked
```

```sh [CLI - inline]
# Use --sourcemap for inline source maps
bunup src/index.ts --sourcemap
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    sourcemap: 'linked'
    // Can also use boolean
    // sourcemap: true // equivalent to 'inline'
});
```

:::

Available sourcemap values:

- `none`
- `linked`
- `external`
- `inline`
- `true` (equivalent to 'inline')

For detailed explanations of these values, see the [Bun documentation on source maps](https://bun.sh/docs/bundler#sourcemap).

## Define Global Constants

Bunup allows you to define global constants that will be replaced at build time. This is useful for feature flags, version numbers, or any other build-time constants.

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	define: {
		PACKAGE_VERSION: '"1.0.0"',
		DEBUG: 'false',
	},
});
```

The `define` option takes an object where:

- Keys are the identifiers to replace
- Values are the strings to replace them with

For more information on how define works, see the [Bun documentation on define](https://bun.sh/docs/bundler#define).

## Banner and Footer

You can add custom text to the beginning and end of your bundle files:

::: code-group

```sh [CLI]
bunup src/index.ts --banner 'use client' --footer '// built with love in SF'
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: ['src/index.ts'],
      // Add text to the beginning of bundle files
      banner: '"use client";',
      // Add text to the end of bundle files
      footer: '// built with love in SF',
});
```

:::

The `banner` option adds text to the beginning of the bundle, useful for directives like "use client" for React or license information.

The `footer` option adds text to the end of the bundle, which can be used for license information or other closing comments.

For more information, see the Bun documentation on [banner](https://bun.sh/docs/bundler#banner) and [footer](https://bun.sh/docs/bundler#footer).

## Drop Function Calls

You can remove specific function calls from your bundle:

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	drop: ['console', 'debugger', 'anyIdentifier.or.propertyAccess'],
});
```

The `drop` option removes function calls specified in the array. For example, `drop: ["console"]` will remove all calls to `console.log`. Arguments to calls will also be removed, regardless of if those arguments may have side effects. Dropping `debugger` will remove all `debugger` statements.

For more information, see the [Bun documentation on drop](https://bun.sh/docs/bundler#drop).

## Custom Loaders

You can configure how different file types are loaded:

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	loader: {
		'.png': 'dataurl',
		'.txt': 'file',
	},
});
```

The `loader` option takes a map of file extensions to built-in loader names, allowing you to customize how different file types are processed during bundling.

For more information, see the [Bun documentation on loaders](https://bun.sh/docs/bundler#loader).

## Public Path

You can specify a prefix to be added to specific import paths in your bundled code:

::: code-group

```sh [CLI]
bunup src/index.ts --public-path https://cdn.example.com/
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: ['src/index.ts'],
      publicPath: 'https://cdn.example.com/',
});
```

:::

The `publicPath` option only affects certain types of imports in the final bundle:

- Asset imports (like images or SVG files)
- External modules
- Chunk files when code splitting is enabled

By default, these imports are relative. Setting `publicPath` will prefix these specific file paths with the specified value, which is useful for serving assets from a CDN.

For example:

```js [Input]
import logo from './logo.svg';
console.log(logo);
```

```js [Output without publicPath]
var logo = './logo-a7305bdef.svg';
console.log(logo);
```

```js [Output with publicPath]
var logo = 'https://cdn.example.com/logo-a7305bdef.svg';
console.log(logo);
```

For more information, see the [Bun documentation on publicPath](https://bun.sh/docs/bundler#publicpath).

## Environment Variables

Bunup provides flexible options for handling environment variables in your bundled code:

::: code-group

```sh [CLI]
# Inline all environment variables available at build time
FOO=bar API_KEY=secret bunup src/index.ts --env inline

# Disable all environment variable inlining
bunup src/index.ts --env disable

# Only inline environment variables with a specific prefix (e.g., PUBLIC_)
PUBLIC_URL=https://example.com bunup src/index.ts --env PUBLIC_*
```

```ts [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts'],

	// Inline all available environment variables at build time
	env: 'inline',

	// Or disable inlining entirely (keep process.env.FOO in the output)
	// env: "disable",

	// Or inline only variables that start with a specific prefix
	// env: "PUBLIC_*",

	// Or explicitly provide specific environment variables
	// These will replace both process.env.FOO and import.meta.env.FOO
	// env: {
	//   API_URL: "https://api.example.com",
	//   DEBUG: "false",
	// },
});
```

:::

### How it Works

The `env` option controls how `process.env.*` and `import.meta.env.*` expressions are replaced at build time:

| Value            | Behavior                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `"inline"`       | Replaces all `process.env.VAR` references in your code with the actual values of those environment variables at the time of the build. |
| `"disable"`      | Disables environment variable replacement. Keeps `process.env.VAR` as-is in output.                                                    |
| `"PREFIX_*"`     | Only inlines environment variables matching the given prefix (e.g. `PUBLIC_*`).                                                        |
| `{ key: value }` | Replaces both `process.env.KEY` and `import.meta.env.KEY` with the provided values, regardless of the environment.                     |

For more information, see the [Bun documentation on environment variables](https://bun.sh/docs/bundler#env).

## Target Environments

Bunup allows you to specify the target environment for your bundle:

::: code-group

```sh [CLI]
bunup src/index.ts --target browser
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    target: 'browser',
});
```

:::

Available targets:

- `node` (default): Optimized for Node.js
- `browser`: Optimized for browsers
- `bun`: For generating bundles that are intended to be run by the Bun runtime.

If a file contains a Bun shebang (`#!/usr/bin/env bun`), the `bun` target will be used automatically for that file.

When targeting `bun`, bundles are marked with a special `// @bun` pragma that tells the Bun runtime not to re-transpile the file before execution. While bundling isn't always necessary for server-side code, it can improve startup times and runtime performance.

## Output Directory

You can specify where Bunup should output the bundled files:

::: code-group

```sh [CLI]
bunup src/index.ts --out-dir build
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'build',
});
```

:::

The default output directory is `dist`.

## Cleaning the Output Directory

By default, Bunup cleans the output directory before each build. You can disable this behavior:

::: code-group

```sh [CLI]
bunup src/index.ts --clean=false
```

```ts [bunup.config.ts]
export default defineConfig({
    entry: ['src/index.ts'],
    clean: false,
});
```

:::

## Post-build Operations

The `onSuccess` callback runs after the build process successfully completes. This is useful for performing custom post-build operations:

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	onSuccess: (options) => {
		console.log('Build completed successfully!');
		// Perform post-build operations here
		// The options parameter contains the build options that were used
	},
});
```

If you enable watch mode, the `onSuccess` callback will execute after each successful rebuild. If you want to perform post-build operations only when not in watch mode, you can check the `watch` property in the options:

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	onSuccess: (options) => {
		if (options.watch) return;

		console.log('Build completed! Only running in non-watch mode');
		// Perform operations that should only happen in regular builds
	},
});
```

### Using CLI

The `onSuccess` CLI option allows you to specify a shell command that will be executed after a successful build:

```sh
bunup src/index.ts --onSuccess "echo 'Build done!' && node scripts/post-build.js"
```

::: info
In watch mode, `onSuccess` runs after each rebuild.
:::
