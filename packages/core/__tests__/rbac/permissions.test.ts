import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPresetPermissions,
  roleFromPermissions,
} from "../../src/rbac/permissions.js";

// Test permissions constants (generic examples)
const TEST_PERMISSIONS = {
  VIEW_CONTENT: "view_content",
  EDIT_CONTENT: "edit_content",
  DELETE_CONTENT: "delete_content",
  MANAGE_USERS: "manage_users",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_BILLING: "manage_billing",
} as const;

const ALL_TEST_PERMISSIONS = Object.values(TEST_PERMISSIONS);

// Test permission presets
const TEST_PRESETS: Record<string, string[]> = {
  owner: [...ALL_TEST_PERMISSIONS],
  admin: [
    TEST_PERMISSIONS.VIEW_CONTENT,
    TEST_PERMISSIONS.EDIT_CONTENT,
    TEST_PERMISSIONS.DELETE_CONTENT,
    TEST_PERMISSIONS.MANAGE_USERS,
    TEST_PERMISSIONS.MANAGE_SETTINGS,
    TEST_PERMISSIONS.VIEW_ANALYTICS,
  ],
  member: [TEST_PERMISSIONS.VIEW_CONTENT],
};

describe("hasPermission", () => {
  it("returns true when permission is present", () => {
    expect(
      hasPermission([TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.EDIT_CONTENT], TEST_PERMISSIONS.VIEW_CONTENT)
    ).toBe(true);
  });

  it("returns false when permission is absent", () => {
    expect(
      hasPermission([TEST_PERMISSIONS.VIEW_CONTENT], TEST_PERMISSIONS.EDIT_CONTENT)
    ).toBe(false);
  });

  it("returns false for empty permissions array", () => {
    expect(hasPermission([], TEST_PERMISSIONS.VIEW_CONTENT)).toBe(false);
  });

  it("checks exact match, not substring", () => {
    expect(
      hasPermission([TEST_PERMISSIONS.EDIT_CONTENT], TEST_PERMISSIONS.VIEW_CONTENT)
    ).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when all required permissions are present", () => {
    expect(
      hasAllPermissions(
        [TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.EDIT_CONTENT, TEST_PERMISSIONS.DELETE_CONTENT],
        [TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.EDIT_CONTENT]
      )
    ).toBe(true);
  });

  it("returns false when any required permission is missing", () => {
    expect(
      hasAllPermissions(
        [TEST_PERMISSIONS.VIEW_CONTENT],
        [TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.EDIT_CONTENT]
      )
    ).toBe(false);
  });

  it("returns true for empty required list", () => {
    expect(hasAllPermissions([TEST_PERMISSIONS.VIEW_CONTENT], [])).toBe(true);
  });

  it("returns true for empty required list with empty permissions", () => {
    expect(hasAllPermissions([], [])).toBe(true);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when at least one required permission is present", () => {
    expect(
      hasAnyPermission(
        [TEST_PERMISSIONS.VIEW_CONTENT],
        [TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.EDIT_CONTENT]
      )
    ).toBe(true);
  });

  it("returns false when no required permissions are present", () => {
    expect(
      hasAnyPermission(
        [TEST_PERMISSIONS.VIEW_CONTENT],
        [TEST_PERMISSIONS.EDIT_CONTENT, TEST_PERMISSIONS.MANAGE_USERS]
      )
    ).toBe(false);
  });

  it("returns false for empty permissions array", () => {
    expect(
      hasAnyPermission([], [TEST_PERMISSIONS.VIEW_CONTENT])
    ).toBe(false);
  });

  it("returns false for empty required list", () => {
    expect(hasAnyPermission([TEST_PERMISSIONS.VIEW_CONTENT], [])).toBe(false);
  });
});

describe("getPresetPermissions", () => {
  it("returns all permissions for owner", () => {
    const ownerPerms = getPresetPermissions("owner", TEST_PRESETS);
    expect(ownerPerms).toHaveLength(ALL_TEST_PERMISSIONS.length);
    for (const perm of ALL_TEST_PERMISSIONS) {
      expect(ownerPerms).toContain(perm);
    }
  });

  it("returns all except manage_billing for admin", () => {
    const adminPerms = getPresetPermissions("admin", TEST_PRESETS);
    expect(adminPerms).toContain(TEST_PERMISSIONS.VIEW_CONTENT);
    expect(adminPerms).toContain(TEST_PERMISSIONS.EDIT_CONTENT);
    expect(adminPerms).toContain(TEST_PERMISSIONS.DELETE_CONTENT);
    expect(adminPerms).toContain(TEST_PERMISSIONS.MANAGE_USERS);
    expect(adminPerms).toContain(TEST_PERMISSIONS.MANAGE_SETTINGS);
    expect(adminPerms).toContain(TEST_PERMISSIONS.VIEW_ANALYTICS);
    expect(adminPerms).not.toContain(TEST_PERMISSIONS.MANAGE_BILLING);
  });

  it("returns only view_content for member", () => {
    const memberPerms = getPresetPermissions("member", TEST_PRESETS);
    expect(memberPerms).toEqual([TEST_PERMISSIONS.VIEW_CONTENT]);
  });

  it("uses default permissions for unknown role", () => {
    const perms = getPresetPermissions("unknown_role", TEST_PRESETS, [TEST_PERMISSIONS.VIEW_CONTENT]);
    expect(perms).toEqual([TEST_PERMISSIONS.VIEW_CONTENT]);
  });

  it("returns empty array for unknown role with no default", () => {
    const perms = getPresetPermissions("unknown_role", TEST_PRESETS);
    expect(perms).toEqual([]);
  });
});

describe("roleFromPermissions", () => {
  it('returns "owner" for all permissions', () => {
    expect(roleFromPermissions([...ALL_TEST_PERMISSIONS], TEST_PRESETS)).toBe("owner");
  });

  it('returns "owner" regardless of array order', () => {
    expect(roleFromPermissions([...ALL_TEST_PERMISSIONS].reverse(), TEST_PRESETS)).toBe("owner");
  });

  it('returns "admin" for admin preset permissions', () => {
    const adminPerms = getPresetPermissions("admin", TEST_PRESETS);
    expect(roleFromPermissions(adminPerms, TEST_PRESETS)).toBe("admin");
  });

  it('returns "member" for view_content only', () => {
    expect(roleFromPermissions([TEST_PERMISSIONS.VIEW_CONTENT], TEST_PRESETS)).toBe("member");
  });

  it('returns "custom" for non-preset combination', () => {
    expect(
      roleFromPermissions([TEST_PERMISSIONS.VIEW_CONTENT, TEST_PERMISSIONS.DELETE_CONTENT], TEST_PRESETS)
    ).toBe("custom");
  });

  it('returns "custom" for empty permissions', () => {
    expect(roleFromPermissions([], TEST_PRESETS)).toBe("custom");
  });

  it('returns "custom" for subset of admin permissions', () => {
    expect(
      roleFromPermissions(
        [
          TEST_PERMISSIONS.VIEW_CONTENT,
          TEST_PERMISSIONS.EDIT_CONTENT,
          TEST_PERMISSIONS.DELETE_CONTENT,
        ],
        TEST_PRESETS
      )
    ).toBe("custom");
  });
});
