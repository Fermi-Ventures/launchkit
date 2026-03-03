#!/usr/bin/env node
/**
 * Platform-agnostic Tracker MCP server for Claude Code and Agent SDK.
 *
 * Exposes issue tracker and document operations as MCP tools via stdio.
 * The backend is selected by the TRACKER_BACKEND env var:
 *   - "linear" (default): uses lib/linear.cjs
 *   - "jira": (future) wraps Jira + Confluence APIs
 *
 * Usage (standalone):
 *   npx @fermi-ventures/launchkit-tracker
 *
 * Usage (.mcp.json):
 *   "tracker": { "type": "stdio", "command": "npx", "args": ["@fermi-ventures/launchkit-tracker"] }
 */

import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createLinearBackend } from './backends/linear.js';

// ── Backend interface ───────────────────────────────────────────
//
// Each backend implements this interface. It covers the MCP tools
// exposed to Claude Code — intentionally lighter than PmAdapter
// (no orchestrator-specific methods like assignTicket or categorizeComment).

export interface TrackerIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number;
  state: { id: string; name: string; type: string };
  team: { id: string; key: string; name: string };
  labels: Array<{ id: string; name: string }>;
  assignee: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerComment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface TrackerTeam {
  id: string;
  key: string;
  name: string;
}

export interface TrackerLabel {
  id: string;
  name: string;
}

export interface TrackerWorkflowState {
  id: string;
  name: string;
  type: string;
}

export interface TrackerProject {
  id: string;
  name: string;
  state?: string;
  startDate?: string;
  targetDate?: string;
}

export interface TrackerDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  project?: { id: string; name: string } | null;
}

export interface TrackerDocumentSummary {
  id: string;
  title: string;
  url: string;
  project: { id: string; name: string } | null;
}

export interface CreateIssueInput {
  teamId: string;
  title: string;
  description?: string;
  priority?: number;
  labelIds?: string[];
  stateId?: string;
  projectId?: string;
  assigneeId?: string;
  parentId?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  stateId?: string;
  priority?: number;
  labelIds?: string[];
  assigneeId?: string;
  projectId?: string;
}

export interface EnsureTeamWorkflowResult {
  team: string;
  statesCreated: string[];
  labelsCreated: string[];
  statesExisting: string[];
  labelsExisting: string[];
}

export interface TrackerBackend {
  // Issues
  getIssue(teamKey: string, number: number): Promise<TrackerIssue | null>;
  getTeamIssues(teamKey: string, opts?: { includeDone?: boolean; includeDescriptions?: boolean; priority?: number; state?: string }): Promise<TrackerIssue[]>;
  getComments(issueId: string): Promise<TrackerComment[]>;
  addComment(issueId: string, body: string): Promise<{ id: string }>;
  createIssue(input: CreateIssueInput): Promise<{ id: string; identifier: string; url: string }>;
  updateIssue(issueId: string, input: UpdateIssueInput): Promise<void>;
  createIssueRelation(issueId: string, relatedIssueId: string, type: 'blocks' | 'related' | 'duplicate'): Promise<void>;

  // Metadata
  getTeams(): Promise<TrackerTeam[]>;
  getLabels(teamKey: string): Promise<TrackerLabel[]>;
  getWorkflowStates(teamKey: string): Promise<TrackerWorkflowState[]>;
  getProjects(): Promise<TrackerProject[]>;

  // Administration
  ensureTeamWorkflow(teamKey: string): Promise<EnsureTeamWorkflowResult>;

  // Documents
  getDocument(documentId: string): Promise<TrackerDocument | null>;
  listDocuments(): Promise<TrackerDocumentSummary[]>;
  updateDocument(documentId: string, content: string): Promise<void>;
}

// ── Helpers ─────────────────────────────────────────────────────

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function err(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true as const };
}

function errFromCatch(prefix: string, e: unknown): ReturnType<typeof err> {
  const message = e instanceof Error ? e.message : String(e);
  return err(`${prefix}: ${message}`);
}

// ── Backend selection ───────────────────────────────────────────

const backendName = process.env['TRACKER_BACKEND'] ?? 'linear';

let backend: TrackerBackend;
switch (backendName) {
  case 'linear':
    backend = createLinearBackend();
    break;
  default:
    process.stderr.write(`ERROR: Unknown TRACKER_BACKEND: ${backendName}. Supported: linear\n`);
    process.exit(1);
}

// ── Server ──────────────────────────────────────────────────────

const server = new McpServer({
  name: 'tracker',
  version: '1.0.0',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Read Tools
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'tracker_get_issue',
  'Fetch an issue by team key and number (e.g., "CAD", 42). Returns full details including labels, priority, assignee, and URL.',
  {
    team_key: z.string().describe('Team key, e.g. "CAD", "END", "VST"'),
    number: z.number().describe('Issue number within the team'),
  },
  async ({ team_key, number }) => {
    try {
      const issue = await backend.getIssue(team_key, number);
      if (!issue) return err(`Issue ${team_key}-${number} not found`);
      return ok(issue);
    } catch (e) {
      return errFromCatch('tracker_get_issue', e);
    }
  }
);

server.tool(
  'tracker_get_team_issues',
  'List all open issues for a team. Returns id, identifier, title, state, labels, and URL. Descriptions are omitted by default to keep responses compact — use include_descriptions for roadmap/strategy analysis.',
  {
    team_key: z.string().describe('Team key, e.g. "CAD", "END"'),
    include_done: z.boolean().optional().describe('Include completed/canceled issues (default: false)'),
    include_descriptions: z.boolean().optional().describe('Include full issue descriptions (default: false). Use for roadmap/strategy analysis.'),
    priority: z.number().int().min(0).max(4).optional().describe('Filter by priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low'),
    state: z.string().optional().describe('Filter by state name (e.g., "Todo", "Backlog", "In Progress")'),
  },
  async ({ team_key, include_done, include_descriptions, priority, state }) => {
    try {
      const issues = await backend.getTeamIssues(team_key, {
        includeDone: include_done ?? false,
        includeDescriptions: include_descriptions ?? false,
        priority,
        state,
      });
      return ok({ count: issues.length, issues });
    } catch (e) {
      return errFromCatch('tracker_get_team_issues', e);
    }
  }
);

server.tool(
  'tracker_get_comments',
  'Fetch all comments on an issue. Requires the issue UUID (use tracker_get_issue to find it).',
  {
    issue_id: z.string().describe('The issue UUID'),
  },
  async ({ issue_id }) => {
    try {
      const comments = await backend.getComments(issue_id);
      return ok(comments);
    } catch (e) {
      return errFromCatch('tracker_get_comments', e);
    }
  }
);

server.tool(
  'tracker_get_teams',
  'List all teams in the workspace. Returns id, key, and name.',
  {},
  async () => {
    try {
      const teams = await backend.getTeams();
      return ok(teams);
    } catch (e) {
      return errFromCatch('tracker_get_teams', e);
    }
  }
);

server.tool(
  'tracker_get_workflow_states',
  'Get all workflow states for a team (e.g., Backlog, Todo, In Progress, Done). Returns state IDs needed for updates.',
  {
    team_key: z.string().describe('Team key, e.g. "CAD"'),
  },
  async ({ team_key }) => {
    try {
      const states = await backend.getWorkflowStates(team_key);
      return ok(states);
    } catch (e) {
      return errFromCatch('tracker_get_workflow_states', e);
    }
  }
);

server.tool(
  'tracker_get_labels',
  'Get all labels for a team. Returns label IDs needed for issue creation/updates.',
  {
    team_key: z.string().describe('Team key, e.g. "CAD"'),
  },
  async ({ team_key }) => {
    try {
      const labels = await backend.getLabels(team_key);
      return ok(labels);
    } catch (e) {
      return errFromCatch('tracker_get_labels', e);
    }
  }
);

server.tool(
  'tracker_get_projects',
  'List all projects in the workspace. Returns id, name, and dates.',
  {},
  async () => {
    try {
      const projects = await backend.getProjects();
      return ok(projects);
    } catch (e) {
      return errFromCatch('tracker_get_projects', e);
    }
  }
);

server.tool(
  'tracker_get_document',
  'Read a document by ID. Returns title, full markdown content, and URL.',
  {
    document_id: z.string().describe('Document UUID'),
  },
  async ({ document_id }) => {
    try {
      const doc = await backend.getDocument(document_id);
      if (!doc) return err(`Document not found: ${document_id}`);
      return ok(doc);
    } catch (e) {
      return errFromCatch('tracker_get_document', e);
    }
  }
);

server.tool(
  'tracker_list_documents',
  'List all documents in the workspace. Returns id, title, URL, and project. Use tracker_get_document for content.',
  {},
  async () => {
    try {
      const docs = await backend.listDocuments();
      return ok({ count: docs.length, documents: docs });
    } catch (e) {
      return errFromCatch('tracker_list_documents', e);
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Write Tools
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'tracker_add_comment',
  'Add a comment to an issue. Requires the issue UUID.',
  {
    issue_id: z.string().describe('The issue UUID'),
    body: z.string().describe('Comment body (markdown supported)'),
  },
  async ({ issue_id, body }) => {
    try {
      const result = await backend.addComment(issue_id, body);
      return ok({ ok: true, comment_id: result.id });
    } catch (e) {
      return errFromCatch('tracker_add_comment', e);
    }
  }
);

server.tool(
  'tracker_create_issue',
  'Create a new issue. Look up team_id (via tracker_get_teams), label_ids (via tracker_get_labels), and state_id (via tracker_get_workflow_states) first.',
  {
    title: z.string().describe('Issue title'),
    team_id: z.string().describe('Team UUID (use tracker_get_teams to find)'),
    description: z.string().optional().describe('Description in markdown'),
    priority: z.number().optional().describe('Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low'),
    label_ids: z.array(z.string()).optional().describe('Label UUIDs (use tracker_get_labels to find)'),
    state_id: z.string().optional().describe('Initial state UUID (use tracker_get_workflow_states to find)'),
    project_id: z.string().optional().describe('Project UUID (use tracker_get_projects to find)'),
    assignee_id: z.string().optional().describe('Assignee user UUID'),
    parent_id: z.string().optional().describe('Parent issue UUID — creates this as a sub-issue'),
  },
  async (args) => {
    try {
      const input: CreateIssueInput = {
        teamId: args.team_id,
        title: args.title,
      };
      if (args.description !== undefined) input.description = args.description;
      if (args.priority !== undefined) input.priority = args.priority;
      if (args.label_ids !== undefined) input.labelIds = args.label_ids;
      if (args.state_id !== undefined) input.stateId = args.state_id;
      if (args.project_id !== undefined) input.projectId = args.project_id;
      if (args.assignee_id !== undefined) input.assigneeId = args.assignee_id;
      if (args.parent_id !== undefined) input.parentId = args.parent_id;

      const result = await backend.createIssue(input);
      return ok({ ok: true, ...result });
    } catch (e) {
      return errFromCatch('tracker_create_issue', e);
    }
  }
);

server.tool(
  'tracker_update_issue',
  'Update an issue. Use for changing state, labels, description, priority, etc. WARNING: label_ids REPLACES all labels — include existing label IDs to preserve them.',
  {
    issue_id: z.string().describe('The issue UUID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description (replaces entire body, markdown)'),
    state_id: z.string().optional().describe('New state UUID (use tracker_get_workflow_states to find)'),
    priority: z.number().optional().describe('Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low'),
    label_ids: z.array(z.string()).optional().describe('Label UUIDs — REPLACES all labels. Include existing IDs to keep them.'),
    assignee_id: z.string().optional().describe('Assignee user UUID'),
    project_id: z.string().optional().describe('Project UUID'),
  },
  async (args) => {
    try {
      const input: UpdateIssueInput = {};
      if (args.title !== undefined) input.title = args.title;
      if (args.description !== undefined) input.description = args.description;
      if (args.state_id !== undefined) input.stateId = args.state_id;
      if (args.priority !== undefined) input.priority = args.priority;
      if (args.label_ids !== undefined) input.labelIds = args.label_ids;
      if (args.assignee_id !== undefined) input.assigneeId = args.assignee_id;
      if (args.project_id !== undefined) input.projectId = args.project_id;

      await backend.updateIssue(args.issue_id, input);
      return ok({ ok: true });
    } catch (e) {
      return errFromCatch('tracker_update_issue', e);
    }
  }
);

server.tool(
  'tracker_create_issue_relation',
  'Create a relation between two issues. Use "blocks" to indicate issue_id blocks related_issue_id (must complete first).',
  {
    issue_id: z.string().describe('The source issue UUID'),
    related_issue_id: z.string().describe('The target issue UUID'),
    type: z.enum(['blocks', 'related', 'duplicate']).describe('Relation type: "blocks" = source blocks target, "related" = general, "duplicate" = duplicate'),
  },
  async ({ issue_id, related_issue_id, type }) => {
    try {
      await backend.createIssueRelation(issue_id, related_issue_id, type);
      return ok({ ok: true });
    } catch (e) {
      return errFromCatch('tracker_create_issue_relation', e);
    }
  }
);

server.tool(
  'tracker_update_document',
  'Update a document. Read first with tracker_get_document, modify, then write back.',
  {
    document_id: z.string().describe('Document UUID'),
    content: z.string().describe('New markdown content (replaces entire document)'),
  },
  async ({ document_id, content }) => {
    try {
      await backend.updateDocument(document_id, content);
      return ok({ ok: true });
    } catch (e) {
      return errFromCatch('tracker_update_document', e);
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Administration Tools
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'tracker_ensure_team_workflow',
  'Ensure a team has all required workflow states and labels for bot-managed workflows. Idempotent — safe to run multiple times. Creates missing states/labels, never modifies existing ones.',
  {
    team_key: z.string().describe('Team key, e.g. "CAD", "END"'),
  },
  async ({ team_key }) => {
    try {
      const result = await backend.ensureTeamWorkflow(team_key);
      return ok(result);
    } catch (e) {
      return errFromCatch('tracker_ensure_team_workflow', e);
    }
  }
);

// ── Start server ────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write(`Tracker MCP server running (backend: ${backendName})\n`);
