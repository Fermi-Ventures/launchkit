import { describe, it, expect } from "vitest";
import { isValidRole, hasRole, isAdmin, isSuperAdmin } from "../../src/rbac/roles.js";

describe("isValidRole", () => {
  it('returns true for "user"', () => {
    expect(isValidRole("user")).toBe(true);
  });

  it('returns true for "admin"', () => {
    expect(isValidRole("admin")).toBe(true);
  });

  it('returns true for "super_admin"', () => {
    expect(isValidRole("super_admin")).toBe(true);
  });

  it("returns false for invalid string", () => {
    expect(isValidRole("manager")).toBe(false);
  });

  it("returns false for uppercase variant", () => {
    expect(isValidRole("ADMIN")).toBe(false);
  });

  it("returns false for missing underscore", () => {
    expect(isValidRole("superadmin")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidRole("")).toBe(false);
  });
});

describe("hasRole", () => {
  it("returns true when role equals minimum", () => {
    expect(hasRole("admin", "admin")).toBe(true);
  });

  it("returns true when role exceeds minimum", () => {
    expect(hasRole("super_admin", "admin")).toBe(true);
  });

  it("returns false when role is below minimum", () => {
    expect(hasRole("user", "admin")).toBe(false);
  });

  it("super_admin satisfies all minimum roles", () => {
    expect(hasRole("super_admin", "user")).toBe(true);
    expect(hasRole("super_admin", "admin")).toBe(true);
    expect(hasRole("super_admin", "super_admin")).toBe(true);
  });

  it('user only satisfies "user" minimum', () => {
    expect(hasRole("user", "user")).toBe(true);
    expect(hasRole("user", "admin")).toBe(false);
    expect(hasRole("user", "super_admin")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasRole(undefined, "user")).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasRole(null, "user")).toBe(false);
  });

  it("returns false for invalid role string", () => {
    expect(hasRole("manager", "user")).toBe(false);
  });
});

describe("isAdmin", () => {
  it("returns true for admin", () => {
    expect(isAdmin("admin")).toBe(true);
  });

  it("returns true for super_admin", () => {
    expect(isAdmin("super_admin")).toBe(true);
  });

  it("returns false for user", () => {
    expect(isAdmin("user")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isSuperAdmin", () => {
  it("returns true for super_admin", () => {
    expect(isSuperAdmin("super_admin")).toBe(true);
  });

  it("returns false for admin", () => {
    expect(isSuperAdmin("admin")).toBe(false);
  });

  it("returns false for user", () => {
    expect(isSuperAdmin("user")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});
