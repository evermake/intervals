import { assertEquals } from "@std/assert";
import { includes } from "./includes.ts";
import type { Interval } from "./interval.ts";

Deno.test("includes - empty intervals", () => {
  assertEquals(includes([], [1, 2]), false);
});

Deno.test("includes - number intervals", () => {
  // Basic cases
  assertEquals(includes([[1, 5]], [2, 4]), true);
  assertEquals(includes([[1, 5]], [1, 5]), true);
  assertEquals(includes([[1, 5]], [0, 6]), false);
  assertEquals(includes([[1, 5]], [0, 3]), false);
  assertEquals(includes([[1, 5]], [3, 6]), false);

  // Multiple intervals
  assertEquals(includes([[1, 3], [5, 7]], [2, 3]), true);
  assertEquals(includes([[1, 3], [5, 7]], [5, 6]), true);
  assertEquals(includes([[1, 3], [5, 7]], [3, 5]), false);
  assertEquals(includes([[1, 3], [5, 7]], [2, 6]), false);

  // Edge cases
  assertEquals(includes([[1, 5]], [1, 1]), true);
  assertEquals(includes([[1, 5]], [5, 5]), true);
  assertEquals(includes([[1, 5]], [0, 0]), false);
  assertEquals(includes([[1, 5]], [6, 6]), false);
});

Deno.test("includes - with custom comparator", () => {
  const dateIntervals: Interval<Date>[] = [
    [new Date("2023-01-01"), new Date("2023-01-10")],
    [new Date("2023-01-15"), new Date("2023-01-25")],
  ];

  const compareFn = (a: Date, b: Date) => a.getTime() - b.getTime();

  // Contained intervals
  assertEquals(
    includes(
      dateIntervals,
      [new Date("2023-01-02"), new Date("2023-01-08")],
      { compareFn },
    ),
    true,
  );

  // Exact match
  assertEquals(
    includes(
      dateIntervals,
      [new Date("2023-01-01"), new Date("2023-01-10")],
      { compareFn },
    ),
    true,
  );

  // Partially overlapping
  assertEquals(
    includes(
      dateIntervals,
      [new Date("2023-01-05"), new Date("2023-01-12")],
      { compareFn },
    ),
    false,
  );

  // Non-overlapping
  assertEquals(
    includes(
      dateIntervals,
      [new Date("2023-01-11"), new Date("2023-01-14")],
      { compareFn },
    ),
    false,
  );

  // Spanning multiple intervals
  assertEquals(
    includes(
      dateIntervals,
      [new Date("2023-01-05"), new Date("2023-01-20")],
      { compareFn },
    ),
    false,
  );
});

Deno.test("includes - with merged intervals", () => {
  // Test with intervals that would merge
  assertEquals(
    includes(
      [[1, 3], [2, 5], [8, 10]],
      [2, 5],
    ),
    true,
  );

  assertEquals(
    includes(
      [[1, 3], [2, 5], [8, 10]],
      [1, 5],
    ),
    true,
  );

  assertEquals(
    includes(
      [[1, 3], [2, 5], [8, 10]],
      [3, 7],
    ),
    false,
  );
});
