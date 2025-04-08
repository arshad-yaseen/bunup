# Typescript Library Starter

Quickly scaffold modern TypeScript library in 5 seconds. Powered by [Bunup](https://bunup.arshadyaseen.com/) - the fastest TypeScript bundler available ⚡️.

<video src="/ts-lib-starter-demo.mov" alt="Bunup typescript library starter demo video" controls style="border-radius: 8px; border: 1px solid rgba(128, 128, 128, 0.2); box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);"></video>

## Features

- 🚀 **Zero Config**: Get started in seconds with sensible defaults
- 📦 **Modern Setup**: ESM and CJS output formats, TypeScript declarations
- 🧩 **Monorepo Support**: Create workspace-based projects with ease
- 🔧 **Complete Tooling**: Testing, linting, formatting, and CI workflows included
- 🚦 **Git Hooks**: Enforced code quality with Husky pre-commit hooks
- 📝 **Conventional Commits**: Standardized commit messages with commitlint
- 🚢 **Release Automation**: GitHub Actions for testing and publishing

## Getting Started

### Installation

You can create a new project without installing the package by using:

::: code-group

```sh [bun]
bunx create-bunup@latest
```

```sh [npm]
npx create-bunup@latest
```

```sh [pnpm]
pnpx create-bunup@latest
```

:::

Once you run the command, you'll be guided through an interactive process:

```plaintext
$ bunx create-bunup@latest

ℹ TypeScript Library Starter

? Where would you like to create your project? › my-ts-lib

? Select a package manager:
❯ bun - Fast all-in-one JavaScript runtime
  pnpm - Fast, disk space efficient package manager

? Set up as a monorepo? › (y/N)

# If you chose "yes" to monorepo:

? Name for first package: › my-package
```

### Step-by-Step Setup Guide

1. **Change into the created project directory**:
   ```sh
   cd my-ts-lib
   ```

2. **Install dependencies**:
   ```sh
   bun install
   # or
   pnpm install
   ```

3. **Enable Git hooks**:
   ```sh
   bun run prepare
   # or
   pnpm prepare
   ```

4. **Initialize Git repository**:
   ```sh
   git init
   git add .
   git commit -m "chore: initial commit"
   ```

5. **Create a GitHub repository**:
   - Go to [GitHub](https://github.com/new)
   - Create a new repository with the same name as your project
   - Don't initialize it with a README, .gitignore, or license

6. **Link your local repository to GitHub**:
   ```sh
   git remote add origin https://github.com/YOUR-USERNAME/my-ts-lib.git
   git push -u origin main
   ```

7. **Setup for Releases**:
   - Generate an npm token:
     1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
     2. Navigate to your profile → Access Tokens → Generate New Token (Classic)
     3. Give it a descriptive name (e.g., "Bunup Publishing")
     4. Select "Automation" as the token type
     5. Click "Generate Token" and copy it immediately
   
   - Add npm token to GitHub repository:
     1. Go to your GitHub repository
     2. Navigate to Settings → Secrets and variables → Actions
     3. Click "New repository secret"
     4. Name: `NPM_TOKEN`
     5. Value: Paste your npm token
     6. Click "Add secret"

8. **Update the GitHub username**:
   - Replace 'YOUR-USERNAME' with your actual GitHub username in `CONTRIBUTING.md`

## Development Workflow

After completing the setup, here's how to use your project:

### Common Commands

::: code-group

```sh [Dev]
bun run dev
# or
pnpm dev
```

```sh [Test]
bun run test
# or
pnpm test
```

```sh [Lint]
bun run lint
# or
pnpm lint
```

```sh [Format]
bun run format:fix
# or
pnpm format:fix
```

```sh [Type Check]
bun run tsc
# or
pnpm tsc
```

```sh [Build]
bun run build
# or
pnpm build
```

:::

### Committing Code

The project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```sh
# Example commit messages:
git commit -m "feat: add user authentication"
git commit -m "fix: resolve issue with data loading"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

Pre-commit hooks will run automatically to check your code quality before each commit.

## 🚀 Releasing Your Package

When you're ready to release your package, simply run:

```sh
bun run release
# or
pnpm release
```

This will:
1. Prompt you for a new version (patch, minor, or major)
2. Update package.json version
3. Create a Git tag
4. Push changes and tag to GitHub

The GitHub Actions workflow will automatically:
1. Build the package
2. Generate a GitHub release with changelog
3. Publish to npm with provenance

Happy coding!
