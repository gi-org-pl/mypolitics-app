import {
  ComparisonMode,
  type FriendSide,
  type OrientationSide,
  type OtherSide,
} from "@/types/comparison";
import type { SurveyPossibleAnswer, SurveyQuestion } from "@/types/survey";

import { getFriendAnswers } from "./getFriendAnswers";
import { getOrientationAnswers } from "./getOrientationAnswers";

type OtherAnswersReader<Side extends OtherSide> = (
  question: SurveyQuestion,
  side: Side,
) => SurveyPossibleAnswer[];

// How the answers of the other side to a question are found, by what kind
// the other side is. A new kind of other side is one more row here.
const OTHER_ANSWERS_READERS: {
  [ComparisonMode.Friend]: OtherAnswersReader<FriendSide>;
  [ComparisonMode.Orientation]: OtherAnswersReader<OrientationSide>;
} = {
  [ComparisonMode.Friend]: getFriendAnswers,
  [ComparisonMode.Orientation]: getOrientationAnswers,
};

// The answers of the other side to a question: one lookup in the table by
// the kind of the other side.
export const getOtherAnswers = (
  question: SurveyQuestion,
  side: OtherSide,
): SurveyPossibleAnswer[] => {
  // Each row of the table reads the side of its own kind. A lookup by the
  // kind of a side that can be of either kind cannot carry that pairing, so
  // it is restated here.
  const read = OTHER_ANSWERS_READERS[
    side.mode
  ] as OtherAnswersReader<OtherSide>;

  return read(question, side);
};
