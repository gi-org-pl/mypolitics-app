import type { StatsCheckpointCard } from "@/types/checkpoint";
import type {
  SurveyAnswerKind,
  SurveyPossibleAnswer,
  SurveyQuestion,
} from "@/types/survey";
import { getAnswerKind } from "@/utils/survey/getAnswerKind";

const SIDE_BY_KIND: Record<
  SurveyAnswerKind,
  StatsCheckpointCard["side"] | undefined
> = {
  "strongly-agree": "for",
  agree: "for",
  disagree: "against",
  "strongly-disagree": "against",
  custom: undefined,
};

// The side of a thesis a possible answer stands on: for when it agrees,
// against when it disagrees. An answer off the agreement scale has no side.
export const getAnswerSide = (
  question: SurveyQuestion,
  answer: SurveyPossibleAnswer,
): StatsCheckpointCard["side"] | undefined =>
  SIDE_BY_KIND[getAnswerKind(question, answer)];
