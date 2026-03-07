# LaunchKit

Provider-agnostic infrastructure packages for rapid SaaS development.

## Packages

- **[@fermi-ventures/launchkit-storage](./packages/storage)** — Blob storage abstraction (Vercel Blob, R2, local filesystem)
- **[@fermi-ventures/launchkit-core](./packages/core)** — Core utilities and types
- **[@fermi-ventures/launchkit-ui](./packages/ui)** — Shared React UI components
- **[@fermi-ventures/launchkit-email](./packages/email)** — Email service abstraction
- **[@fermi-ventures/launchkit-ai](./packages/ai)** — AI/LLM utilities
- **[@fermi-ventures/launchkit-mcp](./packages/mcp)** — MCP server scaffolding
- **[@fermi-ventures/launchkit-rbac](./packages/rbac)** — Role-based access control

## Installation

LaunchKit packages are published to GitHub Packages. To install, configure npm to use the GitHub registry:

### 1. Create or update `.npmrc` in your project root:

```
@fermi-ventures:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scope: `read:packages`
4. Copy the token

### 3. Set the token in your environment

```bash
export GITHUB_TOKEN=your_token_here
```

Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.)

### 4. Install packages

```bash
npm install @fermi-ventures/launchkit-storage
```

## Development

This is a Turborepo monorepo. All packages live in `packages/`.

### Install dependencies

```bash
npm install
```

### Build all packages

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Typecheck

```bash
npm run typecheck
```

## Publishing

Packages are automatically published to GitHub Packages when changes are merged to `main`.

### Versioning

**Manual versioning** (current strategy):

1. Update the `version` field in the package's `package.json` before merging
2. Use semantic versioning: `MAJOR.MINOR.PATCH`
   - **PATCH** (0.1.1): Bug fixes, no API changes
   - **MINOR** (0.2.0): New features, backward compatible
   - **MAJOR** (1.0.0): Breaking changes
3. The CI workflow will only publish if the version doesn't already exist in the registry

### Future: Changesets

For automated version management and changelog generation, we may adopt [@changesets/cli](https://github.com/changesets/changesets) in the future.

## License

MIT
