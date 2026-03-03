# Claude Code Instructions for LaunchKit

## Project Overview

LaunchKit is the shared tooling, MCP servers, and utilities package for Fermi Ventures projects. It provides reusable infrastructure that all ventures (Endorsed, Cadence, Vested Studio, etc.) can consume.

## Package Structure

```
launchkit/
├── src/
│   ├── index.ts                    # Package entry point (type exports)
│   └── mcp-servers/
│       ├── tracker.ts              # Platform-agnostic tracker MCP server
│       └── backends/
│           └── linear.ts           # Linear backend implementation
├── lib/
│   └── linear.cjs                  # Self-contained Linear GraphQL client
├── package.json
└── tsconfig.json
```

## MCP Servers

### Tracker (`launchkit-tracker`)

Platform-agnostic issue tracker MCP server. Supports Linear out of the box, with a `TrackerBackend` interface for future backends (Jira, GitHub Issues, etc.).

**Configuration in consuming projects (.mcp.json):**
```json
{
  "tracker": {
    "type": "stdio",
    "command": "node",
    "args": ["node_modules/@fermi-ventures/launchkit/dist/mcp-servers/tracker.js"],
    "env": {
      "LINEAR_API_KEY": "lin_api_..."
    }
  }
}
```

**Environment variables:**
- `LINEAR_API_KEY` — Required for Linear backend
- `TRACKER_BACKEND` — Backend selection (default: "linear")

## Tech Stack

- **Language**: TypeScript (ES2022, NodeNext modules)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: Zod
- **Runtime**: Node.js >= 20

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm run dev      # Watch mode
npm run lint     # Type check only
```

## Adding a New Backend

1. Create `src/mcp-servers/backends/<name>.ts`
2. Implement `TrackerBackend` interface from `tracker.ts`
3. Export a factory function: `createXxxBackend(): TrackerBackend`
4. Add the backend to the switch statement in `tracker.ts`

## Patterns

- **CJS libraries in `lib/`**: Self-contained clients with zero TypeScript dependencies. Used via `createRequire()` from ESM backends.
- **Factory functions**: Each backend exports a `create*Backend()` function, not a class.
- **TrackerBackend interface**: Single source of truth for all backend methods. Defined in `tracker.ts`.
