/**
 * Fine-grained permission system for multi-tenant applications.
 *
 * Extracted from launch-lab's studio permissions. Provides granular
 * permission checking independent of role labels.
 *
 * Pattern: Roles (owner/admin/member) are display labels; permissions
 * are what's actually checked in authorization logic.
 *
 * @example
 * ```ts
 * // Define your app's permissions
 * const PERMISSIONS = {
 *   VIEW_CONTENT: 'view_content',
 *   EDIT_CONTENT: 'edit_content',
 *   MANAGE_MEMBERS: 'manage_members',
 * } as const;
 *
 * // Check permissions
 * if (hasPermission(userPermissions, PERMISSIONS.EDIT_CONTENT)) {
 *   // User can edit
 * }
 *
 * // Map roles to permissions
 * const adminPerms = getPresetPermissions('admin', ROLE_PRESETS);
 * ```
 */

/**
 * Check if a permissions array includes a specific permission.
 */
export function hasPermission(
  permissions: string[],
  permission: string
): boolean {
  return permissions.includes(permission);
}

/**
 * Check if a permissions array includes ALL of the given permissions.
 */
export function hasAllPermissions(
  permissions: string[],
  required: string[]
): boolean {
  return required.every((p) => permissions.includes(p));
}

/**
 * Check if a permissions array includes ANY of the given permissions.
 */
export function hasAnyPermission(
  permissions: string[],
  required: string[]
): boolean {
  return required.some((p) => permissions.includes(p));
}

/**
 * Get the default permissions for a role preset.
 *
 * @param role - The role name (e.g., 'owner', 'admin', 'member')
 * @param presets - Record mapping role names to permission arrays
 * @param defaultPermissions - Fallback permissions if role not found
 */
export function getPresetPermissions<T extends string>(
  role: string,
  presets: Record<string, T[]>,
  defaultPermissions: T[] = []
): T[] {
  return presets[role] ?? defaultPermissions;
}

/**
 * Determine the display role based on current permissions.
 * If permissions match a preset exactly, return that role name.
 * Otherwise return "custom".
 *
 * @param permissions - Current user permissions
 * @param presets - Record mapping role names to permission arrays
 */
export function roleFromPermissions(
  permissions: string[],
  presets: Record<string, string[]>
): string {
  const sorted = [...permissions].sort();
  for (const [role, preset] of Object.entries(presets)) {
    const presetSorted = [...preset].sort();
    if (
      sorted.length === presetSorted.length &&
      sorted.every((p, i) => p === presetSorted[i])
    ) {
      return role;
    }
  }
  return "custom";
}
