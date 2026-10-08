import { describe, expect, it } from "vitest";

import { createSurveyQuestion } from "@/utils/vitest/createSurveyQuestion";

import { getQuestionCounts } from "./getQuestionCounts";

// The answers are q-a1 ... q-a4, from "strongly agree" to "strongly disagree".
const question = createSurveyQuestion("q", [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
]);

const chosen = { "q-a1": 30, "q-a2": 50, "q-a3": 400, "q-a4": 500 };

describe("getQuestionCounts()", () => {
  it("adds strongly agree and agree into for, disagree and strongly disagree into against", () => {
    expect(
      getQuestionCounts(question, { resultsCounted: 980, chosen }),
    ).toMatchObject({ for: 80, against: 900, sample: 980 });
  });

  it("counts what is left of resultsCounted as no answer", () => {
    expect(
      getQuestionCounts(question, { resultsCounted: 1000, chosen }),
    ).toEqual({ for: 80, against: 900, noAnswer: 20, sample: 980 });
    expect(
      getQuestionCounts(question, { resultsCounted: 980, chosen })?.noAnswer,
    ).toBe(0);
  });

  it("reads an answer with no count as zero", () => {
    expect(
      getQuestionCounts(question, {
        resultsCounted: 500,
        chosen: { "q-a3": 400 },
      }),
    ).toEqual({ for: 0, against: 400, noAnswer: 100, sample: 400 });
    expect(
      getQuestionCounts(question, { resultsCounted: 500, chosen: {} }),
    ).toEqual({ for: 0, against: 0, noAnswer: 500, sample: 0 });
  });

  it("ignores a count for an answer the question does not have", () => {
    expect(
      getQuestionCounts(question, {
        resultsCounted: 1000,
        chosen: { ...chosen, "another-answer": 5000, broken: -1.5 },
      }),
    ).toEqual({ for: 80, against: 900, noAnswer: 20, sample: 980 });
  });

  it("returns nothing for a question with a custom answer", () => {
    const withCustom = createSurveyQuestion("q", [
      "Zdecydowanie za",
      "Zdecydowanie przeciw",
      "Nie mam zdania",
    ]);
    const choice = { ...question, answerType: "one-of-many" as const };

    expect(
      getQuestionCounts(withCustom, { resultsCounted: 1000, chosen }),
    ).toBeUndefined();
    expect(
      getQuestionCounts(choice, { resultsCounted: 1000, chosen }),
    ).toBeUndefined();
  });

  it("returns nothing for a count that is negative or not a whole number", () => {
    for (const count of [-1, 2.5, Number.NaN, "30"]) {
      expect(
        getQuestionCounts(question, {
          resultsCounted: 1000,
          chosen: { ...chosen, "q-a1": count as number },
        }),
      ).toBeUndefined();
    }

    for (const resultsCounted of [-1000, 999.5, Number.NaN, "1000"]) {
      expect(
        getQuestionCounts(question, {
          resultsCounted: resultsCounted as number,
          chosen,
        }),
      ).toBeUndefined();
    }
  });

  it("returns nothing when the answers add up to more than resultsCounted", () => {
    expect(
      getQuestionCounts(question, { resultsCounted: 979, chosen }),
    ).toBeUndefined();
  });

  it("returns nothing when resultsCounted is zero", () => {
    expect(
      getQuestionCounts(question, { resultsCounted: 0, chosen: {} }),
    ).toBeUndefined();
  });

  it("returns nothing without counts", () => {
    expect(getQuestionCounts(question)).toBeUndefined();
    expect(
      getQuestionCounts(question, { resultsCounted: 1000 } as never),
    ).toBeUndefined();
  });
});
