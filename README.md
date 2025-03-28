# bunup

[![npm version](https://img.shields.io/npm/v/bunup.svg?style=flat-square)](https://www.npmjs.com/package/bunup)
[![npm downloads](https://img.shields.io/npm/dm/bunup.svg?style=flat-square)](https://www.npmjs.com/package/bunup)

An extremely fast, zero-config bundler for TypeScript & JavaScript, powered by [Bun](https://bun.sh) and [Oxc](https://oxc.rs/).

| Bundler        | Format   | Build Time | Relative Speed       |
| -------------- | -------- | ---------- | -------------------- |
| bunup          | esm, cjs | **6ms**    | **⚡️ 9.7x faster**  |
| bunup (+ dts)  | esm, cjs | **32ms**   | **⚡️ 25.8x faster** |
| tsdown         | esm, cjs | 22ms       | 2.6x faster          |
| tsdown (+ dts) | esm, cjs | 52ms       | 15.9x faster         |
| tsup           | esm, cjs | 58ms       | baseline             |
| tsup (+ dts)   | esm, cjs | 825ms      | baseline             |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## 🚀 Quick Start

### Installation

```bash
# Using Bun
bun add bunup -d

# Using pnpm
pnpm add bunup -D

# Using npm
npm i bunup -D

# Using Yarn
yarn add bunup --dev
```

### Basic Usage

Create a simple TypeScript file:

```typescript
// src/index.ts
export function greet(name: string): string {
      return `Hello, ${name}!`;
}
```

Bundle it with bunup:

```bash
bunup src/index.ts
```

This will create a bundled output in the `dist` directory.

### Using with package.json

Add a build script to your `package.json`:

```json
{
      "name": "my-package",
      "scripts": {
            "build": "bunup src/index.ts --format esm,cjs --dts"
      }
}
```

Then run:

```bash
npm run build
```

### ⚙️ Configuration File

Create a `bunup.config.ts` file for more control:

```typescript
import {defineConfig} from 'bunup';

export default defineConfig({
      entry: ['src/index.ts'],
      outDir: 'dist',
      format: ['esm', 'cjs'],
      dts: true,
      minify: true,
});
```

## 📚 Documentation

For complete documentation, visit [the full documentation](https://bunup.arshadyaseen.com/).

## ❤️ Contributing

For guidelines on contributing, please read the [contributing guide](https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md).

We welcome contributions from the community to enhance Bunup's capabilities and make it even more powerful.
