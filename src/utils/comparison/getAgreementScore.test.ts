import { describe, expect, it } from "vitest";

import {
  ComparisonMode,
  type FriendSide,
  type OrientationSide,
} from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";

import {
  comparisonQuiz,
  friendSide,
  leftSide,
  takerAnswers,
} from "./comparison.fixtures";
import { getAgreementScore } from "./getAgreementScore";

const withFriend = (answers: ResultAnswer[]): FriendSide => ({
  ...friendSide,
  result: { scores: {}, answers },
});

const withOrientation = (id: string): OrientationSide => ({
  mode: ComparisonMode.Orientation,
  orientation: createOrientation(id),
});

// One question of the quiz, answered by the taker as given.
const scoreOne = (
  takerAnswerId: string | undefined,
  side: FriendSide | OrientationSide,
) =>
  getAgreementScore(
    { questions: [comparisonQuiz.questions[0]] },
    takerAnswerId ? [{ questionId: "q1", answerId: takerAnswerId }] : [],
    side,
  );

describe("getAgreementScore()", () => {
  describe("given a friend", () => {
    it("counts a question both chose the same answer of as agreeing", () => {
      expect(
        scoreOne(
          "q1-a1",
          withFriend([{ questionId: "q1", answerId: "q1-a1" }]),
        ),
      ).toBe(100);
    });

    it("counts a question both answered, differently, as disagreeing", () => {
      expect(
        scoreOne(
          "q1-a1",
          withFriend([{ questionId: "q1", answerId: "q1-a2" }]),
        ),
      ).toBe(0);
    });

    it("counts no question one of them did not answer", () => {
      expect(scoreOne("q1-a1", withFriend([]))).toBeUndefined();
      expect(
        scoreOne(
          undefined,
          withFriend([{ questionId: "q1", answerId: "q1-a1" }]),
        ),
      ).toBeUndefined();
    });

    it("returns the share of agreeing questions among those that agree or disagree", () => {
      // q1 agrees, q2 and q4 disagree, q3 and q5 are neither.
      expect(getAgreementScore(comparisonQuiz, takerAnswers, friendSide)).toBe(
        33,
      );
    });

    it("ignores an answer that names a question or an answer the quiz does not have", () => {
      expect(
        getAgreementScore(
          comparisonQuiz,
          [...takerAnswers, { questionId: "q9", answerId: "q9-a1" }],
          withFriend([
            { questionId: "q1", answerId: "q1-a1" },
            { questionId: "q2", answerId: "q2-a9" },
            { questionId: "q9", answerId: "q9-a1" },
          ]),
        ),
      ).toBe(100);
    });
  });

  describe("given an orientation", () => {
    it("counts a question as agreeing when the answer of the taker lists the orientation", () => {
      expect(scoreOne("q1-a1", withOrientation("left"))).toBe(100);
    });

    it("counts a question as disagreeing when another answer lists the orientation and the one of the taker does not", () => {
      expect(scoreOne("q1-a2", withOrientation("left"))).toBe(0);
    });

    it("counts no question the taker did not answer", () => {
      expect(scoreOne(undefined, withOrientation("left"))).toBeUndefined();
    });

    it("counts no question none of whose answers lists the orientation", () => {
      expect(scoreOne("q1-a1", withOrientation("centre"))).toBeUndefined();
    });

    it("returns the share of agreeing questions among those that agree or disagree", () => {
      // q1 and q2 agree, q3 disagrees, q4 and q5 are neither.
      expect(getAgreementScore(comparisonQuiz, takerAnswers, leftSide)).toBe(
        67,
      );
    });
  });

  describe("given questions of different weights and categories", () => {
    it("counts questions, not points", () => {
      const questions = [
        createScoredQuestion(
          "heavy",
          [
            [100, ["left"]],
            [100, ["right"]],
          ],
          { categoryId: "economy" },
        ),
        createScoredQuestion(
          "light",
          [
            [1, ["left"]],
            [1, ["right"]],
          ],
          { categoryId: "ecology" },
        ),
      ];

      expect(
        getAgreementScore(
          { questions },
          [
            { questionId: "heavy", answerId: "heavy-a1" },
            { questionId: "light", answerId: "light-a2" },
          ],
          withOrientation("left"),
        ),
      ).toBe(50);
    });
  });

  describe("given no question that agrees or disagrees", () => {
    it("returns no score", () => {
      expect(getAgreementScore(comparisonQuiz, [], friendSide)).toBeUndefined();
      expect(
        getAgreementScore(comparisonQuiz, takerAnswers, withFriend([])),
      ).toBeUndefined();
      expect(
        getAgreementScore(
          comparisonQuiz,
          takerAnswers,
          withOrientation("centre"),
        ),
      ).toBeUndefined();
    });
  });
});
