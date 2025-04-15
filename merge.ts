/**
 * This module implements efficient merging of overlapping intervals.
 *
 * @module
 */

import type { Interval } from "./interval.ts";

/**
 * Merges overlapping number intervals.
 *
 * @example
 * ```ts
 * merge([[1, 3], [8, 10], [2, 6]])
 * // [[1, 6], [8, 10]]
 * ```
 */
export function merge(intervals: Interval<number>[]): Interval<number>[];
/**
 * Merges overlapping intervals of type `T` using a provided comparator function.
 *
 * @example
 * ```ts
 * const dates = [
 *   [new Date("2023-01-01"), new Date("2023-01-05")],
 *   [new Date("2023-01-03"), new Date("2023-01-10")],
 *   [new Date("2023-01-15"), new Date("2023-01-20")]
 * ];
 *
 * merge(dates, { compareFn: (a, b) => (a.getTime() - b.getTime()) });
 * // [
 * //   [new Date("2023-01-01"), new Date("2023-01-10")],
 * //   [new Date("2023-01-15"), new Date("2023-01-20")]
 * // ]
 * ```
 */
export function merge<T>(
  intervals: Interval<T>[],
  options: {
    compareFn: (a: T, b: T) => number;
  },
): Interval<T>[];
export function merge<T>(
  intervals: Interval<T>[],
  options?: {
    compareFn: (a: T, b: T) => number;
  },
) {
  if (intervals.length <= 1) {
    return [...intervals];
  }

  if (!options?.compareFn && typeof intervals[0][0] !== "number") {
    throw new Error("compareFn is required for non-number intervals");
  }

  const compareFn = (options?.compareFn ?? ((a: number, b: number) => a - b)) as ((a: T, b: T) => number);

  const sorted = intervals.toSorted((a, b) => compareFn(a[0], b[0]));
  const result: Interval<T>[] = [];
  let current: Interval<T> = [sorted[0][0], sorted[0][1]];

  for (let i = 1; i < sorted.length; i++) {
    const interval = sorted[i];

    if (compareFn(current[1], interval[0]) >= 0) {
      if (compareFn(current[1], interval[1]) < 0) {
        current[1] = interval[1];
      }
    } else {
      result.push([...current]);
      current = interval;
    }
  }

  result.push([...current]);

  return result;
}
