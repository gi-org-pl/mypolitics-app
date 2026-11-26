import { describe, expect, it } from "vitest";

import { GLYPH_ADDRESS } from "@/constants/image.fixtures";
import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";

import type { AxisGroup, AxisPair } from "../MultiAxisChart.types";
import { withGroupColors } from "./withGroupColors";

const PURPLE = "#9B59B6";
const TEAL = "#1ABC9C";

const pole = (name: string, color?: string): Orientation =>
  createOrientation(name.toLowerCase(), name, {
    color,
    imageUrl: GLYPH_ADDRESS,
  });

const axis = (
  id: string,
  [startName, startColor]: [string, string?],
  [endName, endColor]: [string, string?],
): AxisPair => ({
  id,
  start: { orientation: pole(startName, startColor), value: 30 },
  end: { orientation: pole(endName, endColor), value: 40 },
});

// The category "Światopogląd" of the identity quiz as the API sends it: its
// main axis has colours, and the ideologies of its additional axes are stored
// as white, which is read as no colour.
const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    axis("main", ["Progresywizm", PURPLE], ["Tradycjonalizm", TEAL]),
    axis("peace", ["Pacyfizm"], ["Militaryzm"]),
    axis("equality", ["Równość"], ["Hierarchia społeczna"]),
  ],
};

const toColors = (group: AxisGroup) =>
  group.axes.map(({ start, end }) => [
    start.orientation.color,
    end.orientation.color,
  ]);

describe("withGroupColors()", () => {
  describe("given a group whose headline axis has colours and whose other axes have none", () => {
    it("draws every pole in the colour of the same pole of the headline axis", () => {
      expect(toColors(withGroupColors(worldview))).toEqual([
        [PURPLE, TEAL],
        [PURPLE, TEAL],
        [PURPLE, TEAL],
      ]);
    });

    it("changes nothing else about the group, and not the group it is given", () => {
      const coloured = withGroupColors(worldview);

      expect(coloured.name).toBe("Światopogląd");
      expect(coloured.axes.map(({ id }) => id)).toEqual([
        "main",
        "peace",
        "equality",
      ]);
      expect(coloured.axes[1].start).toMatchObject({
        orientation: { name: "Pacyfizm", imageUrl: GLYPH_ADDRESS },
        value: 30,
      });
      expect(toColors(worldview)[1]).toEqual([undefined, undefined]);
    });

    it("keeps the headline axis as it is", () => {
      expect(withGroupColors(worldview).axes[0]).toBe(worldview.axes[0]);
    });
  });

  describe("given an axis behind the headline that has a colour of its own on one pole", () => {
    it("keeps that colour, and lends the other pole the colour of the headline", () => {
      const group: AxisGroup = {
        axes: [
          worldview.axes[0],
          axis("own", ["Sekularyzm", "#E74C3C"], ["Religijność"]),
        ],
      };

      expect(toColors(withGroupColors(group))[1]).toEqual(["#E74C3C", TEAL]);
    });
  });

  describe("given a headline axis with no colour on a pole", () => {
    it("leaves the poles on that side without one", () => {
      const group: AxisGroup = {
        axes: [
          axis("main", ["Progresywizm", PURPLE], ["Tradycjonalizm"]),
          axis("peace", ["Pacyfizm"], ["Militaryzm"]),
        ],
      };

      expect(toColors(withGroupColors(group))).toEqual([
        [PURPLE, undefined],
        [PURPLE, undefined],
      ]);
    });
  });

  describe("given a group of one axis", () => {
    it("returns it with that axis as it is", () => {
      const group: AxisGroup = {
        name: "Gospodarka",
        axes: [worldview.axes[0]],
      };

      expect(withGroupColors(group)).toEqual(group);
    });
  });
});
