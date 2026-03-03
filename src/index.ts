/**
 * @fermi-ventures/launchkit
 *
 * Shared tooling, MCP servers, and utilities for Fermi Ventures projects.
 *
 * MCP Servers:
 *   - Tracker: Platform-agnostic issue tracker (Linear, future Jira)
 *     Run via: npx @fermi-ventures/launchkit-tracker
 *
 * Re-exports tracker types for consumers that need them.
 */

export type {
  TrackerBackend,
  TrackerIssue,
  TrackerComment,
  TrackerTeam,
  TrackerLabel,
  TrackerWorkflowState,
  TrackerProject,
  TrackerDocument,
  TrackerDocumentSummary,
  CreateIssueInput,
  UpdateIssueInput,
  EnsureTeamWorkflowResult,
} from './mcp-servers/tracker.js';
