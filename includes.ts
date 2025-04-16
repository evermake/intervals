/**
 * This module implements a check if a set of intervals includes a given interval.
 *
 * @module
 */

import type { Interval } from "./interval.ts";
import { merge } from "./merge.ts";

/**
 * Checks if a set of number intervals includes a given interval.
 *
 * @example
 * ```ts
 * includes([[1, 3], [2, 5], [8, 10]], [2, 5])
 * // true
 *
 * includes([[1, 3], [2, 5], [8, 10]], [3, 7])
 * // false
 *
 * includes([[1, 3], [2, 5], [8, 10]], [0, 2])
 * // false
 * ```
 */
export function includes(
  intervals: Interval<number>[],
  target: Interval<number>,
): boolean;
/**
 * Checks if a set of intervals of type `T` includes a given interval using a provided comparator function.
 *
 * @example
 * ```ts
 * const dateIntervals = [
 *   [new Date("2023-01-01"), new Date("2023-01-05")],
 *   [new Date("2023-01-10"), new Date("2023-01-20")]
 * ];
 * const targetInterval = [new Date("2023-01-02"), new Date("2023-01-04")];
 *
 * includes(dateIntervals, targetInterval, {
 *   compareFn: (a, b) => a.getTime() - b.getTime()
 * });
 * // true
 * ```
 */
export function includes<T>(
  intervals: Interval<T>[],
  target: Interval<T>,
  options: {
    compareFn: (a: T, b: T) => number;
  },
): boolean;
export function includes<T>(
  intervals: Interval<T>[],
  target: Interval<T>,
  options?: {
    compareFn: (a: T, b: T) => number;
  },
): boolean {
  if (intervals.length === 0) {
    return false;
  }

  if (!options?.compareFn && typeof intervals[0][0] !== "number") {
    throw new Error("compareFn is required for non-number intervals");
  }

  const compareFn = (options?.compareFn ?? ((a: number, b: number) => a - b)) as ((a: T, b: T) => number);

  const mergedIntervals = merge(intervals, { compareFn });

  // TODO: Find nearest interval using binary search.
  for (const interval of mergedIntervals) {
    if (
      compareFn(interval[0], target[0]) <= 0 &&
      compareFn(interval[1], target[1]) >= 0
    ) {
      return true;
    }
  }

  return false;
}
