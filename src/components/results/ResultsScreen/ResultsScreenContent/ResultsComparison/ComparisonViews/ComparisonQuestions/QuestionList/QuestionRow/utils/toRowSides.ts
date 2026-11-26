import takerAvatar from "@/assets/icons/person-avatar-filled.svg";
import { Agreement, type ComparedQuestion } from "@/types/comparison";
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
//
// The answer of the other side that is the taker's comes first, as the
// design draws it, so that it stands on the same line as the answer of the
// taker. The others follow in the order of the question.
export const toRowSides = (
  { answer, otherAnswers }: ComparedQuestion,
  other: Orientation,
  takerName: string,
): RowSide[] => {
  const answers = otherAnswers.map(({ id, text }) => ({
    id,
    text,
    agreement: getQuestionAgreement(answer, [{ id }]),
  }));
  const isShared = ({ agreement }: { agreement: Agreement }) =>
    agreement === Agreement.Agree;

  return [
    {
      id: "other",
      who: other,
      answers: [
        ...answers.filter(isShared),
        ...answers.filter((side) => !isShared(side)),
      ],
    },
    {
      id: "taker",
      who: { name: takerName, imageUrl: takerAvatar },
      answers: answer ? [{ id: answer.id, text: answer.text }] : [],
      isTaker: true,
    },
  ];
};
