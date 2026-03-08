/**
 * System-level user roles with hierarchical permissions.
 *
 * Extracted from launch-lab. Provides simple role-based access control
 * with three tiers: user, admin, super_admin.
 *
 * @example
 * ```ts
 * if (hasRole(session.user.role, 'admin')) {
 *   // User is admin or super_admin
 * }
 *
 * if (isSuperAdmin(session.user.role)) {
 *   // User is super_admin only
 * }
 * ```
 */

export type UserRole = "super_admin" | "admin" | "user";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

export const VALID_ROLES: UserRole[] = ["super_admin", "admin", "user"];

export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Check if userRole meets the minimum required role.
 * hasRole("admin", "admin") => true
 * hasRole("user", "admin") => false
 * hasRole("super_admin", "admin") => true
 */
export function hasRole(
  userRole: string | undefined | null,
  minimumRole: UserRole
): boolean {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

export function isAdmin(role: string | undefined | null): boolean {
  return hasRole(role, "admin");
}

export function isSuperAdmin(role: string | undefined | null): boolean {
  return hasRole(role, "super_admin");
}
