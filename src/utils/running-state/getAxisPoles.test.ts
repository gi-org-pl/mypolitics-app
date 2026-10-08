import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";
import { createSurveyAxis } from "@/utils/vitest/createSurveyAxis";

import { getAxisPoles } from "./getAxisPoles";

describe("getAxisPoles()", () => {
  const orientations = [
    createOrientation("left", "Lewica"),
    createOrientation("right", "Prawica"),
    createOrientation("centre", "Centrum"),
    createOrientation("hidden", "Ukryta", { isHidden: true }),
    createOrientation("nameless"),
  ];

  describe("given an axis with one orientation on each side", () => {
    it("returns the negative side as the start and the positive side as the end", () => {
      const poles = getAxisPoles(
        createSurveyAxis("economy", ["left"], ["right"]),
        orientations,
      );

      expect(poles?.start).toMatchObject({ id: "left", name: "Lewica" });
      expect(poles?.end).toMatchObject({ id: "right", name: "Prawica" });
    });
  });

  describe("given an axis with one side empty", () => {
    it("returns only the pole of the other side", () => {
      expect(
        getAxisPoles(createSurveyAxis("economy", ["left"], []), orientations),
      ).toEqual({ start: orientations[0], end: undefined });
      expect(
        getAxisPoles(createSurveyAxis("economy", [], ["right"]), orientations),
      ).toEqual({ start: undefined, end: orientations[1] });
    });
  });

  describe("given an axis with both sides empty", () => {
    it("returns no pole", () => {
      expect(
        getAxisPoles(createSurveyAxis("economy", [], []), orientations),
      ).toEqual({ start: undefined, end: undefined });
    });
  });

  describe("given an axis that cannot be spoken about", () => {
    it("returns null for more than one orientation on a side", () => {
      expect(
        getAxisPoles(
          createSurveyAxis("economy", ["left", "centre"], ["right"]),
          orientations,
        ),
      ).toBeNull();
      expect(
        getAxisPoles(
          createSurveyAxis("economy", ["left"], ["right", "centre"]),
          orientations,
        ),
      ).toBeNull();
    });

    it("returns null for the same orientation on both sides", () => {
      expect(
        getAxisPoles(
          createSurveyAxis("economy", ["left"], ["left"]),
          orientations,
        ),
      ).toBeNull();
    });

    it("returns null for a hidden orientation on either side", () => {
      expect(
        getAxisPoles(
          createSurveyAxis("economy", ["hidden"], ["right"]),
          orientations,
        ),
      ).toBeNull();
      expect(
        getAxisPoles(createSurveyAxis("economy", [], ["hidden"]), orientations),
      ).toBeNull();
    });

    it("returns null for a nameless orientation on a side", () => {
      expect(
        getAxisPoles(
          createSurveyAxis("economy", ["left"], ["nameless"]),
          orientations,
        ),
      ).toBeNull();
    });

    it("returns null for an axis of another type", () => {
      expect(
        getAxisPoles(
          createSurveyAxis("x", ["left"], ["right"], {
            type: "compass_x_axis",
          }),
          orientations,
        ),
      ).toBeNull();
      expect(
        getAxisPoles(
          createSurveyAxis("x", ["left"], ["right"], { type: "other" }),
          orientations,
        ),
      ).toBeNull();
    });
  });
});
