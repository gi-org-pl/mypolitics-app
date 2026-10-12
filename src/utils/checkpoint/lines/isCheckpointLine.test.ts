import { describe, expect, it } from "vitest";

import type { CheckpointPools } from "@/types/checkpoint";

import { isCheckpointLine } from "./isCheckpointLine";

describe("isCheckpointLine()", () => {
  it("accepts a line of a pool the pools have", () => {
    expect(isCheckpointLine({ pool: "halfway", index: 0 })).toBe(true);
    expect(isCheckpointLine({ pool: "position-puzzle-miss", index: 2 })).toBe(
      true,
    );
  });

  it("refuses a place the pool does not have", () => {
    expect(isCheckpointLine({ pool: "halfway", index: 3 })).toBe(false);
    expect(isCheckpointLine({ pool: "halfway", index: -1 })).toBe(false);
    expect(isCheckpointLine({ pool: "halfway", index: 1.5 })).toBe(false);
    expect(isCheckpointLine({ pool: "halfway", index: "1" })).toBe(false);
    expect(isCheckpointLine({ pool: "halfway" })).toBe(false);
  });

  it("refuses a pool that does not exist", () => {
    expect(isCheckpointLine({ pool: "unknown", index: 0 })).toBe(false);
    expect(isCheckpointLine({ pool: "toString", index: 0 })).toBe(false);
    expect(isCheckpointLine({ pool: 1, index: 0 })).toBe(false);
    expect(isCheckpointLine({ index: 0 })).toBe(false);
  });

  it("refuses anything that is not an object", () => {
    for (const value of [undefined, null, "halfway", 0, true, []]) {
      expect(isCheckpointLine(value)).toBe(false);
    }
  });

  it("reads the pools it is given", () => {
    const pools = { halfway: [] } as unknown as CheckpointPools;

    expect(isCheckpointLine({ pool: "halfway", index: 0 }, pools)).toBe(false);
  });
});
