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

## Definition of Done

A package is NOT complete when it builds. It is complete when it's **published and consumable**.

<!-- DOD-BASELINE-START v1 -->
### 1. Code Quality
- [ ] `npm run build` passes (or `npx tsc --noEmit` for non-Next.js)
- [ ] `npm test` passes (all existing + new tests)
- [ ] No TypeScript errors, no `any` types (use specific types or `unknown`)

### 2. Tests Written
- [ ] New pure functions have unit tests
- [ ] New business logic has service/integration tests
- [ ] Tests cover the specific bug or feature, not just happy paths
- [ ] Assertions verify specific values — no `expect.anything()` for values that matter in production
- [ ] If tests were added, modified, or removed, update `docs/test-coverage.md`

### 3. Code Hygiene
- [ ] No dead code, unused imports, or orphaned types from your changes
- [ ] No TODO, FIXME, HACK, or WORKAROUND comments without a corresponding Linear ticket
- [ ] No debug artifacts (console.log, commented-out code)

### 4. Security Considered
- [ ] Authorization checks enforced (service layer ownership, IDOR prevention)
- [ ] User input validated on the server side
- [ ] No secrets or credentials in committed code

### 5. UAT Steps in PR
- [ ] PR description includes concrete manual test steps
- [ ] Steps cover happy path and at least one error/edge case
- [ ] Steps are executable by someone unfamiliar with the code

### 6. Edge Cases Considered
- [ ] What happens when not authenticated?
- [ ] What happens with nullable/missing fields?
- [ ] What happens when external services fail?
- [ ] Are failures surfaced to the user (not swallowed silently)?
<!-- DOD-BASELINE-END -->

### 7. Project-Specific Checks
<!-- PROJECT-EXTENSIONS-START -->
- [ ] Package builds successfully in Turborepo context
- [ ] All tests use Vitest (NOT Jest)
- [ ] README.md with installation and usage examples
- [ ] JSDoc comments for all public APIs
- [ ] `package.json` has correct name (`@fermi-ventures/launchkit-*`)
- [ ] `exports` field configured for subpath imports (if applicable)
- [ ] `publishConfig.registry` points to GitHub Packages
- [ ] `npm audit --production` shows zero vulnerabilities
- [ ] **Package successfully published to GitHub Packages registry**
- [ ] **Published version is consumable via `npm install @fermi-ventures/launchkit-<name>`**
- [ ] Migration ticket created for source repo (for extraction tickets)
<!-- PROJECT-EXTENSIONS-END -->

### 8. Self-Review (before completing)
Re-read every file you changed and answer these questions. If any answer is "no", fix it before completing.
- [ ] Does every variable, counter, and accumulator I introduced get used correctly?
- [ ] Does data flow end-to-end — not just to the next function, but through to the final consumer (DB, API response, UI)?
- [ ] Are all error paths handled, not just the happy path?
- [ ] Did I introduce any dead code, unused imports, or over-abstractions?
- [ ] Did I add new functions with business logic? If yes, do they have tests?

### 9. Simplification
After completing the feature, check whether your changes made existing code redundant:
- [ ] Delete dead code (unused functions, unreachable branches, orphaned types)
- [ ] Remove unused imports
- [ ] Simplify interfaces that are now over-abstracted
- [ ] If a module you changed has zero remaining imports, delete it

### 10. Deferred Work Captured
If you identified work that is out of scope for this task, it must be ticketed — never left as only a code comment.
- [ ] Create a Linear ticket in the LKT team with enough context for someone else to pick it up
- [ ] TODO comments in code are acceptable only if they reference a ticket identifier (e.g. `// TODO(LKT-42): ...`)
- [ ] Never assume someone will "notice" deferred work later — if it's not ticketed, it doesn't exist

### 11. Linear Ticket (LaunchKit-specific)
- [ ] Ticket moved to "Done" ONLY after package is published to GitHub Packages
- [ ] If blocked on publishing, ticket moved to "Blocked" with clear unblock instructions
- [ ] Comment on ticket with published version number and npm install command

## Architecture Review Guidelines

When reviewing code changes (or when an architect agent reviews your ticket), these criteria apply:

<!-- ARCHITECT-BASELINE-START v1 -->
### Approach Fit
- Does the proposed approach fit the existing architecture?
- Are the right files/modules being modified? Are any missing?
- Are there simpler alternatives?

### Cross-Cutting Concerns
- Authorization, error handling, logging, validation — are they addressed?
- Would this change affect other modules or consumers?

### Dependencies
- Are new dependencies justified, or do existing utilities cover the need?
- Are module boundaries respected?

### Patterns
- Does the code follow established patterns in this codebase?
- If introducing a new pattern, is it justified and documented?
<!-- ARCHITECT-BASELINE-END -->

### Project-Specific Architectural Concerns
<!-- ARCH-EXTENSIONS-START -->
- [ ] Package has clear, minimal public API surface
- [ ] No internal implementation details leaked through exports
- [ ] Breaking changes from source code documented in migration tickets
- [ ] Package is consumable without deep knowledge of source repos
<!-- ARCH-EXTENSIONS-END -->

## Common Publishing Issues

### GitHub Authentication Required

**IMPORTANT:** GitHub Packages requires a **classic personal access token** (starts with `ghp_`), NOT a fine-grained token (starts with `github_pat_`). Fine-grained tokens cannot access GitHub Packages due to a GitHub API limitation.

**Required Token Scopes:**
- `repo` (full control of private repositories)
- `write:packages` (upload packages to GitHub Package Registry)
- `read:packages` (download packages from GitHub Package Registry)
- `read:org` (read org and team membership)

**Token Location:**
The classic token is stored in `~/.npmrc`:
```
//npm.pkg.github.com/:_authToken=ghp_...
```

**If token scopes change:** You must regenerate the token in GitHub UI for the new scopes to take effect. The token string will change.

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
