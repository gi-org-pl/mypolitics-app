import {
  ComparisonMode,
  type FriendSide,
  type OrientationSide,
} from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

// A quiz for comparing, with every case of the table "Agreement on a
// question" in it, and the two sides of a comparison. The people are made up.
//
//        a1            a2      a3     taker  friend     with "left"  with the friend
//   q1   left          right          a1     a1         agree        agree
//   q2   left          right   left   a3     a1         agree        disagree
//   q3   left          right          a2     -          disagree     neither
//   q4   -             right          a1     a2         neither      disagree
//   q5   left, hidden  right          -      a1         neither      neither
//
// "hidden" is a hidden orientation, and no answer lists "centre".
export const comparisonQuiz: Survey = createSurvey({
  orientations: [
    createOrientation("left", "Lewica", { color: "#9b59b6" }),
    createOrientation("right", "Prawica"),
    createOrientation("hidden", "Ukryta", { isHidden: true }),
    createOrientation("centre", "Centrum"),
  ],
  questions: [
    createScoredQuestion("q1", [
      [1, ["left"]],
      [1, ["right"]],
    ]),
    createScoredQuestion("q2", [
      [1, ["left"]],
      [1, ["right"]],
      [1, ["left"]],
    ]),
    createScoredQuestion("q3", [
      [1, ["left"]],
      [1, ["right"]],
    ]),
    createScoredQuestion("q4", [
      [1, []],
      [1, ["right"]],
    ]),
    createScoredQuestion("q5", [
      [1, ["left", "hidden"]],
      [1, ["right"]],
    ]),
  ],
});

export const takerAnswers: ResultAnswer[] = [
  { questionId: "q1", answerId: "q1-a1" },
  { questionId: "q2", answerId: "q2-a3" },
  { questionId: "q3", answerId: "q3-a2" },
  { questionId: "q4", answerId: "q4-a1" },
];

// The friend also names an answer q3 does not have and a question the quiz
// does not have: both are ignored.
export const friendAnswers: ResultAnswer[] = [
  { questionId: "q1", answerId: "q1-a1" },
  { questionId: "q2", answerId: "q2-a1" },
  { questionId: "q3", answerId: "q3-a9" },
  { questionId: "q4", answerId: "q4-a2" },
  { questionId: "q5", answerId: "q5-a1" },
  { questionId: "q9", answerId: "q9-a1" },
];

export const FRIEND_ID = "5218cde2-beac-4234-a0a7-c72f46e979a8";

export const friendSide: FriendSide = {
  mode: ComparisonMode.Friend,
  orientation: { id: FRIEND_ID, type: "person", name: "Znajomy" },
  result: { scores: {}, answers: friendAnswers },
};

export const leftSide: OrientationSide = {
  mode: ComparisonMode.Orientation,
  orientation: createOrientation("left", "Lewica", { color: "#9b59b6" }),
};
