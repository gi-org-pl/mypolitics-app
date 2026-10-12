import { describe, expect, it } from "vitest";

import { getEnabledCheckpointTypes } from "@/utils/checkpoint/engine/getEnabledCheckpointTypes";
import { getSessionCheckpoint } from "@/utils/checkpoint/engine/getSessionCheckpoint";

import { createNineQuestionSurvey } from "./createNineQuestionSurvey";
import { createStartedSession } from "./createStartedSession";

const Card = () => null;
const EVERY_TYPE = getEnabledCheckpointTypes({
  stats: Card,
  "new-trait": Card,
  "position-puzzle": Card,
  "nolan-path": Card,
  "axis-closeness": Card,
  "axis-puzzle": Card,
  halfway: Card,
});

describe("createNineQuestionSurvey()", () => {
  it("returns nine questions of one category with two answers each", () => {
    const survey = createNineQuestionSurvey();

    expect(survey.questions.map(({ id }) => id)).toEqual([
      "q1",
      "q2",
      "q3",
      "q4",
      "q5",
      "q6",
      "q7",
      "q8",
      "q9",
    ]);
    expect(
      survey.questions.every(
        ({ categoryId, possibleAnswers }) =>
          categoryId === "economy" && possibleAnswers.length === 2,
      ),
    ).toBe(true);
    expect(survey.averageFinishTime).toBe(9);
  });

  it("applies the overrides", () => {
    expect(createNineQuestionSurvey({ id: "nine" }).id).toBe("nine");
  });

  it("fires the halfway card after the fifth question and no card elsewhere", () => {
    const survey = createNineQuestionSurvey();
    const cards = survey.questions.map((_, index) =>
      getSessionCheckpoint(
        survey,
        createStartedSession(survey, index + 1),
        EVERY_TYPE,
      ),
    );

    expect(cards.map((card) => card?.type)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      "halfway",
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(cards[4]).toMatchObject({ boundary: 5, percent: 55, minutes: 4 });
  });
});
