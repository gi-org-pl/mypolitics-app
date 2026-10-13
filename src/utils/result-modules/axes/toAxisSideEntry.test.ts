import { describe, expect, it } from "vitest";

import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";

import { toAxisSideEntry } from "./toAxisSideEntry";

describe("toAxisSideEntry()", () => {
  describe("given a side with one shown orientation", () => {
    it("returns the orientation with its value", () => {
      expect(toAxisSideEntry(["left"], moduleQuizContext)).toMatchObject({
        orientation: { id: "left", name: "Interwencjonizm" },
        value: 100,
      });
    });
  });

  describe("given a side with several orientations", () => {
    it("carries the first shown one, with the value of the whole side", () => {
      // left 3 of 3 and green 1 of 1: 4 of 4.
      expect(
        toAxisSideEntry(["left", "green"], moduleQuizContext),
      ).toMatchObject({ orientation: { id: "left" }, value: 100 });
      // right 0 of 3 and green 1 of 1: 1 of 4.
      expect(
        toAxisSideEntry(["right", "green"], moduleQuizContext),
      ).toMatchObject({ orientation: { id: "right" }, value: 25 });
    });

    it("counts the hidden orientations of the side in the value, and never carries one", () => {
      // secret 0 of 1, left 3 of 3 and green 1 of 1: 4 of 5.
      expect(
        toAxisSideEntry(["secret", "left", "green"], moduleQuizContext),
      ).toMatchObject({ orientation: { id: "left" }, value: 80 });
    });
  });

  describe("given an orientation whose name has two forms", () => {
    it("carries the form of the declared gender", () => {
      expect(
        toAxisSideEntry(["socialist"], {
          ...moduleQuizContext,
          gender: "female",
        })?.orientation.name,
      ).toBe("Socjalistka");
    });
  });

  describe("given a side whose orientations have no score", () => {
    it("returns the orientation with no value", () => {
      const entry = toAxisSideEntry(["left"], {
        survey: moduleQuiz,
        result: { scores: {}, answers: [] },
      });

      expect(entry?.orientation.id).toBe("left");
      expect(entry?.value).toBeUndefined();
    });
  });

  describe("given a side with no shown orientation", () => {
    it("returns nothing", () => {
      expect(toAxisSideEntry([], moduleQuizContext)).toBeUndefined();
      expect(toAxisSideEntry(["secret"], moduleQuizContext)).toBeUndefined();
      expect(toAxisSideEntry(["ghost"], moduleQuizContext)).toBeUndefined();
    });
  });
});
