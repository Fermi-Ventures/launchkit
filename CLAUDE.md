# Claude Code Instructions for LaunchKit

## Project Overview

LaunchKit is the AI-first SaaS starter kit — `@launchkit/*` npm packages that give Fermi Ventures projects every component a SaaS needs. Built on Next.js and TypeScript.

**GitHub org**: fermi-ventures
**Package scope**: @launchkit/*
**Monorepo**: Turborepo with npm workspaces

## Monorepo Structure

```
launchkit/
├── turbo.json                    # Turborepo configuration
├── tsconfig.base.json            # Shared TypeScript config
├── package.json                  # Workspace root
└── packages/
    ├── tracker/                  # @launchkit/tracker - MCP server for Linear
    ├── storage/                  # @launchkit/storage - Blob storage abstraction
    ├── core/                     # @launchkit/core - Auth, session, types (stub)
    ├── rbac/                     # @launchkit/rbac - Permissions (stub)
    ├── ui/                       # @launchkit/ui - Portal shell, components (stub)
    ├── email/                    # @launchkit/email - Transactional email (stub)
    ├── mcp/                      # @launchkit/mcp - MCP framework (stub)
    └── ai/                       # @launchkit/ai - Chat UI, AI utils (stub)
```

## Development

```bash
npm install                # Install all workspace dependencies
npm run build              # Build all packages (turbo)
npm run test               # Run all tests (turbo)
npm run typecheck          # Type check all packages
npm run dev                # Watch mode for all packages
```

### Working on a single package

```bash
cd packages/storage
npm run build              # Build just this package
npm run test               # Test just this package
```

## Published Packages

| Package | Status | Description |
|---------|--------|-------------|
| @launchkit/tracker | ✅ Ready | MCP server for issue tracking (Linear backend) |
| @launchkit/storage | ✅ Ready | Provider-agnostic blob storage |
| @launchkit/core | Stub | Auth, session, JWT, shared types |
| @launchkit/rbac | Stub | Permission checks, JWT-embedded roles |
| @launchkit/ui | Stub | Portal shell, navigation, components |
| @launchkit/email | Stub | Transactional email via Resend |
| @launchkit/mcp | Stub | MCP server framework |
| @launchkit/ai | Stub | Chat UI, AI integration utilities |

## Strategy

When building new packages:

1. **Check existing implementations first** — scan launch-lab, endorsed, agent-orchestrator for working code
2. **Extract and generalize** — don't reinvent; extract proven patterns
3. **Adopt uniformity** — launchkit becomes the canonical implementation

See the [LaunchKit Roadmap](https://linear.app/vested-studio/document/launchkit-roadmap-781a2478894b) for full strategy and extraction map.

## Tech Stack

- **Language**: TypeScript (ES2022, NodeNext modules)
- **Build**: Turborepo
- **Testing**: Vitest
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: Zod
- **Runtime**: Node.js >= 20

## Package Guidelines

Each package should have:

- `package.json` with `@launchkit/<name>` scope
- `tsconfig.json` extending `../../tsconfig.base.json`
- `src/index.ts` as entry point
- Tests in `src/__tests__/` using Vitest
- Clear JSDoc for public APIs

## MCP Configuration

Consuming projects configure the tracker MCP server:

```json
{
  "tracker": {
    "type": "stdio",
    "command": "npx",
    "args": ["@launchkit/tracker"],
    "env": {
      "LINEAR_API_KEY": "lin_api_..."
    }
  }
}
```

## Definition of Done for LaunchKit Packages

A package is NOT complete when it builds. It is complete when it's **published and consumable**.

### 1. Code Quality
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run test` passes (all tests)
- [ ] No `any` types (use specific types or `unknown`)
- [ ] Package builds successfully in Turborepo context

### 2. Tests Written
- [ ] Core functions have unit tests
- [ ] Integration tests for complex interactions
- [ ] Tests cover edge cases (null/undefined, empty inputs, errors)
- [ ] Assertions verify specific values — no `expect.anything()` for critical values
- [ ] All tests use Vitest (NOT Jest)

### 3. Documentation
- [ ] README.md with installation and usage examples
- [ ] JSDoc comments for all public APIs
- [ ] Module header comments explaining purpose and patterns
- [ ] Examples show real-world usage patterns

### 4. Package Configuration
- [ ] `package.json` has correct name (`@fermi-ventures/launchkit-*`)
- [ ] Version number is correct (semantic versioning)
- [ ] `exports` field configured for subpath imports (if applicable)
- [ ] Dependencies vs devDependencies correctly categorized
- [ ] `publishConfig.registry` points to GitHub Packages
- [ ] No private/internal dependencies exposed

### 5. Security & Dependencies
- [ ] No hardcoded secrets or credentials
- [ ] `npm audit --production` shows zero vulnerabilities
- [ ] Peer dependencies are documented
- [ ] External service integrations have proper error handling

### 6. **Publishing (CRITICAL)**
- [ ] Package successfully published to GitHub Packages registry
- [ ] Published version is consumable via `npm install @fermi-ventures/launchkit-<name>`
- [ ] Package appears in GitHub Packages UI
- [ ] **A package is NOT done until it's published and installable**

### 7. Migration Path (for extraction tickets)
- [ ] Source code identified and extracted
- [ ] Migration ticket created for source repo (e.g., END-XXX, VST-XXX)
- [ ] Migration ticket documents what needs to change in consuming code

### 8. Self-Review
- [ ] Does every exported function have tests?
- [ ] Are there any breaking changes from extracted source?
- [ ] Did I verify the package builds in isolation?
- [ ] Did I test importing from the published package?

### 9. Cleanup
- [ ] No debug artifacts (console.log, commented code)
- [ ] No TODO comments without Linear ticket references
- [ ] Unused imports removed
- [ ] Build artifacts (`dist/`) not committed to git

### 10. Linear Ticket
- [ ] Ticket moved to "Done" ONLY after package is published
- [ ] If blocked on publishing, ticket moved to "Blocked" with clear unblock instructions
- [ ] Comment on ticket with published version number and npm install command

## Common Publishing Issues

### GitHub Authentication Required

If `npm publish` fails with `ENEEDAUTH`:

```bash
npm login --scope=@fermi-ventures --registry=https://npm.pkg.github.com
# Enter GitHub Personal Access Token with write:packages permission
npm publish
```

### Package Not Found After Publishing

Check:
1. Package name matches `@fermi-ventures/launchkit-*` scope
2. `.npmrc` in consuming project has registry configuration:
   ```
   @fermi-ventures:registry=https://npm.pkg.github.com
   ```
3. Consuming project has GitHub PAT with `read:packages` permission
