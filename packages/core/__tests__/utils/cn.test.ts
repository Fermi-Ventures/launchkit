import { describe, it, expect } from "vitest";
import { cn } from "../../src/utils/cn.js";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "py-2", "py-4")).toBe("px-2 py-4");
  });

  it("merges Tailwind conflicting classes correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null", () => {
    expect(cn("px-2", undefined, null, "py-4")).toBe("px-2 py-4");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles array input", () => {
    expect(cn(["px-2", "py-4"])).toBe("px-2 py-4");
  });

  it("deduplicates identical classes", () => {
    expect(cn("px-2", "px-2", "py-4")).toBe("px-2 py-4");
  });

  it("handles complex responsive classes", () => {
    expect(cn("sm:px-2 md:px-4", "sm:px-6")).toBe("md:px-4 sm:px-6");
  });
});
