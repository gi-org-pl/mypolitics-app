import { ResultsColumns } from "@/components/results/ResultsColumns/ResultsColumns";

import type { ComparisonViewProps } from "../../ResultsComparison.types";
import { toModulesComparison } from "./utils/toModulesComparison";

// The results view of a comparison with a friend: every module of the taker,
// laid out as on "Your results", with the result of the friend laid over it.
// The header is not part of it: it stays the taker's. A module the result of
// the taker does not draw is not drawn for the friend either, and one that
// fails with the friend laid over it is left out, as on "Your results".
export const ComparisonResults = ({
  resolved,
  comparison,
}: ComparisonViewProps) => (
  <ResultsColumns
    modules={resolved.modules}
    comparison={toModulesComparison(comparison)}
  />
);
