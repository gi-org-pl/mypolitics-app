import { describe, expect, it } from "vitest";

import type { ResolutionContext, ResultModule } from "@/types/results";
import {
  moduleQuizContext,
  moduleQuizResult,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveTraits } from "./resolveTraits";

const resolve = (
  overrides: Partial<ResultModule>,
  context: ResolutionContext = moduleQuizContext,
) => resolveTraits(createResultModule("traits", "traits", overrides), context);

describe("resolveTraits()", () => {
  describe("given a record that lists orientations", () => {
    it("returns every shown one as the catalogue, in the author's order", () => {
      expect(
        resolve({ orientationIds: ["calm", "secret", "brave"] }),
      ).toMatchObject({
        type: "traits",
        traits: [
          { id: "calm", name: "Spokój" },
          { id: "brave", name: "Odwaga" },
        ],
      });
    });

    it("returns as earned the ones that scored all they could in the whole quiz", () => {
      expect(resolve({ orientationIds: ["calm", "brave"] })?.earnedIds).toEqual(
        ["brave"],
      );
    });

    it("never returns a hidden orientation as earned", () => {
      const context = {
        ...moduleQuizContext,
        result: {
          ...moduleQuizResult,
          answers: [{ questionId: "q5", answerId: "q5-a1" }],
        },
      };

      // q5 gives all it can to both "calm" and the hidden "secret".
      expect(
        resolve({ orientationIds: ["secret", "calm"] }, context)?.earnedIds,
      ).toEqual(["calm"]);
    });
  });

  describe("given a result that earned none of the traits", () => {
    it("returns the catalogue with no earned trait", () => {
      const resolved = resolve(
        { orientationIds: ["calm", "brave"] },
        { ...moduleQuizContext, result: { scores: {}, answers: [] } },
      );

      expect(resolved?.traits).toHaveLength(2);
      expect(resolved?.earnedIds).toEqual([]);
    });
  });

  describe("given a record left with no shown orientation", () => {
    it("returns nothing", () => {
      expect(resolve({ orientationIds: [] })).toBeUndefined();
      expect(resolve({ orientationIds: ["secret"] })).toBeUndefined();
    });
  });
});
