import { describe, it, expect } from "vitest";
import {
  calculateWeightedScore,
  categorizeScore,
  calculateMaxScore,
} from "../../src/scoring/index.js";

// Test scoring dimensions (generic example)
type TestScoreDimensions = {
  quality: number;
  speed: number;
  cost: number;
  reliability: number;
};

const TEST_WEIGHTS: Record<keyof TestScoreDimensions, number> = {
  quality: 2,
  speed: 2,
  cost: 1,
  reliability: 1,
};

// Helper to create score objects
function makeScores(value: number): TestScoreDimensions {
  return {
    quality: value,
    speed: value,
    cost: value,
    reliability: value,
  };
}

describe("calculateWeightedScore", () => {
  it("all 1s gives minimum score", () => {
    const scores = makeScores(1);
    // (1*2) + (1*2) + (1*1) + (1*1) = 6
    expect(calculateWeightedScore(scores, TEST_WEIGHTS)).toBe(6);
  });

  it("all 5s gives maximum score", () => {
    const scores = makeScores(5);
    // (5*2) + (5*2) + (5*1) + (5*1) = 30
    expect(calculateWeightedScore(scores, TEST_WEIGHTS)).toBe(30);
  });

  it("all 3s gives mid-range score", () => {
    const scores = makeScores(3);
    // (3*2) + (3*2) + (3*1) + (3*1) = 18
    expect(calculateWeightedScore(scores, TEST_WEIGHTS)).toBe(18);
  });

  it("applies weight of 2 to quality", () => {
    const base = makeScores(1);
    const withHighQuality = { ...base, quality: 5 };
    // Difference should be (5-1) * 2 = 8
    expect(
      calculateWeightedScore(withHighQuality, TEST_WEIGHTS) - calculateWeightedScore(base, TEST_WEIGHTS)
    ).toBe(8);
  });

  it("applies weight of 2 to speed", () => {
    const base = makeScores(1);
    const withHighSpeed = { ...base, speed: 5 };
    // Difference should be (5-1) * 2 = 8
    expect(
      calculateWeightedScore(withHighSpeed, TEST_WEIGHTS) - calculateWeightedScore(base, TEST_WEIGHTS)
    ).toBe(8);
  });

  it("applies weight of 1 to cost", () => {
    const base = makeScores(1);
    const withHighCost = { ...base, cost: 5 };
    // Difference should be (5-1) * 1 = 4
    expect(
      calculateWeightedScore(withHighCost, TEST_WEIGHTS) - calculateWeightedScore(base, TEST_WEIGHTS)
    ).toBe(4);
  });

  it("applies weight of 1 to reliability", () => {
    const base = makeScores(1);
    const withHighReliability = { ...base, reliability: 5 };
    // Difference should be (5-1) * 1 = 4
    expect(
      calculateWeightedScore(withHighReliability, TEST_WEIGHTS) - calculateWeightedScore(base, TEST_WEIGHTS)
    ).toBe(4);
  });

  it("handles mixed scores", () => {
    const scores: TestScoreDimensions = {
      quality: 5,
      speed: 3,
      cost: 2,
      reliability: 4,
    };
    // (5*2) + (3*2) + (2*1) + (4*1) = 10 + 6 + 2 + 4 = 22
    expect(calculateWeightedScore(scores, TEST_WEIGHTS)).toBe(22);
  });
});

describe("categorizeScore", () => {
  // Using thresholds: [10, 20, 30]
  const thresholds = [10, 20, 30];

  it("returns 0 for score below first threshold", () => {
    expect(categorizeScore(5, thresholds)).toBe(0);
  });

  it("returns 0 for score at boundary (below 10)", () => {
    expect(categorizeScore(9, thresholds)).toBe(0);
  });

  it("returns 1 for score at first threshold", () => {
    expect(categorizeScore(10, thresholds)).toBe(1);
  });

  it("returns 1 for score between first and second threshold", () => {
    expect(categorizeScore(15, thresholds)).toBe(1);
  });

  it("returns 2 for score at second threshold", () => {
    expect(categorizeScore(20, thresholds)).toBe(2);
  });

  it("returns 2 for score between second and third threshold", () => {
    expect(categorizeScore(25, thresholds)).toBe(2);
  });

  it("returns 3 for score at or above third threshold", () => {
    expect(categorizeScore(30, thresholds)).toBe(3);
  });

  it("returns 3 for score well above all thresholds", () => {
    expect(categorizeScore(100, thresholds)).toBe(3);
  });

  it("handles empty thresholds array", () => {
    expect(categorizeScore(50, [])).toBe(0);
  });

  it("handles single threshold", () => {
    expect(categorizeScore(5, [10])).toBe(0);
    expect(categorizeScore(10, [10])).toBe(1);
    expect(categorizeScore(15, [10])).toBe(1);
  });
});

describe("calculateMaxScore", () => {
  it("calculates max score correctly for test weights", () => {
    // Total weight = 2 + 2 + 1 + 1 = 6
    // Max score = 5 * 6 = 30
    expect(calculateMaxScore(5, TEST_WEIGHTS)).toBe(30);
  });

  it("works with different max score values", () => {
    // Total weight = 6
    // Max score = 10 * 6 = 60
    expect(calculateMaxScore(10, TEST_WEIGHTS)).toBe(60);
  });

  it("handles single dimension", () => {
    const singleWeight = { dimension1: 3 };
    // Max score = 5 * 3 = 15
    expect(calculateMaxScore(5, singleWeight)).toBe(15);
  });

  it("handles uniform weights", () => {
    const uniformWeights = {
      a: 1,
      b: 1,
      c: 1,
      d: 1,
    };
    // Total weight = 4
    // Max score = 5 * 4 = 20
    expect(calculateMaxScore(5, uniformWeights)).toBe(20);
  });

  it("handles fractional weights", () => {
    const fractionalWeights = {
      x: 0.5,
      y: 1.5,
    };
    // Total weight = 2
    // Max score = 5 * 2 = 10
    expect(calculateMaxScore(5, fractionalWeights)).toBe(10);
  });
});
