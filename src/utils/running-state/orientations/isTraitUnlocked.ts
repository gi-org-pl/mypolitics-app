import type { DoneQuestion } from "@/types/checkpoint";
import type { Survey } from "@/types/survey";

import { getQuestionMaximums } from "@/utils/running-state/scores/getQuestionMaximums";
import { toWeight } from "@/utils/running-state/scores/toWeight";
import { toKnownOrientationIds } from "./toKnownOrientationIds";

// Whether an orientation of the quiz has scored all it can in the whole quiz:
// at least one question feeds it, every question that feeds it is answered,
// and each of those answers lists it with the highest weight the question has
// for it. A question that is left or skipped rules it out.
export const isTraitUnlocked = (
  traitId: string,
  survey: Pick<Survey, "questions">,
  doneQuestions: readonly DoneQuestion[],
  orientationIds: ReadonlySet<string>,
): boolean => {
  const answersByQuestionId = new Map(
    doneQuestions.map(({ question, answer }) => [question.id, answer]),
  );
  const feedingQuestions = survey.questions.flatMap((question) => {
    const maximum = getQuestionMaximums(question, orientationIds).get(traitId);

    return maximum === undefined ? [] : [{ id: question.id, maximum }];
  });

  return (
    feedingQuestions.length > 0 &&
    feedingQuestions.every(({ id, maximum }) => {
      const answer = answersByQuestionId.get(id);

      return (
        answer !== undefined &&
        toKnownOrientationIds(answer.orientationIds, orientationIds).includes(
          traitId,
        ) &&
        toWeight(answer.weight) === maximum
      );
    })
  );
};
