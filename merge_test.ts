import { assertEquals, assertThrows } from "@std/assert";
import { merge } from "./merge.ts";

Deno.test("merge empty array", () => {
  assertEquals(
    merge([]),
    [],
  );
});

Deno.test("merge single interval", () => {
  assertEquals(
    merge([[1, 3]]),
    [[1, 3]],
  );
});

Deno.test("merge non-overlapping intervals", () => {
  assertEquals(
    merge([[1, 3], [5, 7], [9, 11]]),
    [[1, 3], [5, 7], [9, 11]],
  );
});

Deno.test("merge overlapping intervals", () => {
  assertEquals(
    merge([[1, 3], [2, 6], [8, 10], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]],
  );
});

Deno.test("merge completely overlapping intervals", () => {
  assertEquals(
    merge([[1, 10], [2, 5], [3, 7], [8, 9]]),
    [[1, 10]],
  );
});

Deno.test("merge adjacent intervals", () => {
  assertEquals(
    merge([[1, 3], [3, 6], [8, 10]]),
    [[1, 6], [8, 10]],
  );
});

Deno.test("merge unsorted intervals", () => {
  assertEquals(
    merge([[8, 10], [1, 3], [2, 6], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]],
  );
});

Deno.test("merge with custom comparator - date intervals", () => {
  const dates: [Date, Date][] = [
    [new Date("2023-01-01"), new Date("2023-01-05")],
    [new Date("2023-01-03"), new Date("2023-01-10")],
    [new Date("2023-01-15"), new Date("2023-01-20")],
  ];

  const result = merge(dates, {
    compareFn: (a: Date, b: Date) => a.getTime() - b.getTime(),
  });

  assertEquals(result, [
    [new Date("2023-01-01"), new Date("2023-01-10")],
    [new Date("2023-01-15"), new Date("2023-01-20")],
  ]);
});

Deno.test("merge with custom comparator - string intervals", () => {
  const strings: [string, string][] = [
    ["a", "c"],
    ["b", "d"],
    ["e", "g"],
    ["f", "h"],
  ];

  const result = merge(strings, {
    compareFn: (a: string, b: string) => a.localeCompare(b),
  });

  assertEquals(result, [
    ["a", "d"],
    ["e", "h"],
  ]);
});

Deno.test("throws error for non-number intervals without compareFn", () => {
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => merge([["a", "b"], ["c", "d"]] as any),
    Error,
    "compareFn is required for non-number intervals",
  );
});

Deno.test("merge with negative numbers", () => {
  assertEquals(merge([[-5, -3], [-4, -1], [0, 2], [1, 5]]), [[-5, -1], [0, 5]]);
});

Deno.test("merge with decimal numbers", () => {
  assertEquals(merge([[1.1, 2.2], [2.0, 3.3], [4.4, 5.5]]), [[1.1, 3.3], [4.4, 5.5]]);
});
