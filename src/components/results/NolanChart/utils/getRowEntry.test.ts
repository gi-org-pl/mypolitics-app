import { describe, expect, it } from "vitest";

import type { NolanPole } from "../NolanChart.types";
import { getRowEntry } from "./getRowEntry";

const pole: NolanPole = {
  entry: {
    orientation: {
      id: "left",
      type: "ideology",
      name: "Lewica",
      imageUrl: "https://example.com/left.svg",
      color: "#111111",
    },
    value: 77,
  },
  names: { moderate: "Umiarkowana lewica" },
};

describe("getRowEntry()", () => {
  it("replaces the orientation colour with the given one", () => {
    expect(getRowEntry(pole, "#36db8b")).toEqual({
      orientation: { ...pole.entry.orientation, color: "#36db8b" },
      value: 77,
    });
  });

  it("drops the orientation colour when none is given", () => {
    expect(getRowEntry(pole).orientation.color).toBeUndefined();
  });

  it("leaves the pole untouched", () => {
    getRowEntry(pole, "#36db8b");

    expect(pole.entry.orientation.color).toBe("#111111");
  });
});
