import { describe, expect, it } from "vitest";

import { getEnabledCheckpointTypes } from "./getEnabledCheckpointTypes";

const Card = () => null;

describe("getEnabledCheckpointTypes()", () => {
  it("returns no type for an empty registry", () => {
    expect(getEnabledCheckpointTypes({})).toEqual([]);
  });

  it("returns the types that have a component", () => {
    expect(
      getEnabledCheckpointTypes({ halfway: Card, "axis-puzzle": Card }),
    ).toEqual(["axis-puzzle", "halfway"]);
  });

  it("leaves out a type whose entry holds nothing", () => {
    expect(
      getEnabledCheckpointTypes({ stats: undefined, halfway: Card }),
    ).toEqual(["halfway"]);
  });
});
