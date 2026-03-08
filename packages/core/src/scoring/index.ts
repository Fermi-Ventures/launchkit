/**
 * Generic weighted scoring utilities.
 *
 * Extracted from launch-lab's venture scoring system. Provides pure
 * calculation functions for weighted scoring with configurable dimensions.
 *
 * NOTE: This module provides ONLY the generic calculation utilities.
 * Specific scoring dimensions, weights, and categories are application-specific
 * and should be defined in your application code.
 *
 * @example
 * ```ts
 * // Define your scoring dimensions
 * const WEIGHTS = {
 *   quality: 3,
 *   speed: 2,
 *   cost: 1,
 * };
 *
 * // Calculate weighted score
 * const score = calculateWeightedScore(
 *   { quality: 5, speed: 4, cost: 3 },
 *   WEIGHTS
 * );
 * // Returns: (5*3) + (4*2) + (3*1) = 26
 *
 * // Categorize score
 * const category = categorizeScore(score, [15, 25]);
 * // Returns: 'high' (score > 25)
 * ```
 */

/**
 * Calculate a weighted score from dimension scores and weights.
 *
 * @param scores - Object mapping dimension keys to scores (typically 1-5)
 * @param weights - Object mapping dimension keys to weights
 * @returns Weighted total score
 */
export function calculateWeightedScore<T extends Record<string, number>>(
  scores: T,
  weights: Record<keyof T, number>
): number {
  return Object.keys(scores).reduce((total, key) => {
    const score = scores[key];
    const weight = weights[key] ?? 1;
    return total + score * weight;
  }, 0);
}

/**
 * Categorize a score into tiers based on thresholds.
 *
 * @param score - The score to categorize
 * @param thresholds - Array of threshold values (ascending order)
 * @returns Category index (0 = lowest tier, thresholds.length = highest tier)
 *
 * @example
 * ```ts
 * categorizeScore(10, [20, 40, 60]); // Returns 0 (lowest tier)
 * categorizeScore(30, [20, 40, 60]); // Returns 1
 * categorizeScore(70, [20, 40, 60]); // Returns 3 (highest tier)
 * ```
 */
export function categorizeScore(
  score: number,
  thresholds: number[]
): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (score < thresholds[i]) return i;
  }
  return thresholds.length;
}

/**
 * Calculate the maximum possible weighted score.
 *
 * @param maxScore - Maximum score per dimension (e.g., 5 for 1-5 scale)
 * @param weights - Object mapping dimension keys to weights
 * @returns Maximum possible weighted score
 */
export function calculateMaxScore<T extends string>(
  maxScore: number,
  weights: Record<T, number>
): number {
  return (Object.values(weights) as number[]).reduce(
    (total: number, weight: number) => total + maxScore * weight,
    0
  );
}
