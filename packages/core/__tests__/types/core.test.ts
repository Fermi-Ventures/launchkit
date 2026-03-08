import { describe, it, expect } from "vitest";
import {
  UnauthorizedError,
  NotFoundError,
  type ActionResult,
  type ApiCallUsage,
  type WithUsage,
} from "../../src/types/core.js";

describe("UnauthorizedError", () => {
  it("has correct name", () => {
    const error = new UnauthorizedError();
    expect(error.name).toBe("UnauthorizedError");
  });

  it("uses default message", () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe("Not authorized");
  });

  it("accepts custom message", () => {
    const error = new UnauthorizedError("Custom unauthorized message");
    expect(error.message).toBe("Custom unauthorized message");
  });

  it("is instanceof Error", () => {
    const error = new UnauthorizedError();
    expect(error).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("has correct name", () => {
    const error = new NotFoundError();
    expect(error.name).toBe("NotFoundError");
  });

  it("uses default message", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("Resource not found");
  });

  it("accepts custom message", () => {
    const error = new NotFoundError("User not found");
    expect(error.message).toBe("User not found");
  });

  it("is instanceof Error", () => {
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(Error);
  });
});

describe("ActionResult type", () => {
  it("allows success with data", () => {
    const result: ActionResult<string> = {
      success: true,
      data: "test data",
    };
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test data");
    }
  });

  it("allows success with warnings", () => {
    const result: ActionResult<string> = {
      success: true,
      data: "test data",
      warnings: ["Warning 1", "Warning 2"],
    };
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.warnings).toEqual(["Warning 1", "Warning 2"]);
    }
  });

  it("allows success without data (void)", () => {
    const result: ActionResult = {
      success: true,
    };
    expect(result.success).toBe(true);
  });

  it("allows error with message", () => {
    const result: ActionResult = {
      success: false,
      error: "Something went wrong",
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Something went wrong");
    }
  });

  it("allows error with details", () => {
    const result: ActionResult = {
      success: false,
      error: "Database error",
      details: "Connection timeout after 30s",
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Database error");
      expect(result.details).toBe("Connection timeout after 30s");
    }
  });

  it("discriminates success vs error cases", () => {
    const successResult: ActionResult<number> = {
      success: true,
      data: 42,
    };

    const errorResult: ActionResult<number> = {
      success: false,
      error: "Failed",
    };

    // TypeScript should narrow types based on success field
    if (successResult.success) {
      expect(successResult.data).toBe(42);
      // @ts-expect-error - error should not exist on success result
      expect(successResult.error).toBeUndefined();
    }

    if (!errorResult.success) {
      expect(errorResult.error).toBe("Failed");
      // @ts-expect-error - data should not exist on error result
      expect(errorResult.data).toBeUndefined();
    }
  });
});

describe("ApiCallUsage type", () => {
  it("stores token usage metrics", () => {
    const usage: ApiCallUsage = {
      inputTokens: 100,
      outputTokens: 200,
      model: "claude-3-5-sonnet-20241022",
      durationMs: 1500,
    };

    expect(usage.inputTokens).toBe(100);
    expect(usage.outputTokens).toBe(200);
    expect(usage.model).toBe("claude-3-5-sonnet-20241022");
    expect(usage.durationMs).toBe(1500);
  });
});

describe("WithUsage type", () => {
  it("wraps result with usage data", () => {
    const withUsage: WithUsage<string> = {
      result: "Generated text",
      usage: {
        inputTokens: 50,
        outputTokens: 150,
        model: "claude-3-5-sonnet-20241022",
        durationMs: 800,
      },
    };

    expect(withUsage.result).toBe("Generated text");
    expect(withUsage.usage.inputTokens).toBe(50);
    expect(withUsage.usage.outputTokens).toBe(150);
  });

  it("works with complex result types", () => {
    interface Analysis {
      sentiment: string;
      score: number;
    }

    const withUsage: WithUsage<Analysis> = {
      result: {
        sentiment: "positive",
        score: 0.85,
      },
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        model: "claude-3-5-sonnet-20241022",
        durationMs: 600,
      },
    };

    expect(withUsage.result.sentiment).toBe("positive");
    expect(withUsage.result.score).toBe(0.85);
  });
});
