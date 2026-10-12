import { describe, expect, it } from "vitest";
import { workedQuiz } from "@/utils/running-state/getRunningState.fixtures";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { getFedOrientationIds } from "./getFedOrientationIds";

describe("getFedOrientationIds()", () => {
  it("returns the orientations some possible answer of the quiz lists", () => {
    expect([...getFedOrientationIds(workedQuiz)].sort()).toEqual([
      "x",
      "y",
      "z",
    ]);
  });

  it("leaves out an orientation no question feeds", () => {
    expect(getFedOrientationIds(workedQuiz).has("u")).toBe(false);
  });

  it("leaves out an orientation the quiz does not have", () => {
    const fedIds = getFedOrientationIds({
      ...workedQuiz,
      questions: [createScoredQuestion("q", [[1, ["ghost", "u"]]])],
    });

    expect([...fedIds]).toEqual(["u"]);
  });

  it("counts an orientation only an answer without weight lists as fed", () => {
    const fedIds = getFedOrientationIds({
      ...workedQuiz,
      questions: [createScoredQuestion("q", [[0, ["u"]]])],
    });

    expect(fedIds.has("u")).toBe(true);
  });

  it("returns nothing for a quiz whose questions have no possible answers", () => {
    expect(
      getFedOrientationIds({
        ...workedQuiz,
        questions: [createScoredQuestion("q", [])],
      }).size,
    ).toBe(0);
  });
});
