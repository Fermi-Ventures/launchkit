/**
 * Core types for LaunchKit applications (no external dependencies).
 */

// ── Server action return type ───────────────────────────────

/**
 * Standard return type for server actions.
 * Success cases can include warnings for partial failures.
 * Error cases can include diagnostic details.
 *
 * @example
 * ```ts
 * async function createUser(data: UserData): Promise<ActionResult<User>> {
 *   try {
 *     const user = await db.user.create({ data });
 *     return { success: true, data: user };
 *   } catch (error) {
 *     return { success: false, error: 'Failed to create user' };
 *   }
 * }
 * ```
 */
export type ActionResult<T = void> =
  | { success: true; data?: T; warnings?: string[] }
  | { success: false; error: string; details?: string };

// ── Custom error classes ────────────────────────────────────

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// ── AI usage tracking types ─────────────────────────────────

/** Token usage from a single Anthropic API call */
export interface ApiCallUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  durationMs: number;
}

/** Wraps a service method result with its API usage data */
export interface WithUsage<T> {
  result: T;
  usage: ApiCallUsage;
}
