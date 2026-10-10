import type { SurveySessionAction } from "@/types/survey";

// A card interrupts the questions: it comes after a done question and before
// an open one. A card handed in at any other moment, or while checkpoints are
// off, is dropped - and so is nothing handed in as a card, which would leave
// the phase with no card to show.
export const showSessionCheckpoint: SurveySessionAction<[card: unknown]> = (
  survey,
  session,
  card,
) => {
  const isCard = card !== undefined && card !== null;
  const isBetweenQuestions =
    session.entries.length > 0 &&
    session.entries.length < survey.questions.length;

  return session.phase === "questions" &&
    isCard &&
    isBetweenQuestions &&
    !session.areCheckpointsOff
    ? {
        ...session,
        phase: "checkpoints",
        checkpointRecord: {
          ...session.checkpointRecord,
          cardsShown: [...session.checkpointRecord.cardsShown, card],
        },
      }
    : session;
};
