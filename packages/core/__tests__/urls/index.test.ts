import { describe, it, expect, afterEach } from "vitest";
import { tenantUrl, tenantResourceUrl, buildOgImageUrl } from "../../src/urls/index.js";

describe("tenantUrl", () => {
  it("builds slug path", () => {
    expect(tenantUrl("my-tenant")).toBe("/my-tenant");
  });

  it("appends subpath", () => {
    expect(tenantUrl("my-tenant", "/dashboard")).toBe("/my-tenant/dashboard");
  });

  it("handles empty path", () => {
    expect(tenantUrl("my-tenant", "")).toBe("/my-tenant");
  });

  it("handles path without leading slash", () => {
    expect(tenantUrl("my-tenant", "settings")).toBe("/my-tenant/settings");
  });
});

describe("tenantResourceUrl", () => {
  it("builds resource path", () => {
    expect(tenantResourceUrl("my-tenant", "projects", "abc123")).toBe(
      "/my-tenant/projects/abc123"
    );
  });

  it("appends subpath", () => {
    expect(tenantResourceUrl("my-tenant", "projects", "abc123", "/settings")).toBe(
      "/my-tenant/projects/abc123/settings"
    );
  });

  it("handles empty subpath", () => {
    expect(tenantResourceUrl("my-tenant", "projects", "abc123", "")).toBe(
      "/my-tenant/projects/abc123"
    );
  });

  it("handles subpath without leading slash", () => {
    expect(tenantResourceUrl("my-tenant", "projects", "abc123", "edit")).toBe(
      "/my-tenant/projects/abc123/edit"
    );
  });
});

describe("buildOgImageUrl", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("builds platform domain URL with tenant prefix", () => {
    process.env.NODE_ENV = "development";
    const url = buildOgImageUrl("localhost:3000", "my-tenant", true);
    expect(url).toBe("http://localhost:3000/my-tenant/og-image");
  });

  it("builds custom domain URL without tenant prefix", () => {
    process.env.NODE_ENV = "development";
    const url = buildOgImageUrl("custom.example.com", "my-tenant", false);
    expect(url).toBe("http://custom.example.com/og-image");
  });

  it("uses https in production", () => {
    process.env.NODE_ENV = "production";
    const url = buildOgImageUrl("example.com", "my-tenant", true);
    expect(url).toBe("https://example.com/my-tenant/og-image");
  });

  it("uses http in development", () => {
    process.env.NODE_ENV = "development";
    const url = buildOgImageUrl("localhost:3000", "my-tenant", true);
    expect(url).toBe("http://localhost:3000/my-tenant/og-image");
  });

  it("handles missing NODE_ENV by defaulting to http", () => {
    delete process.env.NODE_ENV;
    const url = buildOgImageUrl("localhost:3000", "my-tenant", true);
    expect(url).toBe("http://localhost:3000/my-tenant/og-image");
  });
});
