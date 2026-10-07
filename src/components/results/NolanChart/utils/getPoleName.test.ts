import { describe, expect, it } from "vitest";

import type { NolanAxis } from "../NolanChart.types";
import { getPoleName } from "./getPoleName";

const axis: NolanAxis = {
  name: "Gospodarka",
  start: {
    entry: { orientation: { id: "left", type: "ideology", name: "Lewica" } },
    names: { moderate: " Umiarkowana\nlewica ", extreme: "Skrajna lewica" },
  },
  end: {
    entry: { orientation: { id: "right", type: "ideology", name: "Prawica" } },
    names: { moderate: "Umiarkowana prawica" },
  },
};

describe("getPoleName()", () => {
  it("returns the pole name for the level along the axis", () => {
    expect(getPoleName(axis, "start", -0.5)).toBe("Umiarkowana lewica");
    expect(getPoleName(axis, "start", -1)).toBe("Skrajna lewica");
    expect(getPoleName(axis, "end", 1 / 3)).toBe("Umiarkowana prawica");
  });

  it("returns no name at the centre level", () => {
    expect(getPoleName(axis, "start", -0.2)).toBe("");
    expect(getPoleName(axis, "end", 0)).toBe("");
  });

  it("returns no name when the pole has none for the level", () => {
    expect(getPoleName(axis, "end", 1)).toBe("");
    expect(
      getPoleName({ ...axis, start: { entry: axis.start.entry } }, "start", -1),
    ).toBe("");
  });

  it("returns no name without a lean or a coordinate", () => {
    expect(getPoleName(axis, undefined, -1)).toBe("");
    expect(getPoleName(axis, "start")).toBe("");
  });

  it("does not throw on an axis without the pole", () => {
    expect(
      getPoleName({ name: "X" } as unknown as NolanAxis, "start", -1),
    ).toBe("");
  });
});
