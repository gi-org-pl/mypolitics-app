import type { DeclaredGender } from "@/types/orientation";
import type { QuizResult, ResolvedResult } from "@/types/results";
import type { Survey } from "@/types/survey";
import { getLeader } from "@/utils/result-modules/leader/getLeader";
import { resolveHeader } from "@/utils/result-modules/leader/resolveHeader";
import { resolveModule } from "@/utils/result-modules/resolvers/resolveModule";

// What the result screen draws for one result of a quiz: what the header is
// given, the leader the other modules may be tied to, and what every module
// that can be drawn is given, in the order the quiz lists its records. The
// gender is the one declared by the person the result belongs to.
//
// It is derived: the same quiz, result and gender always give the same
// answer, and nothing here fetches, stores or throws. A second result - a
// friend's, in a comparison - is resolved by a second call.
export const resolveResult = (
  survey: Survey,
  result: QuizResult,
  gender?: DeclaredGender,
): ResolvedResult => {
  const header = resolveHeader({ survey, result, gender });
  const leader = getLeader(header);
  const context = { survey, result, gender, leader };

  return {
    leader,
    header,
    modules: survey.resultModules.flatMap(
      (record) => resolveModule(record, context) ?? [],
    ),
  };
};
