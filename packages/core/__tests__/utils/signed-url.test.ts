import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  generateSignedDownloadUrl,
  validateSignedUrl,
  extractSignedUrlParams,
} from "../../src/utils/signed-url.js";

describe("generateSignedDownloadUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-key-for-signing";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("generates URL with expires and token params", () => {
    const url = generateSignedDownloadUrl("resource-123", "/api/download");
    expect(url).toMatch(/^\/api\/download\?expires=\d+&token=[a-f0-9]+$/);
  });

  it("uses custom TTL", () => {
    const before = Math.floor(Date.now() / 1000);
    const url = generateSignedDownloadUrl("resource-123", "/api/download", 3600);
    const params = new URLSearchParams(url.split("?")[1]);
    const expires = parseInt(params.get("expires") || "0");
    const after = Math.floor(Date.now() / 1000);

    // Expires should be between now+3600 and now+3601 (accounting for test execution time)
    expect(expires).toBeGreaterThanOrEqual(before + 3600);
    expect(expires).toBeLessThanOrEqual(after + 3601);
  });

  it("generates different tokens for different resources", () => {
    const url1 = generateSignedDownloadUrl("resource-1", "/api/download");
    const url2 = generateSignedDownloadUrl("resource-2", "/api/download");

    const token1 = new URLSearchParams(url1.split("?")[1]).get("token");
    const token2 = new URLSearchParams(url2.split("?")[1]).get("token");

    expect(token1).not.toBe(token2);
  });

  it("throws error when NEXTAUTH_SECRET is not set", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => generateSignedDownloadUrl("resource-123", "/api/download")).toThrow(
      "NEXTAUTH_SECRET environment variable is required"
    );
  });
});

describe("validateSignedUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-key-for-signing";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("validates a freshly generated URL", () => {
    const url = generateSignedDownloadUrl("resource-123", "/api/download");
    const params = new URLSearchParams(url.split("?")[1]);
    const expires = parseInt(params.get("expires") || "0");
    const token = params.get("token") || "";

    const result = validateSignedUrl("resource-123", expires, token);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("rejects expired URL", () => {
    const pastExpires = Math.floor(Date.now() / 1000) - 100;
    const result = validateSignedUrl("resource-123", pastExpires, "any-token");

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Link expired");
  });

  it("rejects invalid signature", () => {
    const futureExpires = Math.floor(Date.now() / 1000) + 3600;
    const result = validateSignedUrl("resource-123", futureExpires, "invalid-token");

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });

  it("rejects signature for different resource", () => {
    const url = generateSignedDownloadUrl("resource-1", "/api/download");
    const params = new URLSearchParams(url.split("?")[1]);
    const expires = parseInt(params.get("expires") || "0");
    const token = params.get("token") || "";

    const result = validateSignedUrl("resource-2", expires, token);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });

  it("throws error when NEXTAUTH_SECRET is not set", () => {
    delete process.env.NEXTAUTH_SECRET;
    const futureExpires = Math.floor(Date.now() / 1000) + 3600;
    expect(() => validateSignedUrl("resource-123", futureExpires, "any-token")).toThrow(
      "NEXTAUTH_SECRET environment variable is required"
    );
  });
});

describe("extractSignedUrlParams", () => {
  it("extracts expires and token from URL", () => {
    const url = "/api/download?expires=1234567890&token=abcdef123456";
    const params = extractSignedUrlParams(url);

    expect(params.expires).toBe(1234567890);
    expect(params.token).toBe("abcdef123456");
  });

  it("returns null for missing expires", () => {
    const url = "/api/download?token=abcdef123456";
    const params = extractSignedUrlParams(url);

    expect(params.expires).toBeNull();
    expect(params.token).toBe("abcdef123456");
  });

  it("returns null for missing token", () => {
    const url = "/api/download?expires=1234567890";
    const params = extractSignedUrlParams(url);

    expect(params.expires).toBe(1234567890);
    expect(params.token).toBeNull();
  });

  it("returns null for both if URL has no query params", () => {
    const url = "/api/download";
    const params = extractSignedUrlParams(url);

    expect(params.expires).toBeNull();
    expect(params.token).toBeNull();
  });

  it("returns null for invalid expires value", () => {
    const url = "/api/download?expires=invalid&token=abcdef123456";
    const params = extractSignedUrlParams(url);

    expect(params.expires).toBeNull();
    expect(params.token).toBe("abcdef123456");
  });
});
