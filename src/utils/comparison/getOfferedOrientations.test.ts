import { describe, expect, it } from "vitest";

import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";

import { comparisonQuiz } from "./comparison.fixtures";
import { getOfferedOrientations } from "./getOfferedOrientations";

const toIds = (orientations: { id: string }[]) =>
  orientations.map(({ id }) => id);

describe("getOfferedOrientations()", () => {
  describe("given a quiz", () => {
    it("offers the orientations at least one answer lists, in the order of the quiz", () => {
      expect(toIds(getOfferedOrientations(comparisonQuiz))).toEqual([
        "left",
        "right",
      ]);
    });

    it("does not offer a hidden orientation", () => {
      expect(toIds(getOfferedOrientations(comparisonQuiz))).not.toContain(
        "hidden",
      );
    });

    it("does not offer an orientation no answer lists", () => {
      expect(toIds(getOfferedOrientations(comparisonQuiz))).not.toContain(
        "centre",
      );
    });
  });

  describe("given an orientation with forms of its name", () => {
    it("offers it in its default form", () => {
      const [offered] = getOfferedOrientations({
        orientations: [
          {
            id: "socialist",
            type: "identity",
            nameForms: { masculine: "Socjalista", feminine: "Socjalistka" },
          },
        ],
        questions: [createScoredQuestion("q1", [[1, ["socialist"]]])],
      });

      expect(offered).toEqual({
        id: "socialist",
        type: "identity",
        name: "Socjalista",
        imageUrl: undefined,
      });
    });
  });

  describe("given a quiz none of whose answers lists an orientation", () => {
    it("offers none", () => {
      expect(
        getOfferedOrientations({
          orientations: comparisonQuiz.orientations,
          questions: [createScoredQuestion("q1", [[1, []]])],
        }),
      ).toEqual([]);
    });
  });
});
