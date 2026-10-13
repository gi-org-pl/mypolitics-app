import { describe, expect, it } from "vitest";

import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";

import { getRecordEntries } from "./getRecordEntries";

describe("getRecordEntries()", () => {
  describe("given a record that lists orientations", () => {
    it("returns the shown ones in the author's order, each with its value", () => {
      expect(
        getRecordEntries(
          { orientationIds: ["liberal", "anarchist", "socialist"] },
          moduleQuizContext,
        ),
      ).toMatchObject([
        { orientation: { id: "liberal", name: "Liberał" }, value: 20 },
        { orientation: { id: "socialist", name: "Socjalista" }, value: 100 },
      ]);
    });

    it("returns each in the form of the declared gender", () => {
      const [entry] = getRecordEntries(
        { orientationIds: ["socialist"] },
        { ...moduleQuizContext, gender: "female" },
      );

      expect(entry.orientation.name).toBe("Socjalistka");
    });

    it("gives no value to an orientation that has no score, or no maximum", () => {
      const entries = getRecordEntries(
        { orientationIds: ["party-left", "party-right"] },
        moduleQuizContext,
      );

      expect(entries.map(({ orientation }) => orientation.id)).toEqual([
        "party-left",
        "party-right",
      ]);
      expect(entries.map(({ value }) => value)).toEqual([undefined, undefined]);
    });
  });

  describe("given a result with no scores", () => {
    it("returns the shown orientations with no values", () => {
      const entries = getRecordEntries(
        { orientationIds: ["liberal", "socialist"] },
        { survey: moduleQuiz, result: { scores: {}, answers: [] } },
      );

      expect(entries).toHaveLength(2);
      expect(entries.map(({ value }) => value)).toEqual([undefined, undefined]);
    });
  });

  describe("given a record that lists no shown orientation", () => {
    it("returns an empty list", () => {
      expect(
        getRecordEntries({ orientationIds: [] }, moduleQuizContext),
      ).toEqual([]);
      expect(
        getRecordEntries({ orientationIds: ["anarchist"] }, moduleQuizContext),
      ).toEqual([]);
    });
  });
});
