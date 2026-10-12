import { CHECKPOINT_QUESTIONS } from "./survey-checkpoint.fixture";

// The answer counts of the nine-question quiz, in the shape the source of
// counts sends them. Only the fifth question is counted: of 1000 results, 80
// agree (8%), 620 disagree (62%) and 300 gave no answer (30%). A taker who
// agrees with it is on the rare side, so the stats chart card can fire at the
// boundary after it.

const MS_PER_HOUR = 3_600_000;

export const RARE_QUESTION = CHECKPOINT_QUESTIONS[4];
export const RARE_ANSWER = "Zdecydowanie za";
export const RARE_PERCENT = "8%";
// The card quotes the thesis without its final full stop.
export const RARE_QUOTE = "„Niedziele powinny być wolne od handlu”";
export const COUNTS_DESCRIPTION = "Za: 8%, Przeciw: 62%, Brak odpowiedzi: 30%";

const COUNTS = [20, 60, 300, 320];

// Counts are usable for a day after they were computed, so the reply is dated
// an hour before the moment it is built.
export const createAnswerCounts = () => ({
  computedAt: new Date(Date.now() - MS_PER_HOUR).toISOString(),
  questions: [
    {
      questionId: RARE_QUESTION.id,
      resultsCounted: 1000,
      answers: RARE_QUESTION.possibleAnswers.map(({ id }, index) => ({
        answerId: id,
        count: COUNTS[index],
      })),
    },
  ],
});
