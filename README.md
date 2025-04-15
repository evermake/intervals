TypeScript library of utilities to work with intervals.

## Installation

```sh
deno add jsr:@evermake/intervals
# or
npx jsr add @evermake/intervals
# or
pnpm dlx jsr add @evermake/intervals
# or
yarn dlx jsr add @evermake/intervals
# or
bunx jsr add @evermake/intervals
```

## Usage

```ts
import { merge } from "@evermake/intervals";
import { exclude } from "@evermake/intervals";

// Merge number intervals
merge([[1, 3], [2, 6], [8, 10]]);
// Result: [[1, 6], [8, 10]]

// Merge date intervals with custom comparator
const mergedDates = merge(
  [
    [new Date("2023-01-01"), new Date("2023-01-05")],
    [new Date("2023-01-15"), new Date("2023-01-20")],
    [new Date("2023-01-03"), new Date("2023-01-10")]
  ],
  { compareFn: (a, b) => a.getTime() - b.getTime() }
);
// Result: [
//   [new Date("2023-01-01"), new Date("2023-01-10")],
//   [new Date("2023-01-15"), new Date("2023-01-20")]
// ]

// Exclude number intervals
exclude([[1, 10]], [[3, 5]]);
// Result: [[1, 3], [5, 10]]

// Exclude string intervals with custom comparator
exclude(
  [["a", "f"], ["h", "m"]],
  [["c", "d"], ["i", "k"]],
  { compareFn: (a, b) => a.localeCompare(b) }
);
// Result: [["a", "c"], ["d", "f"], ["h", "i"], ["k", "m"]]
```

## License

[MIT](./LICENSE)
