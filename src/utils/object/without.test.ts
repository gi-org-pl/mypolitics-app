import { describe, expect, it } from "vitest";

import { without } from "./without";

describe("without()", () => {
  it("leaves the key out and keeps the others", () => {
    expect(without({ a: 1, b: 2, c: 3 }, "b")).toEqual({ a: 1, c: 3 });
  });

  it("gives an equal copy when the key is not there", () => {
    const record = { a: 1 };
    const copy = without(record, "z");

    expect(copy).toEqual(record);
    expect(copy).not.toBe(record);
  });

  it("does not change the record it is given", () => {
    const record = { a: 1, b: 2 };

    without(record, "a");

    expect(record).toEqual({ a: 1, b: 2 });
  });
});
