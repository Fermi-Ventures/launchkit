/**
 * @fermi-ventures/launchkit
 *
 * Shared tooling, MCP servers, and utilities for Fermi Ventures projects.
 *
 * Modules:
 *   - Storage: Provider-agnostic blob storage (Vercel Blob, R2, local)
 *     Import from '@fermi-ventures/launchkit/storage'
 *
 * MCP Servers:
 *   - Tracker: Platform-agnostic issue tracker (Linear, future Jira)
 *     Run via: npx @fermi-ventures/launchkit-tracker
 *
 * Re-exports tracker types for consumers that need them.
 */

// Storage
export {
  createStorageService,
  getBlobProvider,
  isLegacyUrl,
  legacyVercelUrlToId,
  VercelBlobProvider,
  LocalFSProvider,
  R2Provider,
} from './storage/index.js';

export type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
  StorageConfig,
  LocalFSProviderConfig,
} from './storage/index.js';

// Tracker types
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
