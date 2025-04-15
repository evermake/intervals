import { assertEquals } from "@std/assert";
import { exclude } from "./exclude.ts";

Deno.test("exclude with empty arrays", () => {
  assertEquals(exclude([], []), []);
  assertEquals(exclude([[1, 5]], []), [[1, 5]]);
  assertEquals(exclude([], [[1, 5]]), []);
});

Deno.test("exclude non-overlapping intervals", () => {
  assertEquals(
    exclude(
      [[1, 3], [5, 7]],
      [[10, 12]]
    ),
    [[1, 3], [5, 7]]
  );
});

Deno.test("exclude completely overlapping intervals", () => {
  assertEquals(
    exclude(
      [[1, 10]],
      [[2, 5], [6, 8]]
    ),
    [[1, 2], [5, 6], [8, 10]]
  );
});

Deno.test("exclude partially overlapping intervals", () => {
  assertEquals(
    exclude(
      [[1, 5], [7, 10]],
      [[3, 8]]
    ),
    [[1, 3], [8, 10]]
  );
});

Deno.test("exclude with exact boundary matches", () => {
  assertEquals(
    exclude(
      [[1, 5], [7, 10]],
      [[5, 7]]
    ),
    [[1, 5], [7, 10]]
  );
  
  assertEquals(
    exclude(
      [[1, 5], [7, 10]],
      [[0, 1], [5, 7], [10, 12]]
    ),
    [[1, 5], [7, 10]]
  );
});

Deno.test("exclude with complete exclusion", () => {
  assertEquals(
    exclude(
      [[3, 6]],
      [[2, 7]]
    ),
    []
  );
});

Deno.test("exclude with multiple overlapping exclusions", () => {
  assertEquals(
    exclude(
      [[1, 10]],
      [[2, 4], [3, 5], [7, 9]]
    ),
    [[1, 2], [5, 7], [9, 10]]
  );
});

Deno.test("exclude with adjacent intervals", () => {
  assertEquals(
    exclude(
      [[1, 3], [3, 6], [8, 10]],
      [[3, 4]]
    ),
    [[1, 3], [4, 6], [8, 10]]
  );
});

Deno.test("exclude with negative numbers", () => {
  assertEquals(
    exclude(
      [[-5, 5]],
      [[-3, 0], [2, 4]]
    ),
    [[-5, -3], [0, 2], [4, 5]]
  );
});

Deno.test("exclude with decimal numbers", () => {
  assertEquals(
    exclude(
      [[1.1, 5.5]],
      [[2.2, 3.3], [4.4, 5.0]]
    ),
    [[1.1, 2.2], [3.3, 4.4], [5.0, 5.5]]
  );
});

Deno.test("exclude with merged input intervals", () => {
  // The function should merge overlapping intervals in the inputs
  assertEquals(
    exclude(
      [[1, 3], [2, 5], [8, 10]],
      [[4, 6], [5, 7]]
    ),
    [[1, 4], [8, 10]]
  );
});

Deno.test("exclude with complex scenario (sorted)", () => {
  assertEquals(
    exclude(
      [[0, 5], [7, 15], [20, 25], [30, 35]],
      [[2, 3], [8, 10], [12, 14], [22, 28], [33, 36]]
    ),
    [[0, 2], [3, 5], [7, 8], [10, 12], [14, 15], [20, 22], [30, 33]]
  );
});

Deno.test("exclude with complex scenario (unsorted)", () => {
  assertEquals(
    exclude(
      [[7, 15], [0, 5], [30, 35], [20, 25]],
      [[33, 36], [2, 3], [22, 28], [8, 10], [12, 14]]
    ),
    [[0, 2], [3, 5], [7, 8], [10, 12], [14, 15], [20, 22], [30, 33]]
  );
});


Deno.test("exclude with dense overlaps", () => {
  assertEquals(
    exclude(
      [[-5, 10], [2, 20], [20, 25], [25, 30]],
      [[-5, 15], [20, 25], [30, 100]]
    ),
    [[15, 20], [25, 30]]
  );
});

Deno.test("exclude with date intervals", () => {
  assertEquals(
    exclude(
      [
        [new Date("2023-01-01"), new Date("2023-01-20")],
        [new Date("2023-02-01"), new Date("2023-02-15")]
      ],
      [
        [new Date("2023-01-05"), new Date("2023-01-10")],
        [new Date("2023-02-10"), new Date("2023-02-12")]
      ],
      { compareFn: (a, b) => a.getTime() - b.getTime() }
    ),
    [
      [new Date("2023-01-01"), new Date("2023-01-05")],
      [new Date("2023-01-10"), new Date("2023-01-20")],
      [new Date("2023-02-01"), new Date("2023-02-10")],
      [new Date("2023-02-12"), new Date("2023-02-15")]
    ]
  );
});

Deno.test("exclude with string intervals", () => {
  assertEquals(
    exclude(
      [["a", "f"], ["h", "m"]],
      [["c", "d"], ["i", "k"]],
      { compareFn: (a, b) => a.localeCompare(b) }
    ),
    [["a", "c"], ["d", "f"], ["h", "i"], ["k", "m"]]
  );
});
