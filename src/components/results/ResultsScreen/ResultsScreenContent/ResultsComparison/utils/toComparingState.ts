import { ComparisonMode, type OtherSide } from "@/types/comparison";
import { getAgreementScore } from "@/utils/comparison/getAgreementScore";
import { resolveModules } from "@/utils/result-modules/resolveModules";

import { COMPARISON_VIEWS } from "../ResultsComparison.constants";
import {
  type ComparingState,
  type ComparisonContext,
  ComparisonStatus,
} from "../ResultsComparison.types";

// A comparison that starts: the other side, how much the two agree, and what
// the comparison can show, with its first view shown.
//
// The result of a friend is resolved as the result of the taker is, against
// the leader of the taker: a list tied to the leader then has the rows the
// taker sees, each with the value of the friend. An orientation has no
// result, so nothing is resolved for it.
export const toComparingState = (
  other: OtherSide,
  { survey, result, resolved }: ComparisonContext,
): ComparingState => {
  const views = COMPARISON_VIEWS[other.mode];

  return {
    status: ComparisonStatus.Comparing,
    other,
    score: getAgreementScore(survey, result.answers, other),
    modules:
      other.mode === ComparisonMode.Friend
        ? resolveModules({
            survey,
            result: other.result,
            leader: resolved.leader,
          })
        : undefined,
    views,
    view: views[0],
  };
};
