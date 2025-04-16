/**
 * This module implements exclusion of overlapping intervals.
 *
 * @module
 */

import type { Interval } from "./interval.ts";
import { merge } from "./merge.ts";

const INVALID_STATE_ERROR = new Error('invalid state');

/**
 * Excludes intervals from a set of intervals.
 *
 * @example
 * ```ts
 * exclude([[1, 10]], [[3, 5]])
 * // [[1, 3], [5, 10]]
 * ```
 */
export function exclude(
  toInclude: Interval<number>[],
  toExclude: Interval<number>[],
): Interval<number>[];
/**
 * Excludes intervals from a set of intervals using a provided comparator function.
 *
 * @example
 * ```ts
 * const includeDates = [
 *   [new Date("2023-01-01"), new Date("2023-01-20")]
 * ];
 * const excludeDates = [
 *   [new Date("2023-01-05"), new Date("2023-01-10")]
 * ];
 *
 * exclude(includeDates, excludeDates, {
 *   compareFn: (a, b) => a.getTime() - b.getTime()
 * });
 * // [
 * //   [new Date("2023-01-01"), new Date("2023-01-05")],
 * //   [new Date("2023-01-10"), new Date("2023-01-20")]
 * // ]
 * ```
 */
export function exclude<T>(
  toInclude: Interval<T>[],
  toExclude: Interval<T>[],
  options: {
    compareFn: (a: T, b: T) => number;
  },
): Interval<T>[];
export function exclude<T>(
  toInclude: Interval<T>[],
  toExclude: Interval<T>[],
  options?: {
    compareFn: (a: T, b: T) => number;
  },
): Interval<T>[] {
  if (toInclude.length === 0) {
    return [];
  }

  if (!options?.compareFn && typeof toInclude[0]?.[0] !== "number") {
    throw new Error("compareFn is required for non-number intervals");
  }

  const compareFn = (options?.compareFn ?? ((a: number, b: number) => a - b)) as ((a: T, b: T) => number);

  const incls = merge(toInclude, { compareFn });
  const excls = merge(toExclude, { compareFn });

  const result: Interval<T>[] = [];

  let nextInclEdgeI = 0;
  let nextExclEdgeI = 0;
  let included = false;
  let excluded = false;
  let going: T | null = null;

  const getNextEdge = (intervals: Interval<T>[], edgeI: number): null | ["start" | "end", T] => {
    if (edgeI < intervals.length * 2) {
      return [
        edgeI % 2 === 0 ? "start" : "end",
        intervals[Math.trunc(edgeI / 2)][edgeI % 2],
      ];
    }
    return null;
  };

  while (true) {
    const nextInclEdge = getNextEdge(incls, nextInclEdgeI);
    const nextExclEdge = getNextEdge(excls, nextExclEdgeI);

    let nearest: T;
    let nextIncluded: boolean = included;
    let nextExcluded: boolean = excluded;
    if (!nextInclEdge && !nextExclEdge) {
      break;
    } else if ((!nextInclEdge && nextExclEdge) || (nextInclEdge && nextExclEdge && (compareFn(nextExclEdge[1], nextInclEdge[1]) <= 0))) {
      nearest = nextExclEdge[1];
      nextExcluded = nextExclEdge[0] === "start";
      nextExclEdgeI++;
    } else if ((nextInclEdge && !nextExclEdge) || (nextInclEdge && nextExclEdge && (compareFn(nextInclEdge[1], nextExclEdge[1]) <= 0))) {
      nearest = nextInclEdge[1];
      nextIncluded = nextInclEdge[0] === "start";
      nextInclEdgeI++;
    } else {
      throw INVALID_STATE_ERROR;
    }

    // state transitions
    switch (true) {
      case (!included && !excluded && nextIncluded && !nextExcluded):
      case (included && excluded && nextIncluded && !nextExcluded):
        going = nearest;
        break;
      case (included && !excluded && !nextIncluded && !nextExcluded):
      case (included && !excluded && nextIncluded && nextExcluded):
        if (going === null) {
          throw INVALID_STATE_ERROR;
        }
        if (compareFn(going, nearest) < 0) {
          result.push([going, nearest]);
        }
        going = null;
        break;
      case (!included && excluded && !nextIncluded && !nextExcluded):
      case (!included && excluded && nextIncluded && nextExcluded):
      case (included && excluded && !nextIncluded && nextExcluded):
      case (!included && !excluded && !nextIncluded && nextExcluded):
        break;
      default:
        throw INVALID_STATE_ERROR;
    }

    included = nextIncluded;
    excluded = nextExcluded;
  }

  return result;
}
