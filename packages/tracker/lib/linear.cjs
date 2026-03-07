/**
 * Shared Linear API client for LaunchKit.
 *
 * Self-contained GraphQL client that only needs LINEAR_API_KEY from process.env.
 * Used by the tracker MCP server's Linear backend.
 *
 * Usage:
 *   const { gql, readDoc, fetchTeamIssues } = require('./linear.cjs');
 */
require('dotenv/config');
const https = require('https');

// ── GraphQL client ──────────────────────────────────────────────

/**
 * Execute a GraphQL query against the Linear API.
 * @param {string} query - GraphQL query or mutation string
 * @param {Object} [variables={}] - GraphQL variables
 * @returns {Promise<Object>} The `data` field from the GraphQL response.
 * @throws {Error} If the response contains `errors` or cannot be parsed.
 */
function gql(query, variables = {}, _retries = 0) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.LINEAR_API_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.errors) {
            const isRateLimited = parsed.errors.some(e => e.extensions?.type === 'ratelimited');
            if (isRateLimited && _retries < 3) {
              const waitSec = 30 * (_retries + 1);
              console.error(`  [rate limited] waiting ${waitSec}s before retry ${_retries + 1}/3...`);
              setTimeout(() => gql(query, variables, _retries + 1).then(resolve, reject), waitSec * 1000);
              return;
            }
            reject(new Error(JSON.stringify(parsed.errors, null, 2)));
          }
          else resolve(parsed.data);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Document CRUD ───────────────────────────────────────────────

async function readDoc(docId) {
  const data = await gql(
    `query($id: String!) { document(id: $id) { id title content url } }`,
    { id: docId }
  );
  return data.document;
}

async function updateDoc(docId, content) {
  const data = await gql(
    `mutation($id: String!, $input: DocumentUpdateInput!) { documentUpdate(id: $id, input: $input) { success } }`,
    { id: docId, input: { content } }
  );
  return data.documentUpdate.success;
}

async function createDoc(projectId, title, content) {
  const data = await gql(
    `mutation($input: DocumentCreateInput!) { documentCreate(input: $input) { success document { id url } } }`,
    { input: { title, content, projectId } }
  );
  return data.documentCreate;
}

async function listDocs() {
  const data = await gql(`{
    documents(first: 50) {
      nodes { id title url project { id name } }
    }
  }`);
  return data.documents.nodes;
}

// ── Issue CRUD ──────────────────────────────────────────────────

async function getIssue(teamKey, number) {
  const data = await gql(
    `query($teamKey: String!, $number: Float!) {
      issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $number } }) {
        nodes { id title description state { name } team { key } url }
      }
    }`,
    { teamKey, number }
  );
  return data.issues.nodes[0] || null;
}

async function updateIssue(issueId, input) {
  const data = await gql(
    `mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }`,
    { id: issueId, input }
  );
  return data.issueUpdate.success;
}

async function createIssue(input) {
  const data = await gql(
    `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id url identifier } } }`,
    { input }
  );
  return data.issueCreate;
}

// ── Pagination ────────────────────────────────────────────────────

async function fetchAllIssues(filter, fields = 'id identifier title description state { name type } team { key } labels { nodes { id name } } url') {
  let all = [];
  let cursor = null;
  let hasMore = true;
  while (hasMore) {
    const query = cursor
      ? `query($cursor: String!) { issues(first: 50, after: $cursor, filter: { ${filter} }) { nodes { ${fields} } pageInfo { hasNextPage endCursor } } }`
      : `{ issues(first: 50, filter: { ${filter} }) { nodes { ${fields} } pageInfo { hasNextPage endCursor } } }`;
    const data = await gql(query, cursor ? { cursor } : undefined);
    all = all.concat(data.issues.nodes);
    hasMore = data.issues.pageInfo.hasNextPage;
    cursor = data.issues.pageInfo.endCursor;
  }
  return all;
}

async function fetchTeamIssues(teamKey, { excludeDone = true, priority, state } = {}) {
  if (!/^[A-Z]{2,5}$/i.test(teamKey)) throw new Error(`Invalid team key format: ${teamKey}`);

  let filter = `team: { key: { eq: "${teamKey}" } }`;

  if (state) {
    if (!/^[a-zA-Z][a-zA-Z0-9 ]{0,30}$/.test(state)) throw new Error(`Invalid state name: ${state}`);
    filter += `, state: { name: { eqIgnoreCase: "${state}" } }`;
  } else if (excludeDone) {
    filter += ', state: { type: { nin: ["completed", "canceled"] } }';
  }

  if (priority != null) {
    if (!Number.isInteger(priority) || priority < 0 || priority > 4) {
      throw new Error(`Invalid priority: ${priority}. Must be integer 0-4.`);
    }
    filter += `, priority: { eq: ${priority} }`;
  }

  return fetchAllIssues(filter);
}

// ── Team metadata lookups ─────────────────────────────────────────

async function getTeamByKey(key) {
  const data = await gql(
    `query($key: String!) {
      teams(filter: { key: { eq: $key } }) {
        nodes { id key name }
      }
    }`,
    { key }
  );
  return data.teams.nodes[0] || null;
}

async function getTeamStates(teamKey) {
  const team = await getTeamByKey(teamKey);
  if (!team) throw new Error(`Team not found: ${teamKey}`);
  const data = await gql(
    `query($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name type } }
      }
    }`,
    { teamId: team.id }
  );
  const map = {};
  data.team.states.nodes.forEach(s => { map[s.name] = s; });
  return map;
}

async function getTeamLabels(teamKey) {
  const team = await getTeamByKey(teamKey);
  if (!team) throw new Error(`Team not found: ${teamKey}`);
  const data = await gql(
    `query($teamId: String!) {
      team(id: $teamId) {
        labels { nodes { id name } }
      }
    }`,
    { teamId: team.id }
  );
  const map = {};
  data.team.labels.nodes.forEach(l => { map[l.name] = l; });
  return map;
}

// ── Team workflow compliance ──────────────────────────────────────

const REQUIRED_STATES = [
  { name: 'Backlog',     type: 'backlog',    color: '#bec2c8' },
  { name: 'Grooming',    type: 'unstarted',  color: '#e2e2e2' },
  { name: 'Todo',        type: 'unstarted',  color: '#e2e2e2' },
  { name: 'BotPickup',  type: 'unstarted',  color: '#6c5ce7' },
  { name: 'In Progress', type: 'started',    color: '#f2c94c' },
  { name: 'Blocked',     type: 'started',    color: '#eb5757' },
  { name: 'QA Review',   type: 'started',    color: '#0b6e99' },
  { name: 'In Review',   type: 'started',    color: '#26b5ce' },
  { name: 'Rework',      type: 'started',    color: '#f2994a' },
  { name: 'Done',        type: 'completed',  color: '#4cb782' },
  { name: 'Canceled',    type: 'canceled',   color: '#95a2b3' },
  { name: 'Duplicate',   type: 'canceled',   color: '#95a2b3' },
];

const REQUIRED_LABELS = [
  { name: 'bot',           color: '#5e6ad2' },
  { name: 'groomed',       color: '#26b5ce' },
  { name: 'arch-reviewed', color: '#6e56cf' },
  { name: 'needs-arch-review', color: '#e93d82' },
  { name: 'escalated',     color: '#f2c94c' },
  { name: 'engineering',   color: '#5e6ad2' },
  { name: 'product',       color: '#26b5ce' },
  { name: 'qa',            color: '#0b6e99' },
  { name: 'devops',        color: '#4cb782' },
  { name: 'infrastructure', color: '#4cb782' },
  { name: 'docs',          color: '#95a2b3' },
  { name: 'explore',       color: '#5e6ad2' },
  { name: 'initiative',    color: '#5e6ad2' },
  { name: 'Bug',           color: '#eb5757' },
  { name: 'Feature',       color: '#26b5ce' },
  { name: 'Improvement',   color: '#f2994a' },
];

async function ensureTeamWorkflow(teamKey) {
  const team = await getTeamByKey(teamKey);
  if (!team) throw new Error(`Team not found: ${teamKey}`);

  const result = {
    team: `${team.key} (${team.name})`,
    statesCreated: [],
    labelsCreated: [],
    statesExisting: [],
    labelsExisting: [],
  };

  const existingStates = await getTeamStates(teamKey);

  for (let i = 0; i < REQUIRED_STATES.length; i++) {
    const req = REQUIRED_STATES[i];
    if (existingStates[req.name]) {
      result.statesExisting.push(req.name);
      continue;
    }
    const res = await gql(`
      mutation($input: WorkflowStateCreateInput!) {
        workflowStateCreate(input: $input) {
          success
          workflowState { id name type }
        }
      }
    `, {
      input: {
        teamId: team.id,
        name: req.name,
        type: req.type,
        color: req.color,
        position: i,
      }
    });
    if (res.workflowStateCreate.success) {
      result.statesCreated.push(req.name);
    }
  }

  const existingLabels = await getTeamLabels(teamKey);

  for (const req of REQUIRED_LABELS) {
    const exists = Object.keys(existingLabels).some(
      name => name.toLowerCase() === req.name.toLowerCase()
    );
    if (exists) {
      result.labelsExisting.push(req.name);
      continue;
    }
    const res = await gql(`
      mutation($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          success
          issueLabel { id name }
        }
      }
    `, {
      input: {
        teamId: team.id,
        name: req.name,
        color: req.color,
      }
    });
    if (res.issueLabelCreate.success) {
      result.labelsCreated.push(req.name);
    }
  }

  return result;
}

// ── Utilities ─────────────────────────────────────────────────────

function run(fn) {
  fn().catch(e => { console.error(e); process.exit(1); });
}

function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = {
  gql,
  readDoc,
  updateDoc,
  createDoc,
  listDocs,
  getIssue,
  updateIssue,
  createIssue,
  fetchAllIssues,
  fetchTeamIssues,
  getTeamByKey,
  getTeamStates,
  getTeamLabels,
  REQUIRED_STATES,
  REQUIRED_LABELS,
  ensureTeamWorkflow,
  run,
  delay,
};
