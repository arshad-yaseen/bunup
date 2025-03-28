import {BunBuildOptions} from './types';

export type Format = 'esm' | 'cjs' | 'iife';
export type Target = 'bun' | 'node' | 'browser';
export type External = string[];
export type Sourcemap = 'none' | 'linked' | 'external' | 'inline';

export type Entry = string[] | Record<string, string>;

export type DtsOptions = {
      /**
       * Entry point files for TypeScript declaration file generation
       *
       * This can be:
       * - An array of file paths
       * - An object where keys are output names and values are input file paths
       *
       * The key names are used for the generated declaration files.
       * For example, {custom: './src/index.ts'} will generate custom.d.ts
       *
       * If not specified, the main entry points will be used for declaration file generation.
       *
       * If a string path is provided in an array, the file name (without extension)
       * will be used as the name for the output declaration file.
       *
       * @example
       * // Using string paths in an array
       * entry: ['./src/index.ts']  // Generates index.d.ts
       *
       * // Using named outputs as an object
       * entry: { myModule: './src/index.ts', utils: './src/utility-functions.ts' } // Generates myModule.d.ts and utils.d.ts
       */
      entry: Entry;
};

export interface BunupOptions {
      /**
       * Name of the build configuration
       * Used for logging and identification purposes
       */
      name?: string;

      /**
       * Entry point files for the build
       *
       * This can be:
       * - An array of file paths
       * - An object where keys are output names and values are input file paths
       *
       * The key names are used for the generated output files.
       * For example, {custom: './src/index.ts'} will generate custom.js
       *
       * If a string path is provided in an array, the file name (without extension)
       * will be used as the name for the output file.
       *
       * @example
       * // Using string paths in an array
       * entry: ['./src/index.ts']  // Generates index.js
       *
       * // Using named outputs as an object
       * entry: { myModule: './src/index.ts', utils: './src/utility-functions.ts' } // Generates myModule.js and utils.js
       */
      entry: Entry;

      /**
       * Output directory for the bundled files
       * Defaults to 'dist' if not specified
       */
      outDir: string;

      /**
       * Output formats for the bundle
       * Can include 'esm', 'cjs', and/or 'iife'
       * Defaults to ['cjs'] if not specified
       */
      format: Format[];

      /**
       * Whether to enable all minification options
       * When true, enables minifyWhitespace, minifyIdentifiers, and minifySyntax
       */
      minify?: boolean;

      /**
       * Whether to enable code splitting
       * Defaults to true for ESM format, false for CJS format
       */
      splitting?: boolean;

      /**
       * Whether to minify whitespace in the output
       * Removes unnecessary whitespace to reduce file size
       */
      minifyWhitespace?: boolean;

      /**
       * Whether to minify identifiers in the output
       * Renames variables and functions to shorter names
       */
      minifyIdentifiers?: boolean;

      /**
       * Whether to minify syntax in the output
       * Optimizes code structure for smaller file size
       */
      minifySyntax?: boolean;

      /**
       * Whether to watch for file changes and rebuild automatically
       */
      watch?: boolean;

      /**
       * Whether to generate TypeScript declaration files (.d.ts)
       * When set to true, generates declaration files for all entry points
       * Can also be configured with DtsOptions for more control
       */
      dts?: boolean | DtsOptions;

      /**
       * Path to a preferred tsconfig.json file to use for declaration generation
       *
       * If not specified, the tsconfig.json in the project root will be used.
       * This option allows you to use a different TypeScript configuration
       * specifically for declaration file generation.
       *
       * @example
       * preferredTsconfigPath: './tsconfig.build.json'
       */
      preferredTsconfigPath?: string;

      /**
       * External packages that should not be bundled
       * Useful for dependencies that should be kept as external imports
       */
      external?: External;

      /**
       * Packages that should be bundled even if they are in external
       * Useful for dependencies that should be included in the bundle
       */
      noExternal?: External;

      /**
       * The target environment for the bundle
       * Can be 'browser', 'bun', 'node', etc.
       * Defaults to 'node' if not specified
       */
      target?: Target;

      /**
       * Whether to clean the output directory before building
       * When true, removes all files in the outDir before starting a new build
       * Defaults to true if not specified
       */
      clean?: boolean;
      /**
       * Specifies the type of sourcemap to generate
       * Can be 'none', 'linked', 'external', or 'inline'
       *
       * @see https://bun.sh/docs/bundler#sourcemap
       *
       * @default 'none'
       *
       * @example
       * sourcemap: 'linked'
       */
      sourcemap?: Sourcemap;
      /**
       * A callback function that runs after the build process completes
       * This can be used for custom post-build operations like copying files,
       * running additional tools, or logging build information
       *
       * If watch mode is enabled, this callback runs after each rebuild
       */
      onBuildEnd?: () => void | Promise<void>;
}

export const DEFAULT_OPTIONS: Partial<BunupOptions> = {
      entry: [],
      format: ['cjs'],
      outDir: 'dist',
      minify: false,
      watch: false,
      dts: false,
      target: 'node',
      external: [],
      clean: true,
      sourcemap: 'none',
};

export function createDefaultBunBuildOptions(
      options: BunupOptions,
      rootDir: string,
): Omit<BunBuildOptions, 'entrypoints'> {
      return {
            outdir: `${rootDir}/${options.outDir}`,
            minify: createMinifyOptions(options),
            target: options.target,
            splitting: options.splitting,
            sourcemap: options.sourcemap,
      };
}

function createMinifyOptions(options: BunupOptions): {
      whitespace: boolean;
      identifiers: boolean;
      syntax: boolean;
} {
      const {minify, minifyWhitespace, minifyIdentifiers, minifySyntax} =
            options;
      const defaultValue = minify === true;

      return {
            whitespace: minifyWhitespace ?? defaultValue,
            identifiers: minifyIdentifiers ?? defaultValue,
            syntax: minifySyntax ?? defaultValue,
      };
}
