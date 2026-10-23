import takerAvatar from "@/assets/icons/person-avatar-filled.svg";
import type { ComparedQuestion } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";
import { getQuestionAgreement } from "@/utils/comparison/getQuestionAgreement";

import type { RowSide } from "../QuestionRow.types";

// The two sides of an opened question, in the order they are drawn: the other
// side with every answer it has to the question, then the taker with the one
// they chose.
//
// Each answer of the other side is held up against the answer of the taker
// by the rule a whole question is: it agrees when it is the answer of the
// taker, disagrees when the taker chose another one, and is neither when the
// taker did not answer. The answer of the taker is held up against nothing.
export const toRowSides = (
  { answer, otherAnswers }: ComparedQuestion,
  other: Orientation,
  takerName: string,
): RowSide[] => [
  {
    id: "other",
    who: other,
    answers: otherAnswers.map(({ id, text }) => ({
      id,
      text,
      agreement: getQuestionAgreement(answer, [{ id }]),
    })),
  },
  {
    id: "taker",
    who: { name: takerName, imageUrl: takerAvatar },
    answers: answer ? [{ id: answer.id, text: answer.text }] : [],
    isTaker: true,
  },
];
