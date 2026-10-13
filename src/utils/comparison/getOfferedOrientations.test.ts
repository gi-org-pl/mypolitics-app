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
        resultModules: [],
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
          resultModules: [],
        }),
      ).toEqual([]);
    });
  });

  describe("given a quiz whose header is pointed at orientations", () => {
    const withHeader = (orientationIds: string[]) => ({
      ...comparisonQuiz,
      resultModules: [
        {
          id: "header",
          type: "header" as const,
          position: 0,
          column: "start" as const,
          orientationIds,
          axisIds: [],
          values: {},
        },
      ],
    });

    it("offers only those of them an answer lists, in the order of the quiz", () => {
      expect(toIds(getOfferedOrientations(withHeader(["right"])))).toEqual([
        "right",
      ]);
      expect(
        toIds(getOfferedOrientations(withHeader(["right", "left"]))),
      ).toEqual(["left", "right"]);
    });

    it("still offers no hidden orientation and none that no answer lists", () => {
      expect(
        toIds(getOfferedOrientations(withHeader(["hidden", "centre"]))),
      ).toEqual([]);
    });
  });

  describe("given a quiz whose header is pointed at nothing", () => {
    it("offers every orientation an answer lists", () => {
      expect(
        toIds(
          getOfferedOrientations({
            ...comparisonQuiz,
            resultModules: [
              {
                id: "header",
                type: "header",
                position: 0,
                column: "start",
                orientationIds: [],
                axisIds: [],
                values: {},
              },
            ],
          }),
        ),
      ).toEqual(["left", "right"]);
    });
  });
});
