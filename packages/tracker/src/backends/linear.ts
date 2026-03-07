/**
 * Linear backend for the Tracker MCP server.
 *
 * Wraps lib/linear.cjs — a self-contained GraphQL client
 * that only needs LINEAR_API_KEY from process.env.
 */

import { createRequire } from 'node:module';
import type {
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
  CreateDocumentInput,
  EnsureTeamWorkflowResult,
} from '../tracker.js';

// ── CJS Library Types ───────────────────────────────────────────

interface LinearLib {
  gql: (query: string, variables?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  getIssue: (teamKey: string, number: number) => Promise<Record<string, unknown> | null>;
  updateIssue: (issueId: string, input: Record<string, unknown>) => Promise<boolean>;
  createIssue: (input: Record<string, unknown>) => Promise<{ success: boolean; issue: { id: string; url: string; identifier: string } }>;
  fetchTeamIssues: (teamKey: string, opts?: { excludeDone?: boolean; priority?: number; state?: string }) => Promise<Record<string, unknown>[]>;
  getTeamByKey: (key: string) => Promise<{ id: string; key: string; name: string } | null>;
  getTeamStates: (teamKey: string) => Promise<Record<string, { id: string; name: string; type: string }>>;
  getTeamLabels: (teamKey: string) => Promise<Record<string, { id: string; name: string }>>;
  readDoc: (docId: string) => Promise<{ id: string; title: string; content: string; url: string }>;
  updateDoc: (docId: string, content: string) => Promise<boolean>;
  listDocs: () => Promise<Array<{ id: string; title: string; url: string; project: { id: string; name: string } | null }>>;
  ensureTeamWorkflow: (teamKey: string) => Promise<EnsureTeamWorkflowResult>;
}

// ── Factory ─────────────────────────────────────────────────────

export function createLinearBackend(): TrackerBackend {
  if (!process.env['LINEAR_API_KEY']) {
    process.stderr.write('ERROR: LINEAR_API_KEY environment variable is required for Linear backend\n');
    process.exit(1);
  }

  const require = createRequire(import.meta.url);
  const linear = require('../../lib/linear.cjs') as LinearLib;

  return {
    // ── Issues ────────────────────────────────────────────────

    async getIssue(teamKey: string, number: number): Promise<TrackerIssue | null> {
      const data = await linear.gql(
        `query($teamKey: String!, $number: Float!) {
          issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $number } }) {
            nodes {
              id identifier title description priority
              state { id name type }
              team { id key name }
              labels { nodes { id name } }
              assignee { id name }
              project { id name }
              url createdAt updatedAt
            }
          }
        }`,
        { teamKey, number }
      );
      const issues = data['issues'] as { nodes: Array<Record<string, unknown>> };
      const raw = issues.nodes[0];
      if (!raw) return null;
      return normalizeIssue(raw);
    },

    async getTeamIssues(teamKey: string, opts?: { includeDone?: boolean; includeDescriptions?: boolean; priority?: number; state?: string }): Promise<TrackerIssue[]> {
      const raws = await linear.fetchTeamIssues(teamKey, {
        excludeDone: !(opts?.includeDone),
        priority: opts?.priority,
        state: opts?.state,
      });
      const issues = raws.map(normalizeIssue);
      if (!opts?.includeDescriptions) {
        for (const issue of issues) {
          issue.description = null;
        }
      }
      return issues;
    },

    async getComments(issueId: string): Promise<TrackerComment[]> {
      const data = await linear.gql(
        `query($id: String!) {
          issue(id: $id) {
            comments {
              nodes { id body createdAt user { id name } }
            }
          }
        }`,
        { id: issueId }
      );
      const issue = data['issue'] as { comments: { nodes: TrackerComment[] } } | null;
      if (!issue) throw new Error(`Issue not found: ${issueId}`);
      return issue.comments.nodes;
    },

    async addComment(issueId: string, body: string): Promise<{ id: string }> {
      const data = await linear.gql(
        `mutation($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
            comment { id }
          }
        }`,
        { issueId, body }
      );
      const result = data['commentCreate'] as { success: boolean; comment: { id: string } };
      if (!result.success) throw new Error('Failed to add comment');
      return { id: result.comment.id };
    },

    async createIssue(input: CreateIssueInput): Promise<{ id: string; identifier: string; url: string }> {
      const result = await linear.createIssue({ ...input });
      if (!result.success) throw new Error('Failed to create issue');
      return result.issue;
    },

    async updateIssue(issueId: string, input: UpdateIssueInput): Promise<void> {
      const success = await linear.updateIssue(issueId, { ...input });
      if (!success) throw new Error('Failed to update issue');
    },

    async createIssueRelation(issueId: string, relatedIssueId: string, type: 'blocks' | 'related' | 'duplicate'): Promise<void> {
      const data = await linear.gql(
        `mutation($input: IssueRelationCreateInput!) {
          issueRelationCreate(input: $input) { success }
        }`,
        { input: { issueId, relatedIssueId, type } }
      );
      const result = data['issueRelationCreate'] as { success: boolean };
      if (!result.success) throw new Error('Failed to create issue relation');
    },

    // ── Metadata ──────────────────────────────────────────────

    async getTeams(): Promise<TrackerTeam[]> {
      const data = await linear.gql(`{ teams { nodes { id key name } } }`);
      const teams = data['teams'] as { nodes: TrackerTeam[] };
      return teams.nodes;
    },

    async getLabels(teamKey: string): Promise<TrackerLabel[]> {
      const labelsMap = await linear.getTeamLabels(teamKey);
      return Object.values(labelsMap);
    },

    async getWorkflowStates(teamKey: string): Promise<TrackerWorkflowState[]> {
      const statesMap = await linear.getTeamStates(teamKey);
      return Object.values(statesMap);
    },

    async getProjects(): Promise<TrackerProject[]> {
      const data = await linear.gql(`{
        projects(first: 50) {
          nodes { id name state startDate targetDate }
        }
      }`);
      const projects = data['projects'] as { nodes: TrackerProject[] };
      return projects.nodes;
    },

    // ── Administration ──────────────────────────────────────────

    async ensureTeamWorkflow(teamKey: string): Promise<EnsureTeamWorkflowResult> {
      return linear.ensureTeamWorkflow(teamKey);
    },

    // ── Documents ─────────────────────────────────────────────

    async getDocument(documentId: string): Promise<TrackerDocument | null> {
      try {
        return await linear.readDoc(documentId);
      } catch {
        return null;
      }
    },

    async listDocuments(): Promise<TrackerDocumentSummary[]> {
      return linear.listDocs();
    },

    async createDocument(input: CreateDocumentInput): Promise<{ id: string; url: string }> {
      const data = await linear.gql(
        `mutation($input: DocumentCreateInput!) {
          documentCreate(input: $input) {
            success
            document { id url }
          }
        }`,
        {
          input: {
            title: input.title,
            content: input.content,
            ...(input.projectId && { projectId: input.projectId }),
          },
        }
      );
      const result = data['documentCreate'] as { success: boolean; document: { id: string; url: string } };
      if (!result.success) throw new Error('Failed to create document');
      return { id: result.document.id, url: result.document.url };
    },

    async updateDocument(documentId: string, content: string): Promise<void> {
      const success = await linear.updateDoc(documentId, content);
      if (!success) throw new Error('Failed to update document');
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Normalize a raw Linear API issue response to TrackerIssue shape.
 * Linear returns labels as `{ nodes: [...] }` — we flatten to an array.
 */
function normalizeIssue(raw: Record<string, unknown>): TrackerIssue {
  const labels = raw['labels'] as { nodes: Array<{ id: string; name: string }> } | undefined;
  return {
    id: raw['id'] as string,
    identifier: raw['identifier'] as string,
    title: raw['title'] as string,
    description: (raw['description'] as string) ?? null,
    priority: (raw['priority'] as number) ?? 0,
    state: raw['state'] as { id: string; name: string; type: string },
    team: raw['team'] as { id: string; key: string; name: string },
    labels: labels?.nodes ?? [],
    assignee: (raw['assignee'] as { id: string; name: string }) ?? null,
    project: (raw['project'] as { id: string; name: string }) ?? null,
    url: raw['url'] as string,
    createdAt: raw['createdAt'] as string,
    updatedAt: raw['updatedAt'] as string,
  };
}
