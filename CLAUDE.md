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
